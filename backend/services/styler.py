"""
Style Modification Service.
Handles changing styles (colors, bold, italic) based on matching criteria.
"""
import docx
from docx.shared import RGBColor
from typing import Optional
from .parser import rgb_to_hex, generate_html_preview


def hex_to_rgb(hex_color: str) -> RGBColor:
    """Convert hex color string to RGBColor."""
    hex_color = hex_color.lstrip('#')
    return RGBColor(
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16)
    )


def run_matches_criteria(run, match: dict, para_style: str) -> bool:
    """
    Check if a run matches the given criteria.
    
    Args:
        run: A docx Run object
        match: Dictionary with matching criteria (bold, italic, color, style)
        para_style: The paragraph's style name
        
    Returns:
        True if all specified criteria match
    """
    # Check style (paragraph level)
    if match.get("style") is not None:
        if match["style"].lower() not in para_style.lower():
            return False
    
    # Check bold
    if match.get("bold") is not None:
        if bool(run.bold) != match["bold"]:
            return False
    
    # Check italic
    if match.get("italic") is not None:
        if bool(run.italic) != match["italic"]:
            return False
    
    # Check color
    if match.get("color") is not None:
        run_color = None
        if run.font.color and run.font.color.rgb:
            run_color = rgb_to_hex(run.font.color.rgb)
        
        if run_color is None or run_color.lower() != match["color"].lower():
            return False
    
    return True


def apply_style_to_run(run, apply: dict) -> bool:
    """
    Apply style changes to a run.
    
    Args:
        run: A docx Run object
        apply: Dictionary with styles to apply (bold, italic, underline, color)
        
    Returns:
        True if any change was made
    """
    changed = False
    
    if apply.get("bold") is not None:
        run.bold = apply["bold"]
        changed = True
    
    if apply.get("italic") is not None:
        run.italic = apply["italic"]
        changed = True
    
    if apply.get("underline") is not None:
        run.underline = apply["underline"]
        changed = True
    
    if apply.get("color") is not None:
        run.font.color.rgb = hex_to_rgb(apply["color"])
        changed = True
    
    return changed


def apply_style_changes(doc, changes: list[dict]) -> dict:
    """
    Apply style changes to the document.
    
    Args:
        doc: python-docx Document object
        changes: List of {"match": {...}, "apply": {...}}
        
    Returns:
        Dictionary with change statistics
    """
    total = 0
    affected = set()
    
    # Process body paragraphs
    for i, para in enumerate(doc.paragraphs):
        para_style = para.style.name if para.style else "Normal"
        
        for run in para.runs:
            if not run.text.strip():
                continue
                
            for change in changes:
                if run_matches_criteria(run, change["match"], para_style):
                    if apply_style_to_run(run, change["apply"]):
                        total += 1
                        affected.add(i)
    
    # Process tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    para_style = para.style.name if para.style else "Normal"
                    for run in para.runs:
                        if not run.text.strip():
                            continue
                        for change in changes:
                            if run_matches_criteria(run, change["match"], para_style):
                                if apply_style_to_run(run, change["apply"]):
                                    total += 1
    
    return {
        "total_changes": total,
        "affected_paragraphs": sorted(list(affected)),
        "html_preview": generate_html_preview(doc)
    }
