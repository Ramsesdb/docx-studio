"""
AI Assistant Service.
Integrates with Nexus AI Gateway for natural language document editing suggestions.
"""
import httpx
import os
import json
from typing import Optional


NEXUS_GATEWAY_URL = os.getenv("NEXUS_GATEWAY_URL", "https://api.ramsesdb.tech")
NEXUS_API_KEY = os.getenv("NEXUS_API_KEY", "")


SYSTEM_PROMPT = """You are DocxStudio AI, an assistant that helps users edit Word documents.

When the user describes changes they want to make, respond with a JSON object containing:
1. "replacements": array of {find, replace} pairs for text substitution
2. "style_changes": array of {match, apply} objects for formatting changes
3. "explanation": a brief explanation of what changes you're suggesting

Match criteria can include: bold, italic, color (hex or name), style (heading name)
Apply changes can include: bold, italic, underline, color (hex or name)

Important: You CAN match by color alone without requiring specific text. Do NOT claim you need exact text when the user asks to change by color.

Examples:
- "Change 2025 to 2026" → {"replacements": [{"find": "2025", "replace": "2026"}], ...}
- "Make red text purple" → {"style_changes": [{"match": {"color": "#ff0000"}, "apply": {"color": "#800080"}}], ...}
- "Change all purple text to red" → {"style_changes": [{"match": {"color": "purple"}, "apply": {"color": "red"}}], ...}
- "Remove bold from titles" → {"style_changes": [{"match": {"style": "Heading", "bold": true}, "apply": {"bold": false}}], ...}

Always respond with valid JSON only. No markdown code blocks."""


async def get_ai_suggestion(user_message: str, document_context: Optional[str] = None) -> dict:
    """
    Get AI suggestions for document editing.
    
    Args:
        user_message: The user's natural language request
        document_context: Optional text summary of the document
        
    Returns:
        Dictionary with suggestion and explanation
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    if document_context:
        messages.append({
            "role": "user", 
            "content": f"Document preview:\n{document_context[:2000]}"
        })
    
    messages.append({
        "role": "user",
        "content": user_message
    })
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{NEXUS_GATEWAY_URL}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {NEXUS_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gemini-2.0-flash",
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code != 200:
                return {
                    "suggestion": {"replacements": [], "style_changes": []},
                    "explanation": f"AI service unavailable: {response.status_code}"
                }
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Parse JSON response
            try:
                parsed = json.loads(content)
                return {
                    "suggestion": {
                        "replacements": parsed.get("replacements", []),
                        "style_changes": parsed.get("style_changes", [])
                    },
                    "explanation": parsed.get(
                        "explanation", 
                        "I've prepared the changes based on your request."
                    )
                }
            except json.JSONDecodeError:
                return {
                    "suggestion": {"replacements": [], "style_changes": []},
                    "explanation": content
                }
                
    except httpx.TimeoutException:
        return {
            "suggestion": {"replacements": [], "style_changes": []},
            "explanation": "AI request timed out. Please try again."
        }
    except Exception as e:
        return {
            "suggestion": {"replacements": [], "style_changes": []},
            "explanation": f"Error: {str(e)}"
        }
