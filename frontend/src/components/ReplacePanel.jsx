import { useState } from 'react';

export default function ReplacePanel({ onReplace, isLoading, disabled }) {
    const [replacements, setReplacements] = useState([{ find: '', replace: '' }]);
    const [caseSensitive, setCaseSensitive] = useState(false);

    const addReplacement = () => {
        setReplacements([...replacements, { find: '', replace: '' }]);
    };

    const removeReplacement = (index) => {
        if (replacements.length > 1) {
            setReplacements(replacements.filter((_, i) => i !== index));
        }
    };

    const updateReplacement = (index, field, value) => {
        const updated = [...replacements];
        updated[index][field] = value;
        setReplacements(updated);
    };

    const handleApply = () => {
        const validReplacements = replacements.filter(r => r.find.trim());
        if (validReplacements.length > 0) {
            onReplace(validReplacements, caseSensitive);
        }
    };

    const hasValidInput = replacements.some(r => r.find.trim());

    return (
        <div className="panel">
            <div className="panel-header">
                <h3>
                    <span>🔍</span>
                    <span>Find & Replace</span>
                </h3>
            </div>

            <div className="panel-content">
                <div className="replacement-list">
                    {replacements.map((rep, index) => (
                        <div key={index} className="replacement-item">
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                {index === 0 && <label className="input-label">Find</label>}
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Text to find..."
                                    value={rep.find}
                                    onChange={(e) => updateReplacement(index, 'find', e.target.value)}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                {index === 0 && <label className="input-label">Replace</label>}
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Replace with..."
                                    value={rep.replace}
                                    onChange={(e) => updateReplacement(index, 'replace', e.target.value)}
                                    disabled={disabled}
                                />
                            </div>
                            <button
                                className="btn-remove"
                                onClick={() => removeReplacement(index)}
                                disabled={replacements.length === 1 || disabled}
                                title="Remove"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    className="btn-add"
                    onClick={addReplacement}
                    disabled={disabled}
                >
                    + Add another replacement
                </button>

                <div className="checkbox-row">
                    <input
                        type="checkbox"
                        id="caseSensitive"
                        checked={caseSensitive}
                        onChange={(e) => setCaseSensitive(e.target.checked)}
                        disabled={disabled}
                    />
                    <label htmlFor="caseSensitive">Case sensitive</label>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={handleApply}
                    disabled={disabled || isLoading || !hasValidInput}
                >
                    {isLoading ? (
                        <>
                            <div className="spinner"></div>
                            <span>Applying...</span>
                        </>
                    ) : (
                        'Apply Replacements'
                    )}
                </button>
            </div>
        </div>
    );
}
