import { useRef } from 'react';
import './CodeWindow.css';

function CodeWindow({ code, onChange, isExperimentMode = false, readOnly = false }) {

    const textareaRef = useRef(null);
    const lineNumbersRef = useRef(null);

    // Sync scroll between line numbers and textarea
    const handleScroll = () => {
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    // Generate line numbers
    const getLineNumbers = () => {
        const lines = code.split('\n');
        return lines.map((_, index) => index + 1);
    };

    // Handle Tab key for indentation (only when editable)
    const handleKeyDown = (e) => {
        if (readOnly) return;
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            onChange?.(newCode);
            // Move cursor after the tab
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    };

    return (
        <div className="code-window">
            {/* Header with Run Button */}
            <div className="code-header">
                <h2>{isExperimentMode ? 'Auto-Generated Code' : 'Code'}</h2>
                {!isExperimentMode && (
                    <div className="code-header-actions">
                        <button
                            className="example-button"
                            onClick={() => onChange?.(`// Blink an LED on pin 13
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);            // wait for a second
  digitalWrite(ledPin, LOW);
  delay(1000);            // wait for a second
}`)}
                        >
                            Blink Example
                        </button>
                    </div>
                )}
            </div>

            {/* Code Editor Area with Line Numbers */}
            <div className="editor-wrapper">
                <div className="line-numbers" ref={lineNumbersRef}>
                    {getLineNumbers().map((num) => (
                        <div key={num} className="line-number">{num}</div>
                    ))}
                </div>
                <textarea
                    ref={textareaRef}
                    className="code-editor"
                    value={code}
                    onChange={(e) => {
                        if (!readOnly) {
                            onChange?.(e.target.value);
                        }
                    }}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    placeholder="Write your Arduino code here..."
                    readOnly={readOnly}
                />
            </div>

            {/* Status Bar */}
            <div className="status-bar">
                <span>Lines: {code.split('\n').length}</span>
                <span>Characters: {code.length}</span>
            </div>
        </div>
    );
}

export default CodeWindow;