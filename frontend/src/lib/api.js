/**
 * API client for DocxStudio backend
 */

const API_BASE = '/api';

/**
 * Upload a DOCX file
 */
export async function uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
}

/**
 * Replace text in document
 */
export async function replaceText(sessionId, replacements, caseSensitive = false) {
    const response = await fetch(`${API_BASE}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            replacements,
            case_sensitive: caseSensitive
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Replace failed');
    }

    return response.json();
}

/**
 * Change styles in document
 */
export async function changeStyles(sessionId, changes) {
    const response = await fetch(`${API_BASE}/style`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            changes
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Style change failed');
    }

    return response.json();
}

/**
 * Get AI suggestions
 */
export async function getAiSuggestion(sessionId, message) {
    const response = await fetch(`${API_BASE}/ai-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            message
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'AI request failed');
    }

    return response.json();
}

/**
 * Get download URL
 */
export function getDownloadUrl(sessionId) {
    return `${API_BASE}/download/${sessionId}`;
}
