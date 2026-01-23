import json
from typing import Any, Optional

def create_stream_event(event_type: str, data: dict[str, Any]) -> str:
    """
    Generates a Server-Sent Event (SSE) formatted string for the Vercel AI SDK Data Protocol.
    Ensures correct double newline termination.
    """
    return f"data: {json.dumps({'type': event_type, **data})}\n\n"

def create_tool_call_event(tool_call_id: str, tool_name: str, args: dict[str, Any]) -> str:
    """Helper for tool-call events"""
    return create_stream_event("tool-call", {
        "toolCallId": tool_call_id,
        "toolName": tool_name,
        "args": args
    })

def create_tool_result_event(tool_call_id: str, tool_name: str, result: Any) -> str:
    """Helper for tool-result events"""
    return create_stream_event("tool-result", {
        "toolCallId": tool_call_id,
        "toolName": tool_name,
        "result": result
    })

def create_text_delta_event(text: str) -> str:
    """Helper for text-delta events"""
    return create_stream_event("text-delta", {
        "textDelta": text
    })

def create_finish_event(reason: str = "stop") -> str:
    """Helper for finish events"""
    return create_stream_event("finish", {
        "finishReason": reason
    })
