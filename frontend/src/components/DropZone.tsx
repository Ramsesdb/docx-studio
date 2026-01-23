'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

interface DropZoneProps {
    onUpload: (file: File) => Promise<void>;
    isLoading: boolean;
}

export default function DropZone({ onUpload, isLoading }: DropZoneProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setError(null);
        const file = acceptedFiles[0];

        if (!file) return;

        if (!file.name.endsWith('.docx')) {
            setError('Only .docx files are supported');
            return;
        }

        try {
            await onUpload(file);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
        disabled: isLoading,
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <div
                    {...getRootProps()}
                    className={`
            glass-card p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-[var(--primary)] bg-[var(--primary)]/10 scale-105' : ''}
            ${isLoading ? 'opacity-50 cursor-wait' : 'hover:border-[var(--primary)]/50'}
          `}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center gap-4">
                        {/* Icon */}
                        <motion.div
                            animate={isDragActive ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center"
                        >
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </motion.div>

                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                {isDragActive ? 'Drop your file' : 'Upload DOCX'}
                            </h2>
                            <p className="text-[var(--muted)]">
                                Drag & drop a Word document, or click to browse
                            </p>
                        </div>

                        {isLoading && (
                            <div className="flex items-center gap-2 text-[var(--primary)]">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Uploading...</span>
                            </div>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 p-4 rounded-lg bg-[var(--error)]/20 border border-[var(--error)] text-[var(--error)] text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
