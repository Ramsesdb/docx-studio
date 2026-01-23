"""
Pydantic models for DocxStudio API.
"""
from pydantic import BaseModel, Field
from typing import Optional


class RunInfo(BaseModel):
    """Information about a text run within a paragraph."""
    text: str
    bold: bool = False
    italic: bool = False
    underline: bool = False
    color: Optional[str] = None
    font_size: Optional[float] = None


class ParagraphInfo(BaseModel):
    """Information about a paragraph in the document."""
    index: int
    text: str
    style: str
    runs: list[RunInfo]


class DocumentStats(BaseModel):
    """Statistics about the uploaded document."""
    total_paragraphs: int
    total_tables: int
    unique_styles: list[str]


class UploadResponse(BaseModel):
    """Response after uploading a document."""
    session_id: str
    filename: str
    paragraphs: list[ParagraphInfo]
    stats: DocumentStats
    html_preview: str


class ReplacementItem(BaseModel):
    """A single find/replace pair."""
    find: str
    replace: str


class ReplaceRequest(BaseModel):
    """Request to replace text in document."""
    session_id: str
    replacements: list[ReplacementItem]
    case_sensitive: bool = False


class ReplaceResponse(BaseModel):
    """Response after replacing text."""
    total_replacements: int
    affected_paragraphs: list[int]
    html_preview: str


class StyleMatch(BaseModel):
    """Criteria to match runs for style changes."""
    bold: Optional[bool] = None
    italic: Optional[bool] = None
    color: Optional[str] = None
    style: Optional[str] = None


class StyleApply(BaseModel):
    """Style properties to apply."""
    bold: Optional[bool] = None
    italic: Optional[bool] = None
    underline: Optional[bool] = None
    color: Optional[str] = None


class StyleChange(BaseModel):
    """A single style change rule."""
    match: StyleMatch
    apply: StyleApply


class StyleRequest(BaseModel):
    """Request to change styles in document."""
    session_id: str
    changes: list[StyleChange]


class StyleResponse(BaseModel):
    """Response after changing styles."""
    total_changes: int
    affected_paragraphs: list[int]
    html_preview: str


class AiSuggestRequest(BaseModel):
    """Request for AI suggestions."""
    session_id: str
    message: str


class AiSuggestion(BaseModel):
    """AI-generated suggestion for document changes."""
    replacements: list[ReplacementItem] = Field(default_factory=list)
    style_changes: list[StyleChange] = Field(default_factory=list)


class AiSuggestResponse(BaseModel):
    """Response with AI suggestion."""
    suggestion: AiSuggestion
    explanation: str
