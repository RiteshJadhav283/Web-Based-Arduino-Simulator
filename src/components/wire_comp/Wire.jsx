/**
 * Wire Component - Konva-based Wire for connecting pins
 * 
 * Renders a wire line between points with support for bend points.
 * Wires are drawn as connected line segments.
 */

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Group, Line, Circle } from 'react-konva';
import PropTypes from 'prop-types';

// Wire colors available
const WIRE_COLORS = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0066FF',
    yellow: '#FFFF00',
    orange: '#FF6600',
    purple: '#9900FF',
    white: '#FFFFFF',
    black: '#333333',
};

const Wire = forwardRef(function Wire({
    id,
    points = [],        // Array of {x, y} coordinates
    color = 'red',
    strokeWidth = 3,
    isSelected = false,
    isPreview = false,  // True when wire is being drawn
    onClick,
    onDelete,
}, ref) {
    const [isHovered, setIsHovered] = useState(false);

    const wireColor = WIRE_COLORS[color] || color;

    // Convert points array to flat array for Konva Line [x1, y1, x2, y2, ...]
    const flatPoints = points.flatMap(p => [p.x, p.y]);

    useImperativeHandle(ref, () => ({
        getPoints: () => points,
        getId: () => id,
    }));

    const handleClick = (e) => {
        e.cancelBubble = true; // Prevent event from bubbling to stage
        onClick?.(id);
    };

    return (
        <Group>
            {/* Main wire line */}
            <Line
                points={flatPoints}
                stroke={isSelected ? '#FFD700' : wireColor}
                strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
                lineCap="round"
                lineJoin="round"
                opacity={isPreview ? 0.6 : 1}
                shadowColor={isSelected ? '#FFD700' : 'transparent'}
                shadowBlur={isSelected ? 8 : 0}
                onMouseEnter={() => !isPreview && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={isPreview ? undefined : handleClick}
                hitStrokeWidth={isPreview ? 0 : 15} // Disable hit area for preview so clicks pass through
                listening={!isPreview} // Preview wire should not capture clicks
            />

            {/* Hover highlight line (wider, transparent) */}
            {isHovered && !isPreview && (
                <Line
                    points={flatPoints}
                    stroke={wireColor}
                    strokeWidth={strokeWidth + 4}
                    lineCap="round"
                    lineJoin="round"
                    opacity={0.3}
                />
            )}

            {/* Junction points at bends (only for completed wires with 3+ points) */}
            {!isPreview && points.length > 2 && points.slice(1, -1).map((point, index) => (
                <Circle
                    key={`junction-${index}`}
                    x={point.x}
                    y={point.y}
                    radius={4}
                    fill={isSelected ? '#FFD700' : wireColor}
                    stroke="#333"
                    strokeWidth={1}
                />
            ))}

            {/* End point indicators for preview wire */}
            {isPreview && points.length >= 1 && (
                <>
                    {/* Start point */}
                    <Circle
                        x={points[0].x}
                        y={points[0].y}
                        radius={5}
                        fill={wireColor}
                        stroke="#fff"
                        strokeWidth={2}
                        listening={false}
                    />
                    {/* Current end point */}
                    {points.length >= 2 && (
                        <Circle
                            x={points[points.length - 1].x}
                            y={points[points.length - 1].y}
                            radius={4}
                            fill={wireColor}
                            opacity={0.7}
                            listening={false}
                        />
                    )}
                </>
            )}
        </Group>
    );
});

Wire.propTypes = {
    id: PropTypes.string,
    points: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    })).isRequired,
    color: PropTypes.string,
    strokeWidth: PropTypes.number,
    isSelected: PropTypes.bool,
    isPreview: PropTypes.bool,
    onClick: PropTypes.func,
    onDelete: PropTypes.func,
};

// Export wire colors for use elsewhere
export const AVAILABLE_WIRE_COLORS = Object.keys(WIRE_COLORS);
export default Wire;
