const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UploadResponse {
    session_id: string;
    filename: string;
    html_preview: string;
    stats: {
        total_paragraphs: number;
        total_tables: number;
        unique_styles: string[];
    };
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
}

export async function getPreview(sessionId: string): Promise<string> {
    const response = await fetch(`${API_BASE}/api/preview/${sessionId}`);
    if (!response.ok) throw new Error('Failed to get preview');
    const data = await response.json();
    return data.html_preview;
}

export function getDownloadUrl(sessionId: string): string {
    return `${API_BASE}/api/download/${sessionId}`;
}
