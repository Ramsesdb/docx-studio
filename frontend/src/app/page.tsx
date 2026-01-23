'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropZone from '@/components/DropZone';
import DocumentPreview from '@/components/DocumentPreview';
import AiChat from '@/components/AiChat';
import { uploadDocument, getDownloadUrl, type UploadResponse } from '@/lib/api';

export default function Home() {
  const [document, setDocument] = useState<UploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const result = await uploadDocument(file);
      setDocument(result);
      showToast(`Loaded ${result.filename} successfully!`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Upload failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePreviewUpdate = useCallback(async () => {
    // Re-fetch preview after AI makes changes
    if (!document) return;
    try {
      const result = await uploadDocument(new File([], document.filename)); // Would need to re-fetch
      // For now, we'll just show a toast - full implementation would re-fetch the preview
      showToast('Document updated!');
    } catch {
      // Silently fail - preview will be stale but download will have changes
    }
  }, [document]);

  const handleDownload = () => {
    if (document) {
      window.open(getDownloadUrl(document.session_id), '_blank');
    }
  };

  const handleReset = () => {
    setDocument(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-xl font-bold">DocxStudio</h1>
          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/20 text-[var(--primary)]">
            v2.0
          </span>
        </div>

        {document && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)] transition-colors"
            >
              ✕ New
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              ⬇ Download
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {!document ? (
          <DropZone onUpload={handleUpload} isLoading={isLoading} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
            <DocumentPreview
              htmlPreview={document.html_preview}
              filename={document.filename}
              stats={document.stats}
            />
            <AiChat
              sessionId={document.session_id}
              onPreviewUpdate={handlePreviewUpdate}
            />
          </div>
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg ${toast.type === 'success'
                ? 'bg-[var(--success)] text-white'
                : 'bg-[var(--error)] text-white'
              }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
