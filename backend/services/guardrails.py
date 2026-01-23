import re

SUSPICIOUS_PATTERNS = [
    r"ignore\s+(previous|all|these|above|your)\s+(instructions|rules|prompt)",
    r"forget\s+(everything|your|all)",
    r"you\s+are\s+now\s+(a|an|the)",
    r"pretend\s+(to\s+be|you're|you\s+are)",
    r"reveal\s+(your|the)\s+(system|initial)\s+prompt",
    r"what\s+(are|is)\s+your\s+(instructions|rules|system\s+prompt)",
    r"act\s+as\s+(if|a|an)",
    r"jailbreak",
]

def contains_suspicious_patterns(text: str) -> bool:
    """Check if text contains potential prompt injection attempts"""
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def sanitize_input(text: str) -> str:
    """Clean user input"""
    # Truncate reasonably large input
    text = text[:5000]
    # Remove null bytes and control characters
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    return text.strip()
