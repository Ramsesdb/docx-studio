from pydantic import BaseModel, Field
from typing import Optional, List

class ReplaceTextTool(BaseModel):
    """
    Find and replace text in the document.
    """
    find: str = Field(..., description="The text to search for")
    replace: str = Field(..., description="The text to replace it with")
    case_sensitive: bool = Field(False, description="Whether the search should be case sensitive")

class ChangeStyleTool(BaseModel):
    """
    Modify formatting of matching text runs.
    """
    match_bold: Optional[bool] = Field(None, description="Match text that is bold (true) or not bold (false)")
    match_italic: Optional[bool] = Field(None, description="Match text that is italic (true) or not italic (false)")
    match_color: Optional[str] = Field(None, description="Match text with this hex color (e.g. #FF0000)")
    match_text: Optional[str] = Field(None, description="Only apply to runs containing this text")
    
    apply_color: Optional[str] = Field(None, description="Apply this hex color")
    apply_bold: Optional[bool] = Field(None, description="Apply bold formatting")
    apply_italic: Optional[bool] = Field(None, description="Apply italic formatting")
    apply_underline: Optional[bool] = Field(None, description="Apply underline formatting")

class GetDocumentStatsTool(BaseModel):
    """
    Get statistics about the current document.
    """
    pass

# Registry of available tools for the LLM
AVAILABLE_TOOLS = {
    "replace_text": ReplaceTextTool,
    "change_style": ChangeStyleTool,
    "get_document_stats": GetDocumentStatsTool
}
