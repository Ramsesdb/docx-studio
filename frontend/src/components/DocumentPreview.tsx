'use client';

import { motion } from 'framer-motion';

interface DocumentPreviewProps {
    htmlPreview: string;
    filename: string;
    stats: {
        total_paragraphs: number;
        total_tables: number;
        unique_styles: string[];
    };
}

export default function DocumentPreview({ htmlPreview, filename, stats }: DocumentPreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card flex flex-col h-full"
        >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold truncate max-w-[200px]">{filename}</h3>
                        <p className="text-sm text-[var(--muted)]">
                            {stats.total_paragraphs} paragraphs • {stats.total_tables} tables
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6">
                <div
                    className="prose prose-invert max-w-none
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-white
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:text-white
            [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:text-white
            [&_p]:mb-3 [&_p]:text-[var(--foreground)]
            [&_strong]:font-bold [&_strong]:text-white
            [&_em]:italic
            [&_u]:underline
          "
                    dangerouslySetInnerHTML={{ __html: htmlPreview }}
                />
            </div>

            {/* Styles Used */}
            <div className="p-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted)] mb-2">Styles detected:</p>
                <div className="flex flex-wrap gap-1">
                    {stats.unique_styles.slice(0, 5).map((style) => (
                        <span
                            key={style}
                            className="px-2 py-1 text-xs rounded-full bg-[var(--border)] text-[var(--muted)]"
                        >
                            {style}
                        </span>
                    ))}
                    {stats.unique_styles.length > 5 && (
                        <span className="px-2 py-1 text-xs text-[var(--muted)]">
                            +{stats.unique_styles.length - 5} more
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
