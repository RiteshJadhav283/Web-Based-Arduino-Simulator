/**
 * @fileoverview ArduinoUno - Tinkercad/Wokwi-quality SVG Arduino Uno
 * 
 * Visual-only simulation component with realistic depth, shadows, and interactions.
 * NOT hardware emulation - pins are logical endpoints only.
 * 
 * @version 3.0.0
 */

import { useState, useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import './ArduinoUno.css';

// =============================================================================
// PIN CONFIGURATION
// =============================================================================

export const PinCategory = Object.freeze({
    DIGITAL: 'digital',
    ANALOG: 'analog',
    POWER: 'power',
    GROUND: 'ground',
    REFERENCE: 'reference',
    CONTROL: 'control',
});

const DIGITAL_PINS = Object.freeze([
    { id: 'AREF', name: 'AREF', category: PinCategory.REFERENCE, x: 178, y: 28 },
    { id: 'GND_D', name: 'GND', category: PinCategory.GROUND, x: 196, y: 28 },
    { id: 'D13', name: '13', category: PinCategory.DIGITAL, pwm: false, x: 214, y: 28 },
    { id: 'D12', name: '12', category: PinCategory.DIGITAL, pwm: false, x: 232, y: 28 },
    { id: 'D11', name: '~11', category: PinCategory.DIGITAL, pwm: true, x: 250, y: 28 },
    { id: 'D10', name: '~10', category: PinCategory.DIGITAL, pwm: true, x: 268, y: 28 },
    { id: 'D9', name: '~9', category: PinCategory.DIGITAL, pwm: true, x: 286, y: 28 },
    { id: 'D8', name: '8', category: PinCategory.DIGITAL, pwm: false, x: 304, y: 28 },
    { id: 'D7', name: '7', category: PinCategory.DIGITAL, pwm: false, x: 330, y: 28 },
    { id: 'D6', name: '~6', category: PinCategory.DIGITAL, pwm: true, x: 348, y: 28 },
    { id: 'D5', name: '~5', category: PinCategory.DIGITAL, pwm: true, x: 366, y: 28 },
    { id: 'D4', name: '4', category: PinCategory.DIGITAL, pwm: false, x: 384, y: 28 },
    { id: 'D3', name: '~3', category: PinCategory.DIGITAL, pwm: true, x: 402, y: 28 },
    { id: 'D2', name: '2', category: PinCategory.DIGITAL, pwm: false, x: 420, y: 28 },
    { id: 'D1', name: 'TX→1', category: PinCategory.DIGITAL, pwm: false, x: 438, y: 28 },
    { id: 'D0', name: 'RX←0', category: PinCategory.DIGITAL, pwm: false, x: 456, y: 28 },
]);

const POWER_PINS = Object.freeze([
    { id: 'IOREF', name: 'IOREF', category: PinCategory.REFERENCE, x: 160, y: 292 },
    { id: 'RESET', name: 'RESET', category: PinCategory.CONTROL, x: 178, y: 292 },
    { id: '3V3', name: '3.3V', category: PinCategory.POWER, voltage: 3.3, x: 196, y: 292 },
    { id: '5V', name: '5V', category: PinCategory.POWER, voltage: 5, x: 214, y: 292 },
    { id: 'GND_1', name: 'GND', category: PinCategory.GROUND, x: 232, y: 292 },
    { id: 'GND_2', name: 'GND', category: PinCategory.GROUND, x: 250, y: 292 },
    { id: 'VIN', name: 'Vin', category: PinCategory.POWER, voltage: 'input', x: 268, y: 292 },
]);

const ANALOG_PINS = Object.freeze([
    { id: 'A0', name: 'A0', category: PinCategory.ANALOG, x: 330, y: 292 },
    { id: 'A1', name: 'A1', category: PinCategory.ANALOG, x: 348, y: 292 },
    { id: 'A2', name: 'A2', category: PinCategory.ANALOG, x: 366, y: 292 },
    { id: 'A3', name: 'A3', category: PinCategory.ANALOG, x: 384, y: 292 },
    { id: 'A4', name: 'A4', category: PinCategory.ANALOG, x: 402, y: 292 },
    { id: 'A5', name: 'A5', category: PinCategory.ANALOG, x: 420, y: 292 },
]);

export const PINS = Object.freeze({
    digital: DIGITAL_PINS,
    analog: ANALOG_PINS,
    power: POWER_PINS,
    get all() { return [...DIGITAL_PINS, ...ANALOG_PINS, ...POWER_PINS]; },
    findById(id) { return this.all.find(pin => pin.id === id) ?? null; },
});

// =============================================================================
// SVG FILTERS (Shadows, Glows, 3D Effects)
// =============================================================================

const SvgFilters = memo(function SvgFilters() {
    return (
        <defs>
            {/* Board drop shadow */}
            <filter id="boardShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="4" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.4" />
            </filter>

            {/* Inner shadow for depth */}
            <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feComponentTransfer in="SourceAlpha">
                    <feFuncA type="table" tableValues="1 0" />
                </feComponentTransfer>
                <feGaussianBlur stdDeviation="2" />
                <feOffset dx="2" dy="2" result="offsetblur" />
                <feFlood floodColor="#000" floodOpacity="0.3" result="color" />
                <feComposite in2="offsetblur" operator="in" />
                <feComposite in2="SourceAlpha" operator="in" />
                <feMerge>
                    <feMergeNode in="SourceGraphic" />
                    <feMergeNode />
                </feMerge>
            </filter>

            {/* Pin glow on hover */}
            <filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            {/* LED glow effect */}
            <filter id="ledGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            {/* 3D header socket */}
            <linearGradient id="headerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2a2a2a" />
                <stop offset="50%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>

            {/* Board gradient */}
            <linearGradient id="boardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5DADE2" />
                <stop offset="50%" stopColor="#3498DB" />
                <stop offset="100%" stopColor="#2E86C1" />
            </linearGradient>

            {/* Chip gradient */}
            <linearGradient id="chipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a3a3a" />
                <stop offset="50%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>

            {/* Metal pin gradient */}
            <linearGradient id="pinMetalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#FFD54F" />
                <stop offset="100%" stopColor="#FFC107" />
            </linearGradient>

            {/* USB port gradient */}
            <linearGradient id="usbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#CFD8DC" />
                <stop offset="50%" stopColor="#B0BEC5" />
                <stop offset="100%" stopColor="#90A4AE" />
            </linearGradient>
        </defs>
    );
});

// =============================================================================
// INTERACTIVE PIN
// =============================================================================

const Pin = memo(function Pin({ pin, isHovered, isSelected, onMouseEnter, onMouseLeave, onClick }) {
    const baseClass = `arduino-pin ${pin.category}`;
    const stateClass = `${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`;

    return (
        <g
            className={`pin-group ${stateClass}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            {/* Pin socket background */}
            <rect
                x={pin.x - 7}
                y={pin.y - 7}
                width={14}
                height={14}
                rx={2}
                className="pin-socket"
            />

            {/* Metal pin */}
            <rect
                x={pin.x - 5}
                y={pin.y - 5}
                width={10}
                height={10}
                rx={1}
                className={`${baseClass} ${stateClass}`}
                data-pin-id={pin.id}
                filter={isHovered || isSelected ? 'url(#pinGlow)' : undefined}
            />

            {/* Pin hole */}
            <circle
                cx={pin.x}
                cy={pin.y}
                r={2}
                className="pin-hole"
            />
        </g>
    );
});

Pin.propTypes = {
    pin: PropTypes.object.isRequired,
    isHovered: PropTypes.bool,
    isSelected: PropTypes.bool,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
};

// =============================================================================
// TOOLTIP
// =============================================================================

const PinTooltip = memo(function PinTooltip({ pin, position }) {
    if (!pin) return null;

    const categoryColors = {
        digital: '#FFD54F',
        analog: '#64B5F6',
        power: '#EF5350',
        ground: '#757575',
        reference: '#BA68C8',
        control: '#81C784',
    };

    return (
        <div
            className="pin-tooltip"
            style={{
                left: position.x,
                top: position.y,
            }}
        >
            <div className="tooltip-header">
                <span className="tooltip-name">{pin.name}</span>
                {pin.pwm && <span className="tooltip-badge pwm">PWM</span>}
            </div>
            <div className="tooltip-body">
                <span
                    className="tooltip-category"
                    style={{ color: categoryColors[pin.category] }}
                >
                    {pin.category.toUpperCase()}
                </span>
                {pin.voltage && (
                    <span className="tooltip-voltage">
                        {typeof pin.voltage === 'number' ? `${pin.voltage}V` : pin.voltage}
                    </span>
                )}
            </div>
        </div>
    );
});

// =============================================================================
// BOARD VISUALS
// =============================================================================

const BoardVisuals = memo(function BoardVisuals() {
    return (
        <>
            {/* === LAYER 1: BOARD BASE === */}
            <g className="layer-board">
                {/* Main PCB with shadow */}
                <rect
                    x="5"
                    y="5"
                    width="470"
                    height="310"
                    rx="10"
                    className="board-base"
                    filter="url(#boardShadow)"
                />

                {/* Board edge highlight */}
                <rect
                    x="5"
                    y="5"
                    width="470"
                    height="310"
                    rx="10"
                    className="board-edge"
                />

                {/* Mounting holes */}
                {[[20, 18], [460, 18], [460, 230], [460, 300]].map(([cx, cy], i) => (
                    <g key={`mount-${i}`}>
                        <circle cx={cx} cy={cy} r={8} className="mounting-hole-outer" />
                        <circle cx={cx} cy={cy} r={5} className="mounting-hole-inner" />
                    </g>
                ))}
            </g>

            {/* === LAYER 2: CONNECTORS === */}
            <g className="layer-connectors">
                {/* USB Port */}
                <g className="usb-group">
                    <rect x="-8" y="75" width="48" height="75" rx="3" className="usb-housing" />
                    <rect x="2" y="85" width="32" height="55" rx="2" className="usb-metal" />
                    <rect x="8" y="95" width="20" height="35" className="usb-inner" />
                </g>

                {/* Power Jack */}
                <g className="power-jack-group">
                    <rect x="-10" y="215" width="52" height="42" rx="4" className="power-housing" />
                    <circle cx="16" cy="236" r="13" className="power-barrel-outer" />
                    <circle cx="16" cy="236" r="7" className="power-barrel-inner" />
                    <circle cx="16" cy="236" r="3" className="power-barrel-center" />
                </g>
            </g>

            {/* === LAYER 3: COMPONENTS === */}
            <g className="layer-components">
                {/* Reset Button */}
                <g className="reset-group">
                    <rect x="50" y="22" width="32" height="28" rx="3" className="reset-housing" />
                    <circle cx="66" cy="36" r="10" className="reset-button-outer" />
                    <circle cx="66" cy="35" r="8" className="reset-button-inner" />
                </g>

                {/* Small IC (ATmega16U2) */}
                <g className="ic-small-group">
                    <rect x="105" y="95" width="32" height="32" className="ic-body" />
                    {[...Array(4)].map((_, i) => (
                        <rect key={`ic-l-${i}`} x="99" y={100 + i * 7} width="7" height="3" className="ic-pin" />
                    ))}
                    {[...Array(4)].map((_, i) => (
                        <rect key={`ic-r-${i}`} x="136" y={100 + i * 7} width="7" height="3" className="ic-pin" />
                    ))}
                </g>

                {/* LEDs with glow */}
                <g className="leds-group">
                    {/* L LED */}
                    <text x="150" y="138" className="led-label">L</text>
                    <circle cx="162" cy="133" r="4" className="led led-l" filter="url(#ledGlow)" />

                    {/* TX LED */}
                    <text x="108" y="148" className="led-label">TX</text>
                    <rect x="125" y="140" width="6" height="6" rx="1" className="led led-tx" filter="url(#ledGlow)" />

                    {/* RX LED */}
                    <text x="108" y="164" className="led-label">RX</text>
                    <rect x="125" y="156" width="6" height="6" rx="1" className="led led-rx" filter="url(#ledGlow)" />

                    {/* ON LED */}
                    <text x="440" y="158" className="led-label-right">ON</text>
                    <circle cx="453" cy="153" r="4" className="led led-on" filter="url(#ledGlow)" />
                </g>

                {/* Crystal Oscillator */}
                <ellipse cx="155" cy="200" rx="20" ry="8" className="crystal" />

                {/* ATmega328P */}
                <g className="atmega-group">
                    <rect x="235" y="190" width="165" height="40" rx="2" className="atmega-body" />
                    {[...Array(14)].map((_, i) => (
                        <rect key={`at-t-${i}`} x={243 + i * 11} y="184" width="5" height="8" className="atmega-pin" />
                    ))}
                    {[...Array(14)].map((_, i) => (
                        <rect key={`at-b-${i}`} x={243 + i * 11} y="228" width="5" height="8" className="atmega-pin" />
                    ))}
                    <circle cx="235" cy="210" r="5" className="atmega-notch" />
                    <circle cx="320" cy="210" r="3" className="atmega-dot" />
                    <circle cx="380" cy="210" r="3" className="atmega-dot" />
                </g>

                {/* Electrolytic Capacitors */}
                <g className="capacitors-group">
                    <circle cx="145" cy="265" r="10" className="cap-electrolytic" />
                    <circle cx="145" cy="265" r="6" className="cap-top" />
                    <circle cx="178" cy="265" r="10" className="cap-electrolytic" />
                    <circle cx="178" cy="265" r="6" className="cap-top" />
                </g>

                {/* Voltage Regulator */}
                <rect x="52" y="165" width="28" height="12" rx="2" className="vreg" />
            </g>

            {/* === LAYER 4: BRANDING === */}
            <g className="layer-branding">
                {/* Arduino Logo */}
                <g transform="translate(240, 110)">
                    {/* Infinity symbol */}
                    <path
                        d="M-25,15 C-25,5 -15,-5 0,0 C15,-5 25,5 25,15 C25,25 15,35 0,30 C-15,35 -25,25 -25,15 Z M25,15 C25,5 35,-5 50,0 C65,-5 75,5 75,15 C75,25 65,35 50,30 C35,35 25,25 25,15 Z"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="4"
                        className="arduino-infinity"
                    />
                    {/* Plus sign */}
                    <line x1="-12" y1="15" x2="12" y2="15" stroke="#fff" strokeWidth="3" />
                    <line x1="0" y1="3" x2="0" y2="27" stroke="#fff" strokeWidth="3" />
                    {/* Minus sign */}
                    <line x1="38" y1="15" x2="62" y2="15" stroke="#fff" strokeWidth="3" />

                    <text x="25" y="55" className="arduino-text">ARDUINO</text>
                </g>

                {/* UNO label */}
                <g transform="translate(365, 108)">
                    <rect x="0" y="0" width="75" height="40" rx="4" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4,2" />
                    <text x="37" y="28" className="uno-text">UNO</text>
                </g>
            </g>

            {/* === LAYER 5: HEADERS === */}
            <g className="layer-headers">
                {/* Digital Header */}
                <rect x="170" y="12" width="295" height="32" rx="3" className="pin-header" />

                {/* Power Header */}
                <rect x="152" y="276" width="125" height="32" rx="3" className="pin-header" />

                {/* Analog Header */}
                <rect x="322" y="276" width="108" height="32" rx="3" className="pin-header" />

                {/* ICSP Header */}
                <rect x="430" y="200" width="24" height="18" rx="2" className="pin-header-small" />
            </g>

            {/* === LAYER 6: LABELS === */}
            <g className="layer-labels">
                {/* Digital labels */}
                <text x="335" y="55" className="header-label">DIGITAL (PWM~)</text>

                {/* Pin labels */}
                {DIGITAL_PINS.map(pin => (
                    <text key={pin.id} x={pin.x} y={52} className="pin-label">{pin.name}</text>
                ))}

                {/* Power labels */}
                <text x="215" y="263" className="header-label">POWER</text>
                {POWER_PINS.map(pin => (
                    <text key={pin.id} x={pin.x} y={272} className="pin-label">{pin.name}</text>
                ))}

                {/* Analog labels */}
                <text x="375" y="263" className="header-label">ANALOG IN</text>
                {ANALOG_PINS.map(pin => (
                    <text key={pin.id} x={pin.x} y={272} className="pin-label">{pin.name}</text>
                ))}
            </g>
        </>
    );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ArduinoUno({
    id,
    onPinClick,
    onPinHover,
    onPinLeave,
    selectedPin = null,
    scale = 1,
    style = {},
    className = '',
}) {
    const [hoveredPin, setHoveredPin] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [showTooltip, setShowTooltip] = useState(false);

    const handlePinMouseEnter = useCallback((pin, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setHoveredPin(pin);
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 8
        });
        // Slight delay for tooltip
        setTimeout(() => setShowTooltip(true), 100);
        onPinHover?.(pin);
    }, [onPinHover]);

    const handlePinMouseLeave = useCallback(() => {
        setHoveredPin(null);
        setShowTooltip(false);
        onPinLeave?.();
    }, [onPinLeave]);

    const handlePinClick = useCallback((pin) => {
        onPinClick?.(pin);
    }, [onPinClick]);

    const allPins = useMemo(() => PINS.all, []);

    const containerStyle = useMemo(() => ({
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        ...style,
    }), [scale, style]);

    return (
        <div
            id={id}
            className={`arduino-uno-container ${className}`}
            style={containerStyle}
        >
            <svg
                viewBox="0 0 480 320"
                className="arduino-uno-svg"
                xmlns="http://www.w3.org/2000/svg"
            >
                <SvgFilters />
                <BoardVisuals />

                {/* Interactive pins on top */}
                <g className="layer-pins">
                    {allPins.map((pin) => (
                        <Pin
                            key={pin.id}
                            pin={pin}
                            isHovered={hoveredPin?.id === pin.id}
                            isSelected={selectedPin?.id === pin.id}
                            onMouseEnter={(e) => handlePinMouseEnter(pin, e)}
                            onMouseLeave={handlePinMouseLeave}
                            onClick={() => handlePinClick(pin)}
                        />
                    ))}
                </g>
            </svg>

            {showTooltip && hoveredPin && (
                <PinTooltip pin={hoveredPin} position={tooltipPosition} />
            )}
        </div>
    );
}

ArduinoUno.propTypes = {
    id: PropTypes.string,
    onPinClick: PropTypes.func,
    onPinHover: PropTypes.func,
    onPinLeave: PropTypes.func,
    selectedPin: PropTypes.object,
    scale: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
};

export default memo(ArduinoUno);
