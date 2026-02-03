/**
 * Resistor Component - Konva-based Interactive Resistor
 * 
 * A realistic resistor component with color-coded bands
 * representing resistance values. Supports standard E24 series values.
 * 
 * Pin layout (vertical orientation):
 *        [lead1]
 *           |
 *      [BODY with color bands]
 *           |
 *        [lead2]
 */

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Group, Rect, Circle, Text, Line } from 'react-konva';
import PropTypes from 'prop-types';

// =============================================================================
// RESISTOR COLOR CODES
// =============================================================================

const BAND_COLORS = {
    0: '#000000', // Black
    1: '#8B4513', // Brown
    2: '#FF0000', // Red
    3: '#FFA500', // Orange
    4: '#FFFF00', // Yellow
    5: '#00FF00', // Green
    6: '#0066FF', // Blue
    7: '#8B00FF', // Violet
    8: '#808080', // Gray
    9: '#FFFFFF', // White
};

const MULTIPLIER_COLORS = {
    1: '#000000',      // Black (×1)
    10: '#8B4513',     // Brown (×10)
    100: '#FF0000',    // Red (×100)
    1000: '#FFA500',   // Orange (×1K)
    10000: '#FFFF00',  // Yellow (×10K)
    100000: '#00FF00', // Green (×100K)
    1000000: '#0066FF', // Blue (×1M)
};

const TOLERANCE_COLORS = {
    '1%': '#8B4513',   // Brown
    '2%': '#FF0000',   // Red
    '5%': '#FFD700',   // Gold
    '10%': '#C0C0C0',  // Silver
};

// Common resistor values with their band representations
const RESISTOR_VALUES = {
    '220': { bands: [2, 2, 0], multiplier: 1, tolerance: '5%', label: '220Ω' },
    '330': { bands: [3, 3, 0], multiplier: 1, tolerance: '5%', label: '330Ω' },
    '470': { bands: [4, 7, 0], multiplier: 1, tolerance: '5%', label: '470Ω' },
    '1k': { bands: [1, 0, 0], multiplier: 10, tolerance: '5%', label: '1KΩ' },
    '4.7k': { bands: [4, 7, 0], multiplier: 100, tolerance: '5%', label: '4.7KΩ' },
    '10k': { bands: [1, 0, 0], multiplier: 1000, tolerance: '5%', label: '10KΩ' },
    '100k': { bands: [1, 0, 0], multiplier: 10000, tolerance: '5%', label: '100KΩ' },
    '1M': { bands: [1, 0, 0], multiplier: 100000, tolerance: '5%', label: '1MΩ' },
};

// Pin definitions (vertical resistor - top and bottom)
const RESISTOR_PINS = [
    { id: 'lead1', label: '1', x: 25, y: 5 },   // Top lead
    { id: 'lead2', label: '2', x: 25, y: 115 }, // Bottom lead
];

// Component dimensions (vertical orientation)
const RESISTOR_WIDTH = 50;
const RESISTOR_HEIGHT = 120;
const BODY_WIDTH = 20;
const BODY_HEIGHT = 60;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Resistor = forwardRef(function Resistor({
    x = 0,
    y = 0,
    scale = 1,
    value = '10k',
    isSelected = false,
    onPinClick,
    onPinHover,
    onSelect,
    draggable = true,
    onDragEnd,
}, ref) {
    const [hoveredPin, setHoveredPin] = useState(null);

    const resistorData = RESISTOR_VALUES[value] || RESISTOR_VALUES['10k'];
    const { bands, multiplier, tolerance, label } = resistorData;

    // Pin interaction handlers
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
        getValue: () => value,
        getLabel: () => label,
        getDimensions: () => ({ width: RESISTOR_WIDTH * scale, height: RESISTOR_HEIGHT * scale }),
        getPins: () => RESISTOR_PINS,
    }));

    // Calculate band positions (vertical - bands are horizontal stripes)
    const bodyX = 15;
    const bodyY = 30;
    const bandHeight = 6;
    const bandSpacing = 10;
    const firstBandY = bodyY + 8;

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
                    width={RESISTOR_WIDTH}
                    height={RESISTOR_HEIGHT + 10}
                    stroke="#FFD700"
                    strokeWidth={2}
                    dash={[5, 3]}
                    cornerRadius={5}
                    listening={false}
                />
            )}

            {/* Top lead wire */}
            <Line
                points={[25, 5, 25, 30]}
                stroke={hoveredPin === 'lead1' ? '#FFD700' : '#AAAAAA'}
                strokeWidth={3}
                lineCap="round"
            />

            {/* Bottom lead wire */}
            <Line
                points={[25, 90, 25, 115]}
                stroke={hoveredPin === 'lead2' ? '#FFD700' : '#AAAAAA'}
                strokeWidth={3}
                lineCap="round"
            />

            {/* Resistor body - beige/tan color */}
            <Rect
                x={bodyX}
                y={bodyY}
                width={BODY_WIDTH}
                height={BODY_HEIGHT}
                fill="#D4B896"
                stroke="#8B7355"
                strokeWidth={1}
                cornerRadius={3}
            />

            {/* Body end caps - darker ends */}
            <Rect
                x={bodyX}
                y={bodyY}
                width={BODY_WIDTH}
                height={5}
                fill="#A08060"
                cornerRadius={[3, 3, 0, 0]}
            />
            <Rect
                x={bodyX}
                y={bodyY + BODY_HEIGHT - 5}
                width={BODY_WIDTH}
                height={5}
                fill="#A08060"
                cornerRadius={[0, 0, 3, 3]}
            />

            {/* Color bands (horizontal stripes for vertical resistor) */}
            {/* Band 1 - First significant digit */}
            <Rect
                x={bodyX + 2}
                y={firstBandY}
                width={BODY_WIDTH - 4}
                height={bandHeight}
                fill={BAND_COLORS[bands[0]]}
            />

            {/* Band 2 - Second significant digit */}
            <Rect
                x={bodyX + 2}
                y={firstBandY + bandSpacing}
                width={BODY_WIDTH - 4}
                height={bandHeight}
                fill={BAND_COLORS[bands[1]]}
            />

            {/* Band 3 - Third significant digit */}
            <Rect
                x={bodyX + 2}
                y={firstBandY + bandSpacing * 2}
                width={BODY_WIDTH - 4}
                height={bandHeight}
                fill={BAND_COLORS[bands[2]]}
            />

            {/* Band 4 - Multiplier */}
            <Rect
                x={bodyX + 2}
                y={firstBandY + bandSpacing * 3}
                width={BODY_WIDTH - 4}
                height={bandHeight}
                fill={MULTIPLIER_COLORS[multiplier]}
            />

            {/* Band 5 - Tolerance (gold stripe) */}
            <Rect
                x={bodyX + 2}
                y={firstBandY + bandSpacing * 4 + 4}
                width={BODY_WIDTH - 4}
                height={bandHeight}
                fill={TOLERANCE_COLORS[tolerance]}
            />

            {/* Interactive pin areas - Top lead */}
            <Circle
                x={25}
                y={5}
                radius={8}
                fill="transparent"
                onMouseEnter={() => pinHover('lead1')}
                onMouseLeave={pinLeave}
                onClick={() => pinClick('lead1')}
            />

            {/* Interactive pin areas - Bottom lead */}
            <Circle
                x={25}
                y={115}
                radius={8}
                fill="transparent"
                onMouseEnter={() => pinHover('lead2')}
                onMouseLeave={pinLeave}
                onClick={() => pinClick('lead2')}
            />

            {/* Value label to the right of resistor */}
            <Text
                x={40}
                y={55}
                text={label}
                fontSize={10}
                fill="#333"
                fontStyle="bold"
            />

            {/* Pin indicator dots */}
            <Circle
                x={25}
                y={5}
                radius={4}
                fill={hoveredPin === 'lead1' ? '#FFD700' : '#888888'}
                stroke="#555"
                strokeWidth={1}
            />
            <Circle
                x={25}
                y={115}
                radius={4}
                fill={hoveredPin === 'lead2' ? '#FFD700' : '#888888'}
                stroke="#555"
                strokeWidth={1}
            />

            {/* Tooltip on pin hover */}
            {hoveredPin && (
                <Group x={25} y={hoveredPin === 'lead1' ? -15 : 135}>
                    <Rect
                        x={-30}
                        y={-12}
                        width={60}
                        height={22}
                        fill="rgba(0,0,0,0.9)"
                        cornerRadius={4}
                    />
                    <Text
                        x={-30}
                        y={-7}
                        width={60}
                        text={hoveredPin === 'lead1' ? 'Lead 1' : 'Lead 2'}
                        fontSize={10}
                        fill="#fff"
                        align="center"
                        fontStyle="bold"
                    />
                </Group>
            )}
        </Group>
    );
});

Resistor.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    scale: PropTypes.number,
    value: PropTypes.oneOf(['220', '330', '470', '1k', '4.7k', '10k', '100k', '1M']),
    onPinClick: PropTypes.func,
    onPinHover: PropTypes.func,
    draggable: PropTypes.bool,
    onDragEnd: PropTypes.func,
};

// Export dimensions and pins for workspace calculations
export const RESISTOR_DIMENSIONS = { width: RESISTOR_WIDTH, height: RESISTOR_HEIGHT };
export const AVAILABLE_VALUES = Object.keys(RESISTOR_VALUES);
export { RESISTOR_PINS };
export default Resistor;
