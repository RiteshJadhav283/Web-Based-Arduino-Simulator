/**
 * LED Component - Konva-based Interactive LED
 * 
 * A realistic LED component that can be placed on the workspace.
 * Supports multiple colors and on/off states with glow effects.
 */

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Group, Circle, Rect, Ellipse, Text } from 'react-konva';
import PropTypes from 'prop-types';

// =============================================================================
// LED COLORS
// =============================================================================

const LED_COLORS = {
    red: {
        off: '#660000',
        on: '#FF0000',
        glow: '#FF4444',
        base: '#CC0000',
    },
    green: {
        off: '#006600',
        on: '#00FF00',
        glow: '#44FF44',
        base: '#00CC00',
    },
    yellow: {
        off: '#666600',
        on: '#FFFF00',
        glow: '#FFFF44',
        base: '#CCCC00',
    },
    blue: {
        off: '#000066',
        on: '#0066FF',
        glow: '#4488FF',
        base: '#0044CC',
    },
    white: {
        off: '#444444',
        on: '#FFFFFF',
        glow: '#FFFFFF',
        base: '#CCCCCC',
    },
};

// LED Pin definitions
const LED_PINS = [
    { id: 'anode', label: '+', x: 13.5, y: 76 },    // Left leg (longer, positive)
    { id: 'cathode', label: '-', x: 26.5, y: 70 },  // Right leg (shorter, negative)
];

// Component dimensions
const LED_WIDTH = 40;
const LED_HEIGHT = 80;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const LED = forwardRef(function LED({
    x = 0,
    y = 0,
    scale = 1,
    color = 'red',
    initialState = false,
    isSelected = false,
    onStateChange,
    onPinClick,
    onPinHover,
    onSelect,
    draggable = true,
    onDragEnd,
}, ref) {
    const [isOn, setIsOn] = useState(initialState);
    const [hoveredPin, setHoveredPin] = useState(null);

    const colors = LED_COLORS[color] || LED_COLORS.red;

    // Pin interaction handlers (same as Arduino)
    const pinHover = (id) => {
        setHoveredPin(id);
        document.body.style.cursor = 'crosshair';
        onPinHover?.(id);
    };
    const pinLeave = () => {
        setHoveredPin(null);
        document.body.style.cursor = 'default';
    };
    const pinClick = (id) => onPinClick?.(id);

    useImperativeHandle(ref, () => ({
        turnOn: () => { setIsOn(true); onStateChange?.(true); },
        turnOff: () => { setIsOn(false); onStateChange?.(false); },
        toggle: () => {
            setIsOn(prev => {
                onStateChange?.(!prev);
                return !prev;
            });
        },
        getState: () => isOn,
        getDimensions: () => ({ width: LED_WIDTH * scale, height: LED_HEIGHT * scale }),
        getPins: () => LED_PINS,
    }));

    const currentColor = isOn ? colors.on : colors.off;

    return (
        <Group
            x={x}
            y={y}
            scaleX={scale}
            scaleY={scale}
            draggable={draggable}
            onDragEnd={onDragEnd}
            onClick={(e) => { e.cancelBubble = true; onSelect?.(); }}
        >
            {/* Selection highlight */}
            {isSelected && (
                <Rect
                    x={-5}
                    y={-5}
                    width={LED_WIDTH + 10}
                    height={LED_HEIGHT + 10}
                    stroke="#FFD700"
                    strokeWidth={2}
                    dash={[5, 3]}
                    cornerRadius={5}
                    listening={false}
                />
            )}

            {/* Glow effect when ON */}
            {isOn && (
                <Circle
                    x={20}
                    y={20}
                    radius={25}
                    fill={colors.glow}
                    opacity={0.4}
                    shadowColor={colors.glow}
                    shadowBlur={20}
                    shadowOpacity={0.8}
                />
            )}

            {/* LED Dome/Bulb */}
            <Ellipse
                x={20}
                y={20}
                radiusX={14}
                radiusY={18}
                fill={currentColor}
                stroke={colors.base}
                strokeWidth={1}
                shadowColor={isOn ? colors.glow : 'transparent'}
                shadowBlur={isOn ? 15 : 0}
            />

            {/* Highlight reflection */}
            <Ellipse
                x={14}
                y={12}
                radiusX={5}
                radiusY={6}
                fill="rgba(255,255,255,0.3)"
            />

            {/* LED Base (plastic housing) */}
            <Rect
                x={8}
                y={36}
                width={24}
                height={10}
                fill="#555555"
                cornerRadius={2}
            />

            {/* Metal rim */}
            <Rect
                x={10}
                y={44}
                width={20}
                height={4}
                fill="#888888"
            />

            {/* Left leg (Anode +) */}
            <Rect
                x={12}
                y={48}
                width={3}
                height={28}
                fill={hoveredPin === 'anode' ? '#FFD700' : '#AAAAAA'}
            />

            {/* Right leg (Cathode -) - shorter */}
            <Rect
                x={25}
                y={48}
                width={3}
                height={22}
                fill={hoveredPin === 'cathode' ? '#FFD700' : '#AAAAAA'}
            />

            {/* Interactive pin areas */}
            {LED_PINS.map((pin) => (
                <Group key={pin.id}>
                    {/* Pin interaction circle (invisible but clickable) */}
                    <Circle
                        x={pin.x}
                        y={pin.y}
                        radius={8}
                        fill="transparent"
                        onMouseEnter={() => pinHover(pin.id)}
                        onMouseLeave={pinLeave}
                        onClick={() => pinClick(pin.id)}
                    />
                    {/* Pin label */}
                    <Text
                        x={pin.id === 'anode' ? 8 : 24}
                        y={pin.id === 'anode' ? 78 : 72}
                        text={pin.label}
                        fontSize={10}
                        fill={hoveredPin === pin.id ? '#FFD700' : '#888'}
                        fontStyle="bold"
                    />
                </Group>
            ))}

            {/* Tooltip on pin hover */}
            {hoveredPin && (
                <Group x={20} y={-15}>
                    <Rect
                        x={-25}
                        y={-10}
                        width={50}
                        height={20}
                        fill="rgba(0,0,0,0.9)"
                        cornerRadius={4}
                    />
                    <Text
                        x={-25}
                        y={-5}
                        width={50}
                        text={hoveredPin === 'anode' ? 'Anode (+)' : 'Cathode (-)'}
                        fontSize={9}
                        fill="#fff"
                        align="center"
                        fontStyle="bold"
                    />
                </Group>
            )}
        </Group>
    );
});

LED.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    scale: PropTypes.number,
    color: PropTypes.oneOf(['red', 'green', 'yellow', 'blue', 'white']),
    initialState: PropTypes.bool,
    onStateChange: PropTypes.func,
    onPinClick: PropTypes.func,
    onPinHover: PropTypes.func,
    draggable: PropTypes.bool,
    onDragEnd: PropTypes.func,
};

// Export dimensions and pins for workspace calculations
export const LED_DIMENSIONS = { width: LED_WIDTH, height: LED_HEIGHT };
export const AVAILABLE_COLORS = Object.keys(LED_COLORS);
export { LED_PINS };
export default LED;

