import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function DropZone({ onUpload, isLoading }) {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
        disabled: isLoading
    });

    return (
        <div
            {...getRootProps()}
            className={`dropzone-container ${isDragActive ? 'active' : ''}`}
        >
            <input {...getInputProps()} />

            <div className="dropzone-icon">📄</div>

            {isLoading ? (
                <>
                    <div className="dropzone-title">Processing...</div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                        <div className="spinner"></div>
                    </div>
                </>
            ) : isDragActive ? (
                <div className="dropzone-title">Drop your file here!</div>
            ) : (
                <>
                    <div className="dropzone-title">Drop a .docx file here</div>
                    <div className="dropzone-subtitle">or click to browse</div>
                </>
            )}
        </div>
    );
}
