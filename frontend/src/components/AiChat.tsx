'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface AiChatProps {
    sessionId: string;
    onPreviewUpdate?: () => void;
}

export default function AiChat({ sessionId, onPreviewUpdate }: AiChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'ready' | 'streaming' | 'error'>('ready');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const isLoading = status === 'streaming';

    // Auto-scroll to new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        // Abort previous request if any
        if (status === 'streaming') {
            abortControllerRef.current?.abort();
        }

        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setStatus('streaming');

        // Create assistant message placeholder
        const assistantId = `assistant-${Date.now()}`;
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

        try {
            abortControllerRef.current = new AbortController();

            // Prepare request - simple format for our Python backend
            const allMessages = [...messages, userMessage].map(m => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: allMessages,
                    session_id: sessionId
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';
            let shouldStop = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done || shouldStop) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);

                        // Handle different event types from Python backend
                        if (parsed.type === 'finish') {
                            shouldStop = true;
                            try {
                                await reader.cancel();
                            } catch (_) {
                                // ignore cancel errors
                            }
                            setStatus('ready');
                            continue;
                        }

                        if (parsed.type === 'text-delta' && parsed.textDelta) {
                            fullContent += parsed.textDelta;
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === assistantId ? { ...m, content: fullContent } : m
                                )
                            );
                        } else if (parsed.type === 'tool-result') {
                            // Trigger preview update when tool completes
                            if (parsed.result?.preview_update_needed) {
                                onPreviewUpdate?.();
                            }
                        } else if (parsed.type === 'error') {
                            throw new Error(parsed.errorText || 'Stream error');
                        }
                    } catch (e) {
                        if (e instanceof SyntaxError) continue;
                        throw e;
                    }
                }
            }

            setStatus('ready');
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                setStatus('ready');
                return;
            }
            if (error instanceof Error && error.message.toLowerCase().includes('aborted')) {
                setStatus('ready');
                return;
            }
            console.error('[Chat] Error:', error);
            setStatus('error');
            // Remove empty assistant message on error
            setMessages(prev => prev.filter(m => m.id !== assistantId));
        }
    }, [messages, status, sessionId, onPreviewUpdate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const stop = () => {
        abortControllerRef.current?.abort();
        setStatus('ready');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card flex flex-col h-full"
        >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold">AI Editor</h3>
                        <p className="text-sm text-[var(--muted)]">Describe your changes</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-[var(--muted)] py-8">
                        <p className="mb-2">👋 Hi! Describe what you want to edit.</p>
                        <p className="text-sm">Try: &quot;Replace 2025 with 2026&quot; or &quot;Make headings blue&quot;</p>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {messages.map((message) => {
                        const isAssistant = message.role === 'assistant';
                        const isEmptyAssistant = isAssistant && !message.content.trim();

                        if (isEmptyAssistant && status !== 'streaming') return null;

                        return (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-[var(--card-hover)] text-[var(--foreground)]'
                                        } ${isAssistant && isLoading ? 'opacity-80' : ''}`}
                                >
                                    {isEmptyAssistant ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-[var(--muted)] animate-pulse blur-[0.5px]">
                                                Pensando...
                                            </span>
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {status === 'error' && (
                    <div className="text-center text-[var(--error)] text-sm py-2">
                        Something went wrong. Please try again.
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)]" aria-busy={isLoading}>
                <div className={`flex gap-2 ${isLoading ? 'opacity-80' : ''}`}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What would you like to change?"
                        disabled={isLoading}
                        readOnly={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl bg-[var(--card-hover)] border border-[var(--border)] 
              text-[var(--foreground)] placeholder-[var(--muted)]
              focus:outline-none focus:border-[var(--primary)] transition-colors
              disabled:opacity-50"
                    />
                    {isLoading ? (
                        <button
                            type="button"
                            onClick={stop}
                            className="px-6 py-3 rounded-xl bg-[var(--error)]/20 border border-[var(--error)] text-[var(--error)]
                hover:bg-[var(--error)]/30 transition-colors"
                        >
                            Stop
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium
                hover:bg-[var(--primary-hover)] transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    )}
                </div>
            </form>
        </motion.div>
    );
}
