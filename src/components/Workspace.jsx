import { useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import './Workspace.css';
import ArduinoUno from './arduino_comp/ArduinoUno';
import ArduinoUnoV2 from './arduino_comp/ArduinoUnoV2';
import ArduinoUnoV3 from './arduino_comp/ArduinoUnoV3';
import ArduinoUnoV4 from './arduino_comp/ArduinoUnoV4';

function Workspace({ components = [], onDrop, onComponentMove, onComponentDelete }) {
    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [selectedPin, setSelectedPin] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Update canvas size based on container
    const updateCanvasSize = () => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setCanvasSize({ width: rect.width, height: rect.height });
        }
    };

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

    // Handle pin click for wiring
    const handlePinClick = (pin, componentId) => {
        console.log('Pin clicked:', pin, 'on component:', componentId);
        setSelectedPin({ id: pin, name: pin, componentId });
    };

    // Handle component drag within Konva stage
    const handleKonvaDragEnd = (compId, e) => {
        const newPosition = {
            x: e.target.x(),
            y: e.target.y(),
        };
        onComponentMove(compId, newPosition);
    };

    // Check if component is a Konva-based component
    const isKonvaComponent = (element) => {
        return ['arduino-uno-v4'].includes(element);
    };

    // Render Konva components inside the shared Stage
    const renderKonvaComponents = () => {
        return components
            .filter(comp => isKonvaComponent(comp.element))
            .map((comp) => {
                switch (comp.element) {
                    case 'arduino-uno-v4':
                        return (
                            <ArduinoUnoV4
                                key={comp.id}
                                x={comp.x}
                                y={comp.y}
                                scale={1}
                                onPinClick={(pin) => handlePinClick(pin, comp.id)}
                                onPinHover={(pin) => console.log('Hovered:', pin)}
                                draggable={true}
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
            case 'arduino-uno':
            case 'wokwi-arduino-uno':
                return (
                    <ArduinoUno
                        id={component.id}
                        scale={0.6}
                        onPinClick={(pin) => handlePinClick(pin, component.id)}
                        selectedPin={selectedPin?.componentId === component.id ? selectedPin : null}
                    />
                );
            case 'arduino-uno-v2':
                return (
                    <ArduinoUnoV2
                        scale={1}
                        onPinClick={(pin) => handlePinClick(pin, component.id)}
                        onPinHover={(pin) => console.log('Hovered:', pin)}
                    />
                );
            case 'arduino-uno-v3':
                return (
                    <ArduinoUnoV3
                        scale={1}
                        onPinClick={(pin) => handlePinClick(pin, component.id)}
                        onPinHover={(pin) => console.log('Hovered:', pin)}
                    />
                );
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
    const hasKonvaComponents = components.some(comp => isKonvaComponent(comp.element));

    return (
        <div className="workspace">
            {/* Header */}
            <div className="workspace-header">
                <h2>Circuit Workspace</h2>
                {selectedPin && (
                    <span className="selected-pin-info">
                        Selected: {selectedPin.name}
                    </span>
                )}
            </div>

            {/* Canvas Area */}
            <div
                className="workspace-canvas"
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => {
                    setSelectedComponent(null);
                    setSelectedPin(null);
                }}
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
                        >
                            <Layer>
                                {renderKonvaComponents()}
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
