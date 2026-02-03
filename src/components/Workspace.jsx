import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import './Workspace.css';
import ArduinoUnoV4 from './arduino_comp/ArduinoUnoV4';
import LED from './led_comp/LED';
import PushButton from './button_comp/PushButton';
import Resistor from './resistor_comp/Resistor';
import Wire from './wire_comp/Wire';

// Pin offset definitions - relative to component origin
// Based on EXACT ArduinoUnoV4.jsx structure
const PIN_OFFSETS = {
    'arduino-uno-v4': {
        // Digital pins LEFT section: Group y=5 -> Group x=80 -> pins at y=11
        // Actual y = 5+11 = 16, x = 80 + pin.x
        'AREF': { x: 80 + 5, y: 16 },    // pin.x = 5
        'GND': { x: 80 + 18, y: 16 },    // pin.x = 18
        '13': { x: 80 + 31, y: 16 },     // pin.x = 31
        '12': { x: 80 + 44, y: 16 },     // pin.x = 44
        '~11': { x: 80 + 57, y: 16 },    // pin.x = 57
        '~10': { x: 80 + 70, y: 16 },    // pin.x = 70
        '~9': { x: 80 + 83, y: 16 },     // pin.x = 83
        // Digital pins RIGHT section: Group y=5 -> Group x=190 -> pins at y=11
        // Actual y = 5+11 = 16, x = 190 + pin.x
        '8': { x: 190 + 5, y: 16 },      // pin.x = 5
        '7': { x: 190 + 18, y: 16 },     // pin.x = 18
        '~6': { x: 190 + 31, y: 16 },    // pin.x = 31
        '~5': { x: 190 + 44, y: 16 },    // pin.x = 44
        '4': { x: 190 + 57, y: 16 },     // pin.x = 57
        '~3': { x: 190 + 70, y: 16 },    // pin.x = 70
        '2': { x: 190 + 83, y: 16 },     // pin.x = 83
        'TX→1': { x: 190 + 96, y: 16 },  // pin.x = 96
        'RX←0': { x: 190 + 109, y: 16 }, // pin.x = 109
        // Power pins: Group y=240 -> pins at y=14
        // Actual y = 240+14 = 254
        'IOREF': { x: 130, y: 254 },
        'RESET': { x: 143, y: 254 },
        '3.3V': { x: 156, y: 254 },
        '5V': { x: 169, y: 254 },
        'GND1': { x: 182, y: 254 },
        'GND2': { x: 195, y: 254 },
        'Vin': { x: 208, y: 254 },
        // Analog pins: Group y=240 -> pins at y=14
        // Actual y = 240+14 = 254
        'A0': { x: 232, y: 254 },
        'A1': { x: 245, y: 254 },
        'A2': { x: 258, y: 254 },
        'A3': { x: 271, y: 254 },
        'A4': { x: 284, y: 254 },
        'A5': { x: 297, y: 254 },
    },
    'led-red': { 'anode': { x: 13.5, y: 76 }, 'cathode': { x: 26.5, y: 70 } },
    'led-green': { 'anode': { x: 13.5, y: 76 }, 'cathode': { x: 26.5, y: 70 } },
    'led-yellow': { 'anode': { x: 13.5, y: 76 }, 'cathode': { x: 26.5, y: 70 } },
    'pushbutton': {
        '1b': { x: 20, y: 15 }, '2b': { x: 50, y: 15 },
        '1a': { x: 20, y: 105 }, '2a': { x: 50, y: 105 },
    },
    'resistor': {
        'lead1': { x: 25, y: 5 },   // Top lead
        'lead2': { x: 25, y: 115 }, // Bottom lead
    },
};

function Workspace({
    components = [],
    wires = [],
    setWires,
    simState = {},
    onDrop,
    onComponentMove,
    onComponentDelete,
    onButtonPress,
    onButtonRelease,
    onRun,
    onStop,
    isRunning,
    viewMode = 'both',
    onViewModeChange,
    experimentActive = false,
    pinConfig,
    onPinConfigChange,
}) {
    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Wire state - wires now store pin references + bend points
    // Wire structure: { id, startPin: {pin, componentId}, endPin: {pin, componentId}, bendPoints: [{x,y}], color }
    // const [wires, setWires] = useState([]); // Moved to App parent
    const [selectedWire, setSelectedWire] = useState(null);
    const [wiringMode, setWiringMode] = useState(null);
    // wiringMode = { startPin, startComponentId, bendPoints: [{x, y}] }
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [wireColor, setWireColor] = useState('red');

    // Update canvas size based on container
    const updateCanvasSize = () => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setCanvasSize({ width: rect.width, height: rect.height });
        }
    };

    // Handle ESC key to cancel wiring, Delete/Backspace to remove wires or components
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && wiringMode) {
                setWiringMode(null);
                document.body.style.cursor = 'default';
            }
            // Delete or Backspace to remove selected wire or component
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // Don't delete if user is typing in an input/textarea
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    return;
                }

                e.preventDefault();

                // Delete selected wire
                if (selectedWire) {
                    setWires(prev => prev.filter(w => w.id !== selectedWire));
                    setSelectedWire(null);
                }
                // Delete selected component and its connected wires
                else if (selectedComponent) {
                    // Remove all wires connected to this component
                    setWires(prev => prev.filter(w =>
                        w.startPin.componentId !== selectedComponent &&
                        w.endPin.componentId !== selectedComponent
                    ));
                    // Call the delete callback to remove the component
                    onComponentDelete?.(selectedComponent);
                    setSelectedComponent(null);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [wiringMode, selectedWire, selectedComponent, onComponentDelete]);

    // Handle drag over - allow drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    // Handle drop - add component to workspace
    const handleDrop = (e) => {
        e.preventDefault();

        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        const component = JSON.parse(data);
        const rect = canvasRef.current.getBoundingClientRect();

        const position = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        onDrop(component, position);
    };

    // Get pin position based on component and pin - now uses components from state
    const getPinPosition = useCallback((componentId, pinId) => {
        const comp = components.find(c => c.id === componentId);
        if (!comp) return { x: 0, y: 0 };

        const offsets = PIN_OFFSETS[comp.element];
        if (!offsets || !offsets[pinId]) {
            // Fallback: return component center
            return { x: comp.x + 30, y: comp.y + 30 };
        }

        return {
            x: comp.x + offsets[pinId].x,
            y: comp.y + offsets[pinId].y,
        };
    }, [components]);

    // Handle pin click for wiring
    const handlePinClick = useCallback((pin, componentId) => {
        if (!wiringMode) {
            // Start new wire
            setWiringMode({
                startPin: pin,
                startComponentId: componentId,
                bendPoints: [], // Only store intermediate bend points
            });
            document.body.style.cursor = 'crosshair';
        } else {
            // Complete wire - don't connect to same component
            if (componentId === wiringMode.startComponentId) {
                console.log('Cannot connect to same component');
                return;
            }

            const newWire = {
                id: `wire-${Date.now()}`,
                startPin: { pin: wiringMode.startPin, componentId: wiringMode.startComponentId },
                endPin: { pin, componentId },
                bendPoints: wiringMode.bendPoints, // Only intermediate points
                color: wireColor,
            };

            setWires(prev => [...prev, newWire]);
            setWiringMode(null);
            document.body.style.cursor = 'default';
        }
    }, [wiringMode, wireColor]);

    // Handle stage click (add bend point or cancel)
    const handleStageClick = useCallback((e) => {
        // Check if clicked on empty canvas area (stage or layer, not a component)
        const clickedOnEmpty = e.target === e.target.getStage() ||
            e.target.getClassName() === 'Layer' ||
            e.target.getClassName() === 'Rect' && e.target.attrs.name === 'background';

        if (clickedOnEmpty) {
            if (wiringMode) {
                // Add bend point
                const stage = e.target.getStage();
                const point = stage.getPointerPosition();
                if (point) {
                    setWiringMode(prev => ({
                        ...prev,
                        bendPoints: [...prev.bendPoints, { x: point.x, y: point.y }],
                    }));
                }
            } else {
                // Deselect
                setSelectedComponent(null);
                setSelectedWire(null);
            }
        }
    }, [wiringMode]);

    // Handle mouse move for wire preview
    const handleMouseMove = useCallback((e) => {
        if (wiringMode && stageRef.current) {
            const stage = stageRef.current;
            const point = stage.getPointerPosition();
            if (point) {
                setMousePosition({ x: point.x, y: point.y });
            }
        }
    }, [wiringMode]);

    // Handle component drag within Konva stage
    const handleKonvaDragEnd = (compId, e) => {
        const newPosition = {
            x: e.target.x(),
            y: e.target.y(),
        };
        onComponentMove(compId, newPosition);
    };

    // Handle wire click
    const handleWireClick = (wireId) => {
        setSelectedWire(wireId);
        setSelectedComponent(null);
    };

    // Check if component is a Konva-based component
    const isKonvaComponent = (element) => {
        return ['arduino-uno-v4', 'led-red', 'led-green', 'led-yellow', 'pushbutton', 'resistor'].includes(element);
    };

    // Calculate wire points dynamically - recalculates when components move
    const getWirePoints = useCallback((wire) => {
        const startPos = getPinPosition(wire.startPin.componentId, wire.startPin.pin);
        const endPos = getPinPosition(wire.endPin.componentId, wire.endPin.pin);

        // Combine: start position + bend points + end position
        return [startPos, ...wire.bendPoints, endPos];
    }, [getPinPosition]);

    // Render wires - dynamically calculate positions
    const renderWires = () => {
        return wires.map((wire) => {
            const points = getWirePoints(wire);
            return (
                <Wire
                    key={wire.id}
                    id={wire.id}
                    points={points}
                    color={wire.color}
                    isSelected={selectedWire === wire.id}
                    onClick={handleWireClick}
                />
            );
        });
    };

    // Render wire preview while drawing
    const renderWirePreview = () => {
        if (!wiringMode) return null;

        const startPos = getPinPosition(wiringMode.startComponentId, wiringMode.startPin);
        const previewPoints = [startPos, ...wiringMode.bendPoints, mousePosition];

        return (
            <Wire
                id="preview"
                points={previewPoints}
                color={wireColor}
                isPreview={true}
            />
        );
    };

    // Render Arduino components (rendered first = at bottom)
    const renderArduinoComponents = () => {
        return components
            .filter(comp => comp.element === 'arduino-uno-v4')
            .map((comp) => {
                const handleSelect = () => {
                    if (!wiringMode) {
                        setSelectedComponent(comp.id);
                        setSelectedWire(null);
                    }
                };

                return (
                    <ArduinoUnoV4
                        key={comp.id}
                        x={comp.x}
                        y={comp.y}
                        scale={1}
                        isSelected={selectedComponent === comp.id}
                        onSelect={handleSelect}
                        onPinClick={(pin) => handlePinClick(pin, comp.id)}
                        onPinHover={(pin) => { }}
                        draggable={!wiringMode}
                        onDragEnd={(e) => handleKonvaDragEnd(comp.id, e)}
                    />
                );
            });
    };

    // Render other Konva components (rendered after Arduino = on top)
    const renderOtherKonvaComponents = () => {
        return components
            .filter(comp => isKonvaComponent(comp.element) && comp.element !== 'arduino-uno-v4')
            .map((comp) => {
                const handleSelect = () => {
                    if (!wiringMode) {
                        setSelectedComponent(comp.id);
                        setSelectedWire(null);
                    }
                };

                switch (comp.element) {
                    case 'led-red':
                        return (
                            <LED
                                key={comp.id}
                                x={comp.x}
                                y={comp.y}
                                scale={1}
                                color="red"
                                isSelected={selectedComponent === comp.id}
                                isOn={simState[comp.id]?.isOn}
                                onSelect={handleSelect}
                                onPinClick={(pin) => handlePinClick(pin, comp.id)}
                                onPinHover={(pin) => { }}
                                draggable={!wiringMode}
                                onDragEnd={(e) => handleKonvaDragEnd(comp.id, e)}
                            />
                        );
                    case 'led-green':
                        return (
                            <LED
                                key={comp.id}
                                x={comp.x}
                                y={comp.y}
                                scale={1}
                                color="green"
                                isSelected={selectedComponent === comp.id}
                                isOn={simState[comp.id]?.isOn}
                                onSelect={handleSelect}
                                onPinClick={(pin) => handlePinClick(pin, comp.id)}
                                onPinHover={(pin) => { }}
                                draggable={!wiringMode}
                                onDragEnd={(e) => handleKonvaDragEnd(comp.id, e)}
                            />
                        );
                    case 'led-yellow':
                        return (
                            <LED
                                key={comp.id}
                                x={comp.x}
                                y={comp.y}
                                scale={1}
                                color="yellow"
                                isSelected={selectedComponent === comp.id}
                                isOn={simState[comp.id]?.isOn}
                                onSelect={handleSelect}
                                onPinClick={(pin) => handlePinClick(pin, comp.id)}
                                onPinHover={(pin) => { }}
                                draggable={!wiringMode}
                                onDragEnd={(e) => handleKonvaDragEnd(comp.id, e)}
                            />
                        );
                    case 'pushbutton':
                        return (
                            <PushButton
                                key={comp.id}
                                x={comp.x}
                                y={comp.y}
                                scale={1}
                                color="red"
                                isSelected={selectedComponent === comp.id}
                                onSelect={handleSelect}
                                onPress={() => onButtonPress?.(comp.id)}
                                onRelease={() => onButtonRelease?.(comp.id)}
                                onPinClick={(pin) => handlePinClick(pin, comp.id)}
                                onPinHover={(pin) => { }}
                                draggable={!wiringMode}
                                onDragEnd={(e) => handleKonvaDragEnd(comp.id, e)}
                            />
                        );
                    case 'resistor':
                        return (
                            <Resistor
                                key={comp.id}
                                x={comp.x}
                                y={comp.y}
                                scale={1}
                                value="10k"
                                isSelected={selectedComponent === comp.id}
                                onSelect={handleSelect}
                                onPinClick={(pin) => handlePinClick(pin, comp.id)}
                                onPinHover={(pin) => { }}
                                draggable={!wiringMode}
                                onDragEnd={(e) => handleKonvaDragEnd(comp.id, e)}
                            />
                        );
                    default:
                        return null;
                }
            });
    };

    // Render non-Konva components as HTML elements
    const renderHtmlComponent = (component) => {
        const props = component.props || {};

        switch (component.element) {
            case 'wokwi-led':
                return <wokwi-led color={props.color} value="1" />;
            case 'wokwi-pushbutton':
                return <wokwi-pushbutton color="green" />;
            case 'wokwi-buzzer':
                return <wokwi-buzzer />;
            case 'wokwi-resistor':
                return <wokwi-resistor value="1000" />;
            case 'wokwi-potentiometer':
                return <wokwi-potentiometer />;
            case 'wokwi-servo':
                return <wokwi-servo />;
            case 'wokwi-lcd1602':
                return <wokwi-lcd1602 />;
            default:
                return <div className="unknown-component">?</div>;
        }
    };

    // Non-Konva components
    const nonKonvaComponents = components.filter(comp => !isKonvaComponent(comp.element));
    const hasKonvaComponents = components.some(comp => isKonvaComponent(comp.element)) || wires.length > 0 || wiringMode;

    return (
        <div className="workspace">
            {/* Header */}
            <div className="workspace-header">
                <h2>Circuit Workspace</h2>
                <div className="workspace-header-controls">
                    {experimentActive && pinConfig && (
                        <div className="pin-config-panel">
                            <div className="pin-config-field">
                                <label>LED Pin</label>
                                <select
                                    value={pinConfig.ledPin}
                                    onChange={(e) =>
                                        onPinConfigChange?.({ ledPin: Number(e.target.value) })
                                    }
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 2)
                                        .filter((p) => p !== pinConfig.buttonPin)
                                        .map((p) => (
                                            <option key={p} value={p}>
                                                D{p}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="pin-config-field">
                                <label>Button Pin</label>
                                <select
                                    value={pinConfig.buttonPin}
                                    onChange={(e) =>
                                        onPinConfigChange?.({ buttonPin: Number(e.target.value) })
                                    }
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 2)
                                        .filter((p) => p !== pinConfig.ledPin)
                                        .map((p) => (
                                            <option key={p} value={p}>
                                                D{p}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* View toggle: Circuit | Code | Both */}
                    <div className="view-toggle-group">
                        <button
                            className={viewMode === 'circuit' ? 'active' : ''}
                            onClick={() => onViewModeChange?.('circuit')}
                        >
                            Circuit
                        </button>
                        <button
                            className={viewMode === 'code' ? 'active' : ''}
                            onClick={() => onViewModeChange?.('code')}
                        >
                            Code
                        </button>
                        <button
                            className={viewMode === 'both' ? 'active' : ''}
                            onClick={() => onViewModeChange?.('both')}
                        >
                            Both
                        </button>
                    </div>

                    {/* Simulation controls */}
                    <div className="sim-controls">
                        {isRunning ? (
                            <button className="stop-button" onClick={onStop}>
                                ■ Stop
                            </button>
                        ) : (
                            <button className="run-button" onClick={onRun}>
                                ▶ Start
                            </button>
                        )}
                    </div>

                    {/* Wire color selector */}
                    <div className="wire-color-selector">
                        <label>Wire: </label>
                        <select value={wireColor} onChange={(e) => setWireColor(e.target.value)}>
                            <option value="red">Red</option>
                            <option value="green">Green</option>
                            <option value="blue">Blue</option>
                            <option value="yellow">Yellow</option>
                            <option value="orange">Orange</option>
                            <option value="black">Black</option>
                        </select>
                    </div>
                </div>
                {wiringMode && (
                    <span className="wiring-info">
                        Drawing wire from {wiringMode.startPin} | Click pin to connect, canvas to bend, ESC to cancel
                    </span>
                )}
                {selectedWire && (
                    <span className="wire-selected-info">
                        Wire selected | Press Delete to remove
                    </span>
                )}
            </div>

            {/* Canvas Area */}
            <div
                className="workspace-canvas"
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="grid-background">
                    {components.length === 0 && (
                        <p className="placeholder-text">Drag components here to build your circuit</p>
                    )}

                    {/* Single Konva Stage for all Konva-based components */}
                    {hasKonvaComponents && (
                        <Stage
                            ref={stageRef}
                            width={canvasRef.current?.clientWidth || 800}
                            height={canvasRef.current?.clientHeight || 600}
                            className="konva-stage"
                            onMouseMove={handleMouseMove}
                        >
                            <Layer>
                                {/* Invisible background to catch clicks for wire bending */}
                                <Rect
                                    name="bg"
                                    x={0}
                                    y={0}
                                    width={canvasRef.current?.clientWidth || 800}
                                    height={canvasRef.current?.clientHeight || 600}
                                    fill="#ffffff"
                                    opacity={0}
                                    onMouseDown={(e) => {
                                        // Get pointer position from the event
                                        const stage = e.target.getStage();
                                        const point = stage.getPointerPosition();

                                        if (wiringMode && point) {
                                            // Add bend point
                                            setWiringMode(prev => ({
                                                ...prev,
                                                bendPoints: [...prev.bendPoints, { x: point.x, y: point.y }],
                                            }));
                                        } else if (!wiringMode) {
                                            // Deselect
                                            setSelectedComponent(null);
                                            setSelectedWire(null);
                                        }
                                    }}
                                />
                                {/* 1. Arduino at the bottom */}
                                {renderArduinoComponents()}
                                {/* 2. Wires on top of Arduino */}
                                {renderWires()}
                                {renderWirePreview()}
                                {/* 3. Other components (LEDs, buttons) on top */}
                                {renderOtherKonvaComponents()}
                            </Layer>
                        </Stage>
                    )}

                    {/* Render non-Konva components as positioned HTML elements */}
                    {nonKonvaComponents.map((comp) => (
                        <div
                            key={comp.id}
                            className={`workspace-component ${selectedComponent === comp.id ? 'selected' : ''}`}
                            style={{
                                left: `${comp.x}px`,
                                top: `${comp.y}px`,
                            }}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', comp.id);
                            }}
                            onDragEnd={(e) => {
                                const rect = canvasRef.current.getBoundingClientRect();
                                onComponentMove(comp.id, {
                                    x: e.clientX - rect.left,
                                    y: e.clientY - rect.top,
                                });
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComponent(comp.id);
                            }}
                        >
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onComponentDelete(comp.id);
                                }}
                                title="Delete component"
                            >
                                ✕
                            </button>
                            {renderHtmlComponent(comp)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Workspace;
