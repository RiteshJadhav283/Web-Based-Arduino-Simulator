import { useState, useRef, useEffect } from 'react';
import './CodeWindow.css';

function CodeWindow() {
    const [code, setCode] = useState(`const int ledPin = 10;
const int buttonPin = 2;

void setup () {
    pinMode(ledPin, OUTPUT);
    pinMode(buttnPin, INPUT);
}

void loop() {
    if (digitalRead(buttnPin) == HIGH) {
        digitalWrite(ledPin, HIGH);
    }
    else {
        digitalWrite(ledPin, LOW);
    }
}`);

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

    const handleRunCode = () => {
        console.log('Running code:', code);
        alert('Code execution started!');
    };

    // Handle Tab key for indentation
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newCode);
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
                <h2>Code</h2>
                <button className="run-button" onClick={handleRunCode}>
                    <span className="play-icon">▶</span>
                    Run Code
                </button>
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
                    onChange={(e) => setCode(e.target.value)}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    placeholder="Write your Arduino code here..."
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