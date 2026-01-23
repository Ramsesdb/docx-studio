import { useState, useEffect } from 'react';

export default function AiChat({ onSuggestion, onApplySuggestion, isLoading, disabled }) {
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [lastSuggestion, setLastSuggestion] = useState(null);

    // Load history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('docxstudio_chat_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load chat history');
            }
        }
    }, []);

    // Save history to localStorage
    useEffect(() => {
        localStorage.setItem('docxstudio_chat_history', JSON.stringify(history.slice(-20)));
    }, [history]);

    const handleSend = async () => {
        if (!message.trim() || disabled) return;

        const userMessage = { role: 'user', content: message };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');

        try {
            const response = await onSuggestion(message);

            const assistantMessage = {
                role: 'assistant',
                content: response.explanation,
                suggestion: response.suggestion
            };
            setHistory(prev => [...prev, assistantMessage]);
            setLastSuggestion(response.suggestion);
        } catch (error) {
            const errorMessage = { role: 'assistant', content: `Error: ${error.message}` };
            setHistory(prev => [...prev, errorMessage]);
        }
    };

    const handleApply = () => {
        if (lastSuggestion) {
            onApplySuggestion(lastSuggestion);
            setLastSuggestion(null);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearHistory = () => {
        setHistory([]);
        setLastSuggestion(null);
        localStorage.removeItem('docxstudio_chat_history');
    };

    return (
        <div className="panel">
            <div className="panel-header">
                <h3>
                    <span>🤖</span>
                    <span>AI Assistant</span>
                </h3>
                {history.length > 0 && (
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                        onClick={clearHistory}
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="panel-content">
                <div className="chat-messages">
                    {history.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Ask me to edit your document!<br />
                            <span style={{ opacity: 0.7 }}>e.g., "Change 2025 to 2026"</span>
                        </div>
                    )}
                    {history.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.role}`}>
                            {msg.content}
                        </div>
                    ))}
                </div>

                {lastSuggestion && (
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '14px' }}
                        onClick={handleApply}
                        disabled={isLoading}
                    >
                        ✓ Apply Suggestion
                    </button>
                )}

                <div className="chat-input-row">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Describe what to change..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={disabled || isLoading}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleSend}
                        disabled={disabled || isLoading || !message.trim()}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {isLoading ? <div className="spinner"></div> : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}
