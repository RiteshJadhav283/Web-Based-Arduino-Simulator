/**
 * PushButton Component - Konva-based Interactive Push Button
 * 
 * A realistic push button component that can be placed on the workspace.
 * Supports press/release states with visual feedback.
 * Pin layout:
 *      1b       2b   <- pins ABOVE button
 *     [BUTTON]
 *      1a       2a   <- pins BELOW button
 */

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Group, Circle, Rect, Text } from 'react-konva';
import PropTypes from 'prop-types';

// =============================================================================
// BUTTON COLORS
// =============================================================================

const BUTTON_COLORS = {
    red: { cap: '#CC3333', capPressed: '#AA2222', ring: '#992222' },
    green: { cap: '#33CC33', capPressed: '#22AA22', ring: '#229922' },
    blue: { cap: '#3366CC', capPressed: '#2255AA', ring: '#224499' },
    yellow: { cap: '#CCCC33', capPressed: '#AAAA22', ring: '#999922' },
    black: { cap: '#333333', capPressed: '#222222', ring: '#111111' },
};

// Push Button Pin definitions (4-pin configuration)
// Layout:     1b       2b   (top pins)
//            [BUTTON]
//             1a       2a   (bottom pins)
const BUTTON_PINS = [
    { id: '1b', label: '1b', x: 20, y: 15 },   // Top left
    { id: '2b', label: '2b', x: 50, y: 15 },   // Top right
    { id: '1a', label: '1a', x: 20, y: 105 },  // Bottom left
    { id: '2a', label: '2a', x: 50, y: 105 },  // Bottom right
];

// Component dimensions
const BUTTON_WIDTH = 70;
const BUTTON_HEIGHT = 120;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const PushButton = forwardRef(function PushButton({
    x = 0,
    y = 0,
    scale = 1,
    color = 'red',
    isSelected = false,
    onPress,
    onRelease,
    onPinClick,
    onPinHover,
    onSelect,
    draggable = true,
    onDragEnd,
}, ref) {
    const [isPressed, setIsPressed] = useState(false);
    const [hoveredPin, setHoveredPin] = useState(null);

    const colors = BUTTON_COLORS[color] || BUTTON_COLORS.red;

    // Pin interaction handlers (same as Arduino/LED)
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

    // Button press handlers
    const handlePress = () => {
        setIsPressed(true);
        onPress?.();
    };

    const handleRelease = () => {
        setIsPressed(false);
        onRelease?.();
    };

    useImperativeHandle(ref, () => ({
        press: () => { setIsPressed(true); onPress?.(); },
        release: () => { setIsPressed(false); onRelease?.(); },
        isPressed: () => isPressed,
        getDimensions: () => ({ width: BUTTON_WIDTH * scale, height: BUTTON_HEIGHT * scale }),
        getPins: () => BUTTON_PINS,
    }));

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
                    x={0}
                    y={-5}
                    width={BUTTON_WIDTH}
                    height={BUTTON_HEIGHT + 10}
                    stroke="#FFD700"
                    strokeWidth={2}
                    dash={[5, 3]}
                    cornerRadius={5}
                    listening={false}
                />
            )}

            {/* TOP PINS (1b and 2b) - above button */}
            {/* Top left pin (1b) */}
            <Rect
                x={17}
                y={0}
                width={6}
                height={30}
                fill={hoveredPin === '1b' ? '#FFD700' : '#AAAAAA'}
            />
            {/* Top right pin (2b) */}
            <Rect
                x={47}
                y={0}
                width={6}
                height={30}
                fill={hoveredPin === '2b' ? '#FFD700' : '#AAAAAA'}
            />

            {/* Button body/housing */}
            <Rect
                x={5}
                y={30}
                width={60}
                height={60}
                fill="#1C1C1C"
                cornerRadius={4}
                stroke="#333"
                strokeWidth={1}
            />

            {/* Button outer ring */}
            <Circle
                x={35}
                y={60}
                radius={22}
                fill={colors.ring}
            />

            {/* Button cap */}
            <Circle
                x={35}
                y={60 + (isPressed ? 2 : 0)}
                radius={17}
                fill={isPressed ? colors.capPressed : colors.cap}
                shadowColor="#000"
                shadowBlur={isPressed ? 2 : 5}
                shadowOpacity={0.5}
                shadowOffsetY={isPressed ? 1 : 3}
                onMouseDown={handlePress}
                onMouseUp={handleRelease}
                onMouseLeave={() => { if (isPressed) handleRelease(); }}
            />

            {/* Highlight on cap */}
            {!isPressed && (
                <Circle
                    x={30}
                    y={54}
                    radius={6}
                    fill="rgba(255,255,255,0.3)"
                />
            )}

            {/* BOTTOM PINS (1a and 2a) - below button */}
            {/* Bottom left pin (1a) */}
            <Rect
                x={17}
                y={90}
                width={6}
                height={30}
                fill={hoveredPin === '1a' ? '#FFD700' : '#AAAAAA'}
            />
            {/* Bottom right pin (2a) */}
            <Rect
                x={47}
                y={90}
                width={6}
                height={30}
                fill={hoveredPin === '2a' ? '#FFD700' : '#AAAAAA'}
            />

            {/* Interactive pin areas */}
            {BUTTON_PINS.map((pin) => (
                <Group key={pin.id}>
                    {/* Pin interaction circle (invisible but clickable) */}
                    <Circle
                        x={pin.x}
                        y={pin.y}
                        radius={10}
                        fill="transparent"
                        onMouseEnter={() => pinHover(pin.id)}
                        onMouseLeave={pinLeave}
                        onClick={() => pinClick(pin.id)}
                    />
                </Group>
            ))}

            {/* Pin labels - Top pins */}
            <Text
                x={12}
                y={18}
                text="1b"
                fontSize={9}
                fill={hoveredPin === '1b' ? '#FFD700' : '#666'}
            />
            <Text
                x={54}
                y={18}
                text="2b"
                fontSize={9}
                fill={hoveredPin === '2b' ? '#FFD700' : '#666'}
            />

            {/* Pin labels - Bottom pins */}
            <Text
                x={12}
                y={108}
                text="1a"
                fontSize={9}
                fill={hoveredPin === '1a' ? '#FFD700' : '#666'}
            />
            <Text
                x={54}
                y={108}
                text="2a"
                fontSize={9}
                fill={hoveredPin === '2a' ? '#FFD700' : '#666'}
            />

            {/* Tooltip on pin hover */}
            {hoveredPin && (
                <Group x={35} y={-15}>
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
                        text={`Pin ${hoveredPin}`}
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

PushButton.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    scale: PropTypes.number,
    color: PropTypes.oneOf(['red', 'green', 'blue', 'yellow', 'black']),
    onPress: PropTypes.func,
    onRelease: PropTypes.func,
    onPinClick: PropTypes.func,
    onPinHover: PropTypes.func,
    draggable: PropTypes.bool,
    onDragEnd: PropTypes.func,
};

// Export dimensions and pins for workspace calculations
export const BUTTON_DIMENSIONS = { width: BUTTON_WIDTH, height: BUTTON_HEIGHT };
export const AVAILABLE_COLORS = Object.keys(BUTTON_COLORS);
export { BUTTON_PINS };
export default PushButton;
