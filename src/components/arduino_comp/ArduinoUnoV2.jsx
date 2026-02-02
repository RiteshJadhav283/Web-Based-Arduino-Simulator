/**
 * ArduinoUnoV2 - High-fidelity Arduino Uno Rev3 using Konva.js
 * 
 * Features:
 * - Realistic PCB with depth shadows
 * - Interactive pins with snap points
 * - Tactile reset button
 * - L LED indicator with glow effect
 * - ATmega328P MCU with pins
 * - USB-B and DC Power Jack ports
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Group, Rect, Circle, Text, Line } from 'react-konva';
import PropTypes from 'prop-types';

// =============================================================================
// CONSTANTS
// =============================================================================

const BOARD_WIDTH = 280;
const BOARD_HEIGHT = 180;
const PCB_COLOR = '#00979D';
const PCB_STROKE = '#008184';

// Pin definitions
const DIGITAL_PINS = [
    'RX0', 'TX1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', 'GND', 'AREF'
];

const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

const POWER_PINS = ['VIN', 'GND', 'GND2', '5V', '3.3V', 'RESET', 'IOREF'];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ArduinoUnoV2({
    scale = 1,
    onPinClick,
    onPinHover,
    onBoardDrag,
    initialX = 0,
    initialY = 0,
}) {
    const groupRef = useRef(null);
    const [ledState, setLedState] = useState(false);
    const [resetPressed, setResetPressed] = useState(false);
    const [hoveredPin, setHoveredPin] = useState(null);

    // LED control function
    const setPinVisual = useCallback((pin, state) => {
        if (pin === '13' || pin === 'LED') {
            setLedState(state);
        }
    }, []);

    // Expose setPinVisual for external control
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.setPinVisual = setPinVisual;
        }
    }, [setPinVisual]);

    const handlePinMouseEnter = useCallback((pinName, e) => {
        setHoveredPin(pinName);
        document.body.style.cursor = 'crosshair';
        onPinHover?.(pinName);
    }, [onPinHover]);

    const handlePinMouseLeave = useCallback(() => {
        setHoveredPin(null);
        document.body.style.cursor = 'default';
    }, []);

    const handlePinClick = useCallback((pinName) => {
        onPinClick?.(pinName);
    }, [onPinClick]);

    const handleResetMouseDown = useCallback(() => {
        setResetPressed(true);
    }, []);

    const handleResetMouseUp = useCallback(() => {
        setResetPressed(false);
    }, []);

    const stageWidth = BOARD_WIDTH * scale;
    const stageHeight = BOARD_HEIGHT * scale;

    return (
        <Stage width={stageWidth} height={stageHeight}>
            <Layer>
                <Group
                    ref={groupRef}
                    x={0}
                    y={0}
                    scaleX={scale}
                    scaleY={scale}
                    draggable={true}
                    onDragEnd={(e) => onBoardDrag?.(e.target.x(), e.target.y())}
                >
                    {/* === PCB Board === */}
                    <Rect
                        x={0}
                        y={0}
                        width={BOARD_WIDTH}
                        height={BOARD_HEIGHT}
                        fill={PCB_COLOR}
                        stroke={PCB_STROKE}
                        strokeWidth={2}
                        cornerRadius={10}
                        shadowColor="#000"
                        shadowBlur={15}
                        shadowOpacity={0.3}
                        shadowOffsetX={4}
                        shadowOffsetY={4}
                    />

                    {/* === Mounting Holes === */}
                    {[[15, 15], [265, 15], [15, 165], [265, 140]].map(([x, y], i) => (
                        <Circle
                            key={`mount-${i}`}
                            x={x}
                            y={y}
                            radius={5}
                            fill="#00979D"
                            stroke="#006666"
                            strokeWidth={2}
                        />
                    ))}

                    {/* === USB-B Port (Metallic gradient simulation) === */}
                    <Group x={-8} y={50}>
                        {/* USB housing */}
                        <Rect
                            x={0}
                            y={0}
                            width={40}
                            height={50}
                            fill="#B0B0B0"
                            stroke="#808080"
                            strokeWidth={1}
                            cornerRadius={3}
                        />
                        {/* USB inner */}
                        <Rect
                            x={5}
                            y={8}
                            width={30}
                            height={34}
                            fill="#A0A0A0"
                            stroke="#707070"
                            strokeWidth={1}
                        />
                        {/* USB slot */}
                        <Rect
                            x={10}
                            y={15}
                            width={20}
                            height={20}
                            fill="#404040"
                        />
                    </Group>

                    {/* === DC Power Jack === */}
                    <Group x={-8} y={120}>
                        <Rect
                            x={0}
                            y={0}
                            width={35}
                            height={30}
                            fill="#1a1a1a"
                            stroke="#0a0a0a"
                            strokeWidth={1}
                            cornerRadius={3}
                        />
                        {/* Barrel connector */}
                        <Circle x={17} y={15} radius={10} fill="#333" stroke="#1a1a1a" strokeWidth={1} />
                        <Circle x={17} y={15} radius={5} fill="#1a1a1a" />
                        <Circle x={17} y={15} radius={2} fill="#444" />
                    </Group>

                    {/* === ATmega328P MCU === */}
                    <Group x={100} y={70}>
                        {/* Chip body */}
                        <Rect
                            x={0}
                            y={0}
                            width={100}
                            height={35}
                            fill="#222"
                            stroke="#111"
                            strokeWidth={1}
                            cornerRadius={2}
                        />
                        {/* Chip notch */}
                        <Circle x={0} y={17.5} radius={4} fill="#333" />

                        {/* Top pins (14 pins) */}
                        {[...Array(14)].map((_, i) => (
                            <Circle
                                key={`mcu-top-${i}`}
                                x={10 + i * 6}
                                y={-3}
                                radius={2}
                                fill="#C0C0C0"
                            />
                        ))}

                        {/* Bottom pins (14 pins) */}
                        {[...Array(14)].map((_, i) => (
                            <Circle
                                key={`mcu-bottom-${i}`}
                                x={10 + i * 6}
                                y={38}
                                radius={2}
                                fill="#C0C0C0"
                            />
                        ))}

                        {/* Chip text */}
                        <Text
                            x={15}
                            y={12}
                            text="ATmega328P"
                            fontSize={7}
                            fill="#666"
                            fontFamily="monospace"
                        />
                    </Group>

                    {/* === Reset Button === */}
                    <Group x={50} y={25}>
                        {/* Button base */}
                        <Rect
                            x={0}
                            y={0}
                            width={18}
                            height={18}
                            fill="#888"
                            stroke="#666"
                            strokeWidth={1}
                            cornerRadius={2}
                        />
                        {/* Button top */}
                        <Circle
                            x={9}
                            y={9 + (resetPressed ? 1 : 0)}
                            radius={6}
                            fill={resetPressed ? '#B71C1C' : '#D32F2F'}
                            stroke="#7F0000"
                            strokeWidth={1}
                            shadowColor="#000"
                            shadowBlur={resetPressed ? 2 : 4}
                            shadowOpacity={0.5}
                            onMouseDown={handleResetMouseDown}
                            onMouseUp={handleResetMouseUp}
                            onMouseLeave={handleResetMouseUp}
                        />
                    </Group>

                    {/* === L LED (Pin 13) === */}
                    <Group x={210} y={55}>
                        {/* LED base */}
                        <Rect x={0} y={0} width={8} height={5} fill="#444" cornerRadius={1} />
                        {/* LED */}
                        <Circle
                            x={4}
                            y={2.5}
                            radius={3}
                            fill={ledState ? '#FFEB3B' : '#444'}
                            stroke="#333"
                            strokeWidth={0.5}
                            shadowColor={ledState ? '#FFEB3B' : 'transparent'}
                            shadowBlur={ledState ? 10 : 0}
                            shadowOpacity={ledState ? 0.8 : 0}
                        />
                        {/* Label */}
                        <Text x={-2} y={8} text="L" fontSize={6} fill="#AED6F1" />
                    </Group>

                    {/* === TX/RX LEDs === */}
                    <Group x={225} y={55}>
                        <Circle
                            x={0}
                            y={0}
                            radius={2}
                            fill="#4CAF50"
                        />
                        <Text x={-6} y={5} text="TX" fontSize={5} fill="#AED6F1" />
                        <Circle
                            x={10}
                            y={0}
                            radius={2}
                            fill="#4CAF50"
                        />
                        <Text x={4} y={5} text="RX" fontSize={5} fill="#AED6F1" />
                    </Group>

                    {/* === Digital Pin Header === */}
                    <Group x={70} y={5}>
                        {/* Header housing */}
                        <Rect
                            x={0}
                            y={0}
                            width={195}
                            height={16}
                            fill="#1a1a1a"
                            stroke="#0a0a0a"
                            strokeWidth={1}
                            cornerRadius={2}
                        />

                        {/* Pin holes with snap points */}
                        {DIGITAL_PINS.map((pin, i) => {
                            const pinX = 8 + i * 11.5;
                            const isHovered = hoveredPin === `pin_${pin}`;

                            return (
                                <Group key={`digital-${pin}`} x={pinX} y={8}>
                                    {/* Visible pin hole */}
                                    <Rect
                                        x={-3}
                                        y={-3}
                                        width={6}
                                        height={6}
                                        fill={isHovered ? '#FFD700' : '#333'}
                                        cornerRadius={1}
                                    />
                                    {/* Invisible snap point */}
                                    <Circle
                                        x={0}
                                        y={0}
                                        radius={5}
                                        fill="transparent"
                                        name={`pin_${pin}`}
                                        onMouseEnter={(e) => handlePinMouseEnter(`pin_${pin}`, e)}
                                        onMouseLeave={handlePinMouseLeave}
                                        onClick={() => handlePinClick(`pin_${pin}`)}
                                    />
                                </Group>
                            );
                        })}
                    </Group>

                    {/* === Power Pin Header === */}
                    <Group x={70} y={160}>
                        {/* Header housing */}
                        <Rect
                            x={0}
                            y={0}
                            width={85}
                            height={16}
                            fill="#1a1a1a"
                            stroke="#0a0a0a"
                            strokeWidth={1}
                            cornerRadius={2}
                        />

                        {/* Power pins */}
                        {POWER_PINS.map((pin, i) => {
                            const pinX = 8 + i * 10.5;
                            const isHovered = hoveredPin === `pin_${pin}`;

                            return (
                                <Group key={`power-${pin}`} x={pinX} y={8}>
                                    <Rect
                                        x={-3}
                                        y={-3}
                                        width={6}
                                        height={6}
                                        fill={isHovered ? '#FF5722' : '#333'}
                                        cornerRadius={1}
                                    />
                                    <Circle
                                        x={0}
                                        y={0}
                                        radius={5}
                                        fill="transparent"
                                        name={`pin_${pin}`}
                                        onMouseEnter={(e) => handlePinMouseEnter(`pin_${pin}`, e)}
                                        onMouseLeave={handlePinMouseLeave}
                                        onClick={() => handlePinClick(`pin_${pin}`)}
                                    />
                                </Group>
                            );
                        })}
                    </Group>

                    {/* === Analog Pin Header === */}
                    <Group x={170} y={160}>
                        {/* Header housing */}
                        <Rect
                            x={0}
                            y={0}
                            width={75}
                            height={16}
                            fill="#1a1a1a"
                            stroke="#0a0a0a"
                            strokeWidth={1}
                            cornerRadius={2}
                        />

                        {/* Analog pins */}
                        {ANALOG_PINS.map((pin, i) => {
                            const pinX = 8 + i * 11;
                            const isHovered = hoveredPin === `pin_${pin}`;

                            return (
                                <Group key={`analog-${pin}`} x={pinX} y={8}>
                                    <Rect
                                        x={-3}
                                        y={-3}
                                        width={6}
                                        height={6}
                                        fill={isHovered ? '#2196F3' : '#333'}
                                        cornerRadius={1}
                                    />
                                    <Circle
                                        x={0}
                                        y={0}
                                        radius={5}
                                        fill="transparent"
                                        name={`pin_${pin}`}
                                        onMouseEnter={(e) => handlePinMouseEnter(`pin_${pin}`, e)}
                                        onMouseLeave={handlePinMouseLeave}
                                        onClick={() => handlePinClick(`pin_${pin}`)}
                                    />
                                </Group>
                            );
                        })}
                    </Group>

                    {/* === Header Labels === */}
                    <Text x={130} y={22} text="DIGITAL (PWM~)" fontSize={6} fill="#AED6F1" align="center" />
                    <Text x={100} y={150} text="POWER" fontSize={6} fill="#AED6F1" />
                    <Text x={190} y={150} text="ANALOG IN" fontSize={6} fill="#AED6F1" />

                    {/* === Arduino Logo === */}
                    <Group x={130} y={95}>
                        <Text
                            text="ARDUINO"
                            fontSize={10}
                            fill="#fff"
                            fontFamily="Arial"
                            fontStyle="bold"
                        />
                        <Text
                            x={50}
                            y={-2}
                            text="UNO"
                            fontSize={14}
                            fill="#fff"
                            fontFamily="Arial"
                            fontStyle="bold"
                        />
                    </Group>

                    {/* === Crystal Oscillator === */}
                    <Group x={80} y={115}>
                        <Rect
                            x={0}
                            y={0}
                            width={18}
                            height={6}
                            fill="#C0C0C0"
                            stroke="#888"
                            strokeWidth={0.5}
                            cornerRadius={2}
                        />
                        <Text x={2} y={-1} text="16MHz" fontSize={4} fill="#666" />
                    </Group>

                </Group>
            </Layer>
        </Stage>
    );
}

ArduinoUnoV2.propTypes = {
    scale: PropTypes.number,
    onPinClick: PropTypes.func,
    onPinHover: PropTypes.func,
    onBoardDrag: PropTypes.func,
    initialX: PropTypes.number,
    initialY: PropTypes.number,
};

// Export setPinVisual for external LED control
export { DIGITAL_PINS, ANALOG_PINS, POWER_PINS };
export default ArduinoUnoV2;
