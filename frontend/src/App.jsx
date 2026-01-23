import { useState } from 'react';
import DropZone from './components/DropZone';
import DocumentPreview from './components/DocumentPreview';
import ReplacePanel from './components/ReplacePanel';
import StylePanel from './components/StylePanel';
import AiChat from './components/AiChat';
import {
    uploadDocument,
    replaceText,
    changeStyles,
    getAiSuggestion,
    getDownloadUrl
} from './lib/api';

function App() {
    const [document, setDocument] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [htmlPreview, setHtmlPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleUpload = async (file) => {
        setIsLoading(true);
        try {
            const result = await uploadDocument(file);
            setDocument(result);
            setSessionId(result.session_id);
            setHtmlPreview(result.html_preview);
            showToast(`Loaded ${result.filename} successfully!`);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReplace = async (replacements, caseSensitive) => {
        if (!sessionId) return;
        setIsLoading(true);
        try {
            const result = await replaceText(sessionId, replacements, caseSensitive);
            setHtmlPreview(result.html_preview);
            showToast(`Made ${result.total_replacements} replacement(s)`);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStyleChange = async (changes) => {
        if (!sessionId) return;
        setIsLoading(true);
        try {
            const result = await changeStyles(sessionId, changes);
            setHtmlPreview(result.html_preview);
            showToast(`Changed ${result.total_changes} style(s)`);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiSuggestion = async (message) => {
        if (!sessionId) return;
        return await getAiSuggestion(sessionId, message);
    };

    const handleApplySuggestion = async (suggestion) => {
        if (!sessionId) return;
        setIsLoading(true);
        try {
            let totalChanges = 0;

            if (suggestion.replacements?.length > 0) {
                const result = await replaceText(sessionId, suggestion.replacements, false);
                totalChanges += result.total_replacements;
                setHtmlPreview(result.html_preview);
            }

            if (suggestion.style_changes?.length > 0) {
                const result = await changeStyles(sessionId, suggestion.style_changes);
                totalChanges += result.total_changes;
                setHtmlPreview(result.html_preview);
            }

            showToast(`Applied ${totalChanges} AI-suggested change(s)`);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (sessionId) {
            window.open(getDownloadUrl(sessionId), '_blank');
        }
    };

    const handleReset = () => {
        setDocument(null);
        setSessionId(null);
        setHtmlPreview('');
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-logo">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <rect width="100" height="100" rx="20" fill="url(#logoGrad)" />
                        <text x="50" y="68" fontFamily="Arial Black" fontSize="50" fill="white" textAnchor="middle" fontWeight="bold">D</text>
                    </svg>
                    <h1>DocxStudio</h1>
                </div>

                <div className="header-actions">
                    {document && (
                        <>
                            <button className="btn btn-secondary" onClick={handleReset}>
                                ✕ New Document
                            </button>
                            <button className="btn btn-primary" onClick={handleDownload}>
                                ⬇ Download
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content */}
            {!document ? (
                <DropZone onUpload={handleUpload} isLoading={isLoading} />
            ) : (
                <div className="main-layout">
                    {/* Left: Document Preview */}
                    <DocumentPreview
                        document={document}
                        htmlPreview={htmlPreview}
                    />

                    {/* Right: Editing Panels */}
                    <div className="sidebar">
                        <ReplacePanel
                            onReplace={handleReplace}
                            isLoading={isLoading}
                            disabled={!sessionId}
                        />

                        <StylePanel
                            onStyleChange={handleStyleChange}
                            isLoading={isLoading}
                            disabled={!sessionId}
                        />

                        <AiChat
                            onSuggestion={handleAiSuggestion}
                            onApplySuggestion={handleApplySuggestion}
                            isLoading={isLoading}
                            disabled={!sessionId}
                        />
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default App;
