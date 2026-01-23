import { useState } from 'react';

const COLOR_PRESETS = [
    { name: 'Red', value: '#ff0000' },
    { name: 'Blue', value: '#0000ff' },
    { name: 'Green', value: '#00ff00' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#ff8000' },
    { name: 'Cyan', value: '#00ffff' },
];

export default function StylePanel({ onStyleChange, isLoading, disabled }) {
    const [matchBold, setMatchBold] = useState(false);
    const [matchItalic, setMatchItalic] = useState(false);
    const [matchColor, setMatchColor] = useState('');

    const [applyBold, setApplyBold] = useState(null);
    const [applyItalic, setApplyItalic] = useState(null);
    const [applyColor, setApplyColor] = useState('');

    const handleApply = () => {
        const match = {};
        const apply = {};

        if (matchBold) match.bold = true;
        if (matchItalic) match.italic = true;
        if (matchColor) match.color = matchColor;

        if (applyBold !== null) apply.bold = applyBold;
        if (applyItalic !== null) apply.italic = applyItalic;
        if (applyColor) apply.color = applyColor;

        if (Object.keys(match).length > 0 && Object.keys(apply).length > 0) {
            onStyleChange([{ match, apply }]);
        }
    };

    const hasValidChange = (matchBold || matchItalic || matchColor) &&
        (applyBold !== null || applyItalic !== null || applyColor);

    return (
        <div className="panel">
            <div className="panel-header">
                <h3>
                    <span>🎨</span>
                    <span>Change Styles</span>
                </h3>
            </div>

            <div className="panel-content">
                <div className="input-label">Match runs with:</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <div className="checkbox-row" style={{ marginTop: 0 }}>
                        <input
                            type="checkbox"
                            id="matchBold"
                            checked={matchBold}
                            onChange={(e) => setMatchBold(e.target.checked)}
                            disabled={disabled}
                        />
                        <label htmlFor="matchBold">Bold</label>
                    </div>
                    <div className="checkbox-row" style={{ marginTop: 0 }}>
                        <input
                            type="checkbox"
                            id="matchItalic"
                            checked={matchItalic}
                            onChange={(e) => setMatchItalic(e.target.checked)}
                            disabled={disabled}
                        />
                        <label htmlFor="matchItalic">Italic</label>
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Match color</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {COLOR_PRESETS.map(color => (
                            <button
                                key={color.value}
                                onClick={() => setMatchColor(matchColor === color.value ? '' : color.value)}
                                disabled={disabled}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    background: color.value,
                                    border: matchColor === color.value ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />

                <div className="input-label">Apply changes:</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <select
                        value={applyBold === null ? '' : applyBold ? 'true' : 'false'}
                        onChange={(e) => setApplyBold(e.target.value === '' ? null : e.target.value === 'true')}
                        disabled={disabled}
                        className="input-field"
                        style={{ flex: 1 }}
                    >
                        <option value="">Bold: No change</option>
                        <option value="true">Bold: Add</option>
                        <option value="false">Bold: Remove</option>
                    </select>
                    <select
                        value={applyItalic === null ? '' : applyItalic ? 'true' : 'false'}
                        onChange={(e) => setApplyItalic(e.target.value === '' ? null : e.target.value === 'true')}
                        disabled={disabled}
                        className="input-field"
                        style={{ flex: 1 }}
                    >
                        <option value="">Italic: No change</option>
                        <option value="true">Italic: Add</option>
                        <option value="false">Italic: Remove</option>
                    </select>
                </div>

                <div className="input-group">
                    <label className="input-label">Apply color</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {COLOR_PRESETS.map(color => (
                            <button
                                key={color.value}
                                onClick={() => setApplyColor(applyColor === color.value ? '' : color.value)}
                                disabled={disabled}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    background: color.value,
                                    border: applyColor === color.value ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={handleApply}
                    disabled={disabled || isLoading || !hasValidChange}
                >
                    {isLoading ? (
                        <>
                            <div className="spinner"></div>
                            <span>Applying...</span>
                        </>
                    ) : (
                        'Apply Style Changes'
                    )}
                </button>
            </div>
        </div>
    );
}
