"""
DocxStudio Backend - FastAPI Application V2.0
Handles persistent sessions, file-based editing, and streaming AI responses.
"""
import uuid
import os
import shutil
import json
import asyncio
import httpx
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

import docx
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse

try:
    from services.parser import parse_document, generate_html_preview
    from services.editor import replace_in_document
    from services.styler import apply_style_changes
    from services.tools import AVAILABLE_TOOLS, ReplaceTextTool, ChangeStyleTool, GetDocumentStatsTool
    from services.guardrails import sanitize_input, contains_suspicious_patterns
    from utils.streamer import create_stream_event, create_tool_call_event, create_tool_result_event, create_text_delta_event, create_finish_event
except ImportError:
    # Fallback for when running without full structure (e.g. tests)
    pass

# Configuration
TEMP_DIR = Path("temp")
SESSION_TTL_MINUTES = 60
NEXUS_GATEWAY_URL = os.getenv("NEXUS_GATEWAY_URL", "https://api.ramsesdb.tech")
NEXUS_API_KEY = os.getenv("NEXUS_API_KEY", "")

# In-memory session metadata (the actual files are in TEMP_DIR)
# session_id -> { filename, created_at, last_accessed }
sessions: Dict[str, Dict[str, Any]] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cleanup temp files on startup and shutdown"""
    # Startup: ensure temp dir exists
    TEMP_DIR.mkdir(exist_ok=True)
    yield
    # Shutdown: Clean all temp files
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
        TEMP_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="DocxStudio API",
    description="Agentic DOCX Editor",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Functions ---

def get_session_dir(session_id: str) -> Path:
    return TEMP_DIR / session_id

def cleanup_old_sessions():
    """Delete expired sessions from disk and memory"""
    now = datetime.utcnow()
    expired = []
    
    for sid, data in sessions.items():
        if now - data["last_accessed"] > timedelta(minutes=SESSION_TTL_MINUTES):
            expired.append(sid)
            
    for sid in expired:
        # Remove metadata
        del sessions[sid]
        # Remove files
        s_dir = get_session_dir(sid)
        if s_dir.exists():
            try:
                shutil.rmtree(s_dir)
            except Exception as e:
                print(f"Error cleaning session {sid}: {e}")

async def execute_tool_locally(tool_name: str, args: dict, session_id: str) -> dict:
    """Execute the tool on the persistent file"""
    session_dir = get_session_dir(session_id)
    doc_path = session_dir / "document.docx"
    
    if not doc_path.exists():
         return {"success": False, "error": "Document not found"}

    try:
        # Load document
        doc = docx.Document(str(doc_path))
        result_data = {}
        
        if tool_name == "replace_text":
            replacements = [{"find": args["find"], "replace": args["replace"]}]
            case_sensitive = args.get("case_sensitive", False)
            stats = replace_in_document(doc, replacements, case_sensitive)
            
            result_data = {
                "success": True,
                "action": "replaced",
                "count": stats["total_replacements"],
                "affected_paragraphs": stats["affected_paragraphs"],
                # V2.0: In a real implementation, we'd generate a diff snippet here
                "preview_update_needed": True 
            }
            
        elif tool_name == "change_style":
            # Construct matching/apply dicts from args
            match = {}
            if args.get("match_bold") is not None: match["bold"] = args["match_bold"]
            if args.get("match_italic") is not None: match["italic"] = args["match_italic"]
            if args.get("match_color"): match["color"] = args["match_color"]
            if args.get("match_text"): match["text"] = args["match_text"] # Logic needs to be added to styler
            
            apply = {}
            if args.get("apply_color"): apply["color"] = args["apply_color"]
            if args.get("apply_bold") is not None: apply["bold"] = args["apply_bold"]
            if args.get("apply_italic") is not None: apply["italic"] = args["apply_italic"]
            if args.get("apply_underline") is not None: apply["underline"] = args["apply_underline"]
            
            changes = [{"match": match, "apply": apply}]
            stats = apply_style_changes(doc, changes)
            
            result_data = {
                 "success": True,
                 "action": "styled",
                 "count": stats["total_changes"],
                 "affected_paragraphs": stats["affected_paragraphs"],
                 "preview_update_needed": True
            }

        elif tool_name == "get_document_stats":
            # Just return stats, no save needed
            input_bytes = doc_path.read_bytes()
            parsed = parse_document(input_bytes)
            return {"success": True, "stats": parsed["stats"]}
            
        else:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}

        # Save changes if we modified the doc
        if result_data.get("success") and tool_name != "get_document_stats":
            doc.save(str(doc_path))
            
        return result_data

    except Exception as e:
        return {"success": False, "error": str(e)}

# --- Endpoints ---

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Uploads file to temp storage and creates session"""
    if not file.filename.endswith('.docx'):
        raise HTTPException(400, "Only .docx files are supported")
        
    cleanup_old_sessions()
    
    session_id = str(uuid.uuid4())
    session_dir = get_session_dir(session_id)
    session_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = session_dir / "document.docx"
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Read for parsing
    content = file_path.read_bytes()
    try:
        parsed = parse_document(content)
    except Exception as e:
         shutil.rmtree(session_dir)
         raise HTTPException(400, f"Parse error: {e}")
         
    sessions[session_id] = {
        "filename": file.filename,
        "created_at": datetime.utcnow(),
        "last_accessed": datetime.utcnow()
    }
    
    return {
        "session_id": session_id,
        "filename": file.filename,
        "html_preview": parsed["html_preview"],
        "stats": parsed["stats"]
    }

@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    """
    Agentic streaming endpoint.
    1. Analyzes user request
    2. Calls Nexus for tool usage
    3. Executes tools locally
    4. Streams results + diffs back to frontend
    """
    try:
        body = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON")
        
    messages = body.get("messages", [])
    session_id = body.get("session_id") # We need session_id to know which file to edit
    
    if not session_id or session_id not in sessions:
        # If no session, maybe it's just a general chat? Or error?
        # For DocxStudio, session is mandatory for editing
        # But let's allow basic chat if no session provided (optional)
        pass 
        
    if session_id and session_id not in sessions:
         raise HTTPException(404, "Session expired or invalid")

    last_user_Message = messages[-1]["content"] if messages else ""
    
    # Security Check
    if contains_suspicious_patterns(last_user_Message):
         return JSONResponse({"error": "Request rejected by security guardrails"}, status=403)
         
    clean_message = sanitize_input(last_user_Message)
    
    # Refresh session TTL
    if session_id:
        sessions[session_id]["last_accessed"] = datetime.utcnow()

    async def event_generator():
        yield create_stream_event("start", {})
        
        # 1. Call Nexus with Tools definitions
        # Prepare tools schema for OpenAI-compatible API
        tools_schema = [
            {
                "type": "function",
                "function": {
                    "name": t_name,
                    "description": t_cls.__doc__.strip() if t_cls.__doc__ else "",
                    "parameters": t_cls.model_json_schema()
                }
            }
            for t_name, t_cls in AVAILABLE_TOOLS.items()
        ]
        
        # System Prompt
        system_msg = {
            "role": "system", 
            "content": "You are DocxStudio AI. You help users edit DOCX files. Use the provided tools to make changes. When you use a tool, explain what you are doing briefly."
        }
        
        api_messages = [system_msg] + [
            {"role": m["role"], "content": m["content"]} 
            for m in messages if m["role"] in ["user", "assistant"]
        ]
        
        try:
            yield create_text_delta_event("Thinking...\n")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{NEXUS_GATEWAY_URL}/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {NEXUS_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gemini-2.0-flash", # or gpt-4o-mini
                        "messages": api_messages,
                        "tools": tools_schema,
                        "tool_choice": "auto"
                    }
                )
                
                if response.status_code != 200:
                    yield create_text_delta_event(f"Error calling AI: {response.text}")
                    yield create_finish_event("error")
                    return

                # Parse non-streaming response to see intent
                data = response.json()
                choice = data["choices"][0]
                message = choice["message"]
                
                # Check for tool call
                if message.get("tool_calls"):
                    tool_calls = message["tool_calls"]
                    
                    for tc in tool_calls:
                        func = tc["function"]
                        t_name = func["name"]
                        t_args_str = func["arguments"]
                        t_call_id = tc["id"]
                        
                        try:
                            t_args = json.loads(t_args_str)
                        except:
                            t_args = {}
                            
                        # Inform client we are calling a tool
                        yield create_tool_call_event(t_call_id, t_name, t_args)
                        
                        # Execute locally!
                        if session_id:
                            yield create_text_delta_event(f"Executing {t_name}...\n")
                            result = await execute_tool_locally(t_name, t_args, session_id)
                        else:
                            result = {"success": False, "error": "No session ID provided"}
                            
                        # Inform client of result
                        yield create_tool_result_event(t_call_id, t_name, result)
                        
                        if result.get("success"):
                             if result.get("count", 0) > 0:
                                 yield create_text_delta_event(f"✅ Successfully made {result['count']} changes.\n")
                             else:
                                 yield create_text_delta_event("⚠️ No changes were made (no matches found).\n")
                        else:
                             yield create_text_delta_event(f"❌ Error: {result.get('error')}\n")

                else:
                    # Just text response
                    yield create_text_delta_event(message.get("content", ""))
                    
        except Exception as e:
            yield create_text_delta_event(f"\nInternal Error: {str(e)}")
            
        yield create_finish_event()
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/download/{session_id}")
async def download_document(session_id: str):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")
        
    file_path = get_session_dir(session_id) / "document.docx"
    if not file_path.exists():
        raise HTTPException(404, "File missing")
        
    filename = sessions[session_id]["filename"].replace(".docx", "_edited.docx")
    
    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=filename
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
