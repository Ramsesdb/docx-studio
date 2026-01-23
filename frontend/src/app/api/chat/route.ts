/**
 * Chat API Route - Proxies to Python Backend
 * Transforms Python SSE to AI SDK v6 format
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, session_id } = body;

        // Proxy to Python backend
        const backendResponse = await fetch(`${BACKEND_URL}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                session_id,
            }),
        });

        if (!backendResponse.ok) {
            return new Response(
                JSON.stringify({ error: `Backend error: ${backendResponse.status}` }),
                { status: backendResponse.status }
            );
        }

        // Stream the response directly
        // The Python backend already sends in AI SDK v6 format
        return new Response(backendResponse.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('[Chat Route Error]', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
}
