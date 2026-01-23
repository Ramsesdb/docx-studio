export default function DocumentPreview({ document, htmlPreview }) {
    if (!document) return null;

    return (
        <div className="preview-container">
            <div className="preview-header">
                <div className="preview-title">
                    <span>📄</span>
                    <span>{document.filename}</span>
                </div>
            </div>

            <div className="stats-bar">
                <div className="stat-item">
                    <span>Paragraphs:</span>
                    <span className="stat-value">{document.stats.total_paragraphs}</span>
                </div>
                <div className="stat-item">
                    <span>Tables:</span>
                    <span className="stat-value">{document.stats.total_tables}</span>
                </div>
                <div className="stat-item">
                    <span>Styles:</span>
                    <span className="stat-value">{document.stats.unique_styles.length}</span>
                </div>
            </div>

            <div
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
        </div>
    );
}
