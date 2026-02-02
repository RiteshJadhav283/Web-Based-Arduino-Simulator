/**
 * ArduinoUnoV3 - Tinkercad-style Arduino Uno
 * 
 * Ultra-clean, friendly design inspired by Tinkercad's aesthetic:
 * - Smooth rounded corners
 * - Clean flat colors with subtle depth
 * - Clear pin labeling
 * - Satisfying interactions
 */

import { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Group, Rect, Circle, Text, Path } from 'react-konva';
import PropTypes from 'prop-types';

// =============================================================================
// TINKERCAD-STYLE COLORS
// =============================================================================

const COLORS = {
    pcb: '#00979D',
    pcbDark: '#007A7F',
    pcbLight: '#00B0B5',
    header: '#303030',
    headerHole: '#1a1a1a',
    pinHover: '#FFD700',
    pinDigital: '#FFEB3B',
    pinAnalog: '#2196F3',
    pinPower: '#F44336',
    pinGround: '#424242',
    usb: '#A8A8A8',
    usbDark: '#888888',
    chip: '#2D2D2D',
    chipText: '#6B6B6B',
    led: '#333333',
    ledOn: '#FFEB3B',
    ledTx: '#4CAF50',
    ledRx: '#FF9800',
    reset: '#E53935',
    resetDark: '#B71C1C',
    crystal: '#C0C0C0',
    text: '#FFFFFF',
    textMuted: '#B2DFDB',
};

// =============================================================================
// PIN DEFINITIONS
// =============================================================================

const DIGITAL_PINS = [
    { id: 'D0', label: '0', subLabel: 'RX', x: 230 },
    { id: 'D1', label: '1', subLabel: 'TX', x: 218 },
    { id: 'D2', label: '2', x: 206 },
    { id: 'D3', label: '~3', pwm: true, x: 194 },
    { id: 'D4', label: '4', x: 182 },
    { id: 'D5', label: '~5', pwm: true, x: 170 },
    { id: 'D6', label: '~6', pwm: true, x: 158 },
    { id: 'D7', label: '7', x: 146 },
    { id: 'D8', label: '8', x: 130 },
    { id: 'D9', label: '~9', pwm: true, x: 118 },
    { id: 'D10', label: '~10', pwm: true, x: 106 },
    { id: 'D11', label: '~11', pwm: true, x: 94 },
    { id: 'D12', label: '12', x: 82 },
    { id: 'D13', label: '13', x: 70 },
];

const POWER_PINS = [
    { id: 'IOREF', label: 'IOREF', x: 70, type: 'ref' },
    { id: 'RESET', label: 'RST', x: 82, type: 'control' },
    { id: '3V3', label: '3.3V', x: 94, type: 'power' },
    { id: '5V', label: '5V', x: 106, type: 'power' },
    { id: 'GND1', label: 'GND', x: 118, type: 'ground' },
    { id: 'GND2', label: 'GND', x: 130, type: 'ground' },
    { id: 'VIN', label: 'VIN', x: 142, type: 'power' },
];

const ANALOG_PINS = [
    { id: 'A0', label: 'A0', x: 166 },
    { id: 'A1', label: 'A1', x: 178 },
    { id: 'A2', label: 'A2', x: 190 },
    { id: 'A3', label: 'A3', x: 202 },
    { id: 'A4', label: 'A4', x: 214 },
    { id: 'A5', label: 'A5', x: 226 },
];

const BOARD_WIDTH = 260;
const BOARD_HEIGHT = 170;

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const PinHole = ({ x, y, pinId, label, isHovered, onHover, onLeave, onClick, color = COLORS.headerHole }) => (
    <Group x={x} y={y}>
        {/* Pin socket */}
        <Rect
            x={-4}
            y={-4}
            width={8}
            height={8}
            fill={isHovered ? COLORS.pinHover : color}
            cornerRadius={1}
            shadowColor={isHovered ? COLORS.pinHover : 'transparent'}
            shadowBlur={isHovered ? 8 : 0}
            shadowOpacity={0.8}
        />
        {/* Interaction area */}
        <Circle
            x={0}
            y={0}
            radius={6}
            fill="transparent"
            name={pinId}
            onMouseEnter={() => onHover(pinId, label)}
            onMouseLeave={onLeave}
            onClick={() => onClick(pinId)}
        />
    </Group>
);

const LED = ({ x, y, color, isOn, label }) => (
    <Group x={x} y={y}>
        <Circle
            x={0}
            y={0}
            radius={3}
            fill={isOn ? color : COLORS.led}
            shadowColor={isOn ? color : 'transparent'}
            shadowBlur={isOn ? 12 : 0}
            shadowOpacity={isOn ? 0.9 : 0}
        />
        {label && (
            <Text
                x={-10}
                y={6}
                width={20}
                text={label}
                fontSize={5}
                fill={COLORS.textMuted}
                align="center"
            />
        )}
    </Group>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ArduinoUnoV3 = forwardRef(function ArduinoUnoV3({
    scale = 1,
    onPinClick,
    onPinHover,
    onReset,
    x = 0,
    y = 0,
}, ref) {
    const [hoveredPin, setHoveredPin] = useState(null);
    const [pinLabel, setPinLabel] = useState('');
    const [resetPressed, setResetPressed] = useState(false);
    const [ledStates, setLedStates] = useState({
        L: false,
        TX: false,
        RX: false,
        ON: true,
    });

    // Expose LED control to parent
    useImperativeHandle(ref, () => ({
        setLED: (led, state) => {
            setLedStates(prev => ({ ...prev, [led]: state }));
        },
        blinkLED: (led, duration = 100) => {
            setLedStates(prev => ({ ...prev, [led]: true }));
            setTimeout(() => {
                setLedStates(prev => ({ ...prev, [led]: false }));
            }, duration);
        },
    }));

    const handlePinHover = useCallback((pinId, label) => {
        setHoveredPin(pinId);
        setPinLabel(label);
        document.body.style.cursor = 'crosshair';
        onPinHover?.(pinId, label);
    }, [onPinHover]);

    const handlePinLeave = useCallback(() => {
        setHoveredPin(null);
        setPinLabel('');
        document.body.style.cursor = 'default';
    }, []);

    const handlePinClick = useCallback((pinId) => {
        onPinClick?.(pinId);
    }, [onPinClick]);

    const stageWidth = BOARD_WIDTH * scale;
    const stageHeight = BOARD_HEIGHT * scale;

    return (
        <Stage width={stageWidth} height={stageHeight}>
            <Layer>
                <Group x={0} y={0} scaleX={scale} scaleY={scale} draggable>

                    {/* === PCB BOARD === */}
                    <Rect
                        x={0}
                        y={0}
                        width={BOARD_WIDTH}
                        height={BOARD_HEIGHT}
                        fill={COLORS.pcb}
                        stroke={COLORS.pcbDark}
                        strokeWidth={2}
                        cornerRadius={8}
                        shadowColor="#000"
                        shadowBlur={12}
                        shadowOpacity={0.25}
                        shadowOffsetX={3}
                        shadowOffsetY={3}
                    />

                    {/* === MOUNTING HOLES === */}
                    {[[14, 14], [246, 14], [14, 156], [246, 136]].map(([hx, hy], i) => (
                        <Group key={`mount-${i}`} x={hx} y={hy}>
                            <Circle radius={5} fill={COLORS.pcbDark} />
                            <Circle radius={3} fill="#FAFAFA" />
                        </Group>
                    ))}

                    {/* === USB-B PORT === */}
                    <Group x={-6} y={45}>
                        <Rect
                            width={35}
                            height={42}
                            fill={COLORS.usb}
                            stroke={COLORS.usbDark}
                            strokeWidth={1}
                            cornerRadius={[3, 0, 0, 3]}
                        />
                        <Rect x={6} y={6} width={23} height={30} fill={COLORS.usbDark} cornerRadius={2} />
                        <Rect x={10} y={12} width={15} height={18} fill="#505050" />
                    </Group>

                    {/* === DC POWER JACK === */}
                    <Group x={-6} y={110}>
                        <Rect width={32} height={28} fill="#1a1a1a" cornerRadius={[3, 0, 0, 3]} />
                        <Circle x={16} y={14} radius={9} fill="#333" />
                        <Circle x={16} y={14} radius={5} fill="#1a1a1a" />
                    </Group>

                    {/* === ATMEGA328P === */}
                    <Group x={85} y={65}>
                        <Rect width={90} height={32} fill={COLORS.chip} cornerRadius={2} />
                        <Circle x={0} y={16} radius={4} fill="#404040" />
                        {/* Top pins */}
                        {[...Array(14)].map((_, i) => (
                            <Circle key={`ct-${i}`} x={8 + i * 5.5} y={-2} radius={1.5} fill="#B0B0B0" />
                        ))}
                        {/* Bottom pins */}
                        {[...Array(14)].map((_, i) => (
                            <Circle key={`cb-${i}`} x={8 + i * 5.5} y={34} radius={1.5} fill="#B0B0B0" />
                        ))}
                        <Text x={10} y={10} text="ATMEGA328P" fontSize={6} fill={COLORS.chipText} fontFamily="monospace" />
                    </Group>

                    {/* === CRYSTAL === */}
                    <Group x={70} y={105}>
                        <Rect width={16} height={5} fill={COLORS.crystal} cornerRadius={2} />
                    </Group>

                    {/* === LEDS === */}
                    <LED x={200} y={52} color={COLORS.ledOn} isOn={ledStates.L} label="L" />
                    <LED x={212} y={52} color={COLORS.ledTx} isOn={ledStates.TX} label="TX" />
                    <LED x={224} y={52} color={COLORS.ledRx} isOn={ledStates.RX} label="RX" />
                    <LED x={240} y={90} color="#4CAF50" isOn={ledStates.ON} label="ON" />

                    {/* === RESET BUTTON === */}
                    <Group x={50} y={25}>
                        <Rect width={14} height={14} fill="#666" cornerRadius={2} />
                        <Circle
                            x={7}
                            y={7 + (resetPressed ? 1 : 0)}
                            radius={5}
                            fill={resetPressed ? COLORS.resetDark : COLORS.reset}
                            shadowColor="#000"
                            shadowBlur={resetPressed ? 2 : 4}
                            shadowOpacity={0.4}
                            onMouseDown={() => {
                                setResetPressed(true);
                                onReset?.();
                            }}
                            onMouseUp={() => setResetPressed(false)}
                            onMouseLeave={() => setResetPressed(false)}
                        />
                        <Text x={-4} y={18} text="RESET" fontSize={4} fill={COLORS.textMuted} />
                    </Group>

                    {/* === DIGITAL HEADER === */}
                    <Group y={8}>
                        <Rect x={62} y={0} width={180} height={14} fill={COLORS.header} cornerRadius={2} />
                        <Text x={120} y={16} text="DIGITAL (PWM~)" fontSize={5} fill={COLORS.textMuted} />

                        {DIGITAL_PINS.map(pin => (
                            <Group key={pin.id}>
                                <PinHole
                                    x={pin.x}
                                    y={7}
                                    pinId={pin.id}
                                    label={pin.label}
                                    isHovered={hoveredPin === pin.id}
                                    onHover={handlePinHover}
                                    onLeave={handlePinLeave}
                                    onClick={handlePinClick}
                                />
                                <Text
                                    x={pin.x - 8}
                                    y={-8}
                                    width={16}
                                    text={pin.label}
                                    fontSize={5}
                                    fill={COLORS.textMuted}
                                    align="center"
                                />
                            </Group>
                        ))}
                    </Group>

                    {/* === POWER HEADER === */}
                    <Group y={148}>
                        <Rect x={62} y={0} width={90} height={14} fill={COLORS.header} cornerRadius={2} />
                        <Text x={90} y={16} text="POWER" fontSize={5} fill={COLORS.textMuted} />

                        {POWER_PINS.map(pin => (
                            <Group key={pin.id}>
                                <PinHole
                                    x={pin.x}
                                    y={7}
                                    pinId={pin.id}
                                    label={pin.label}
                                    isHovered={hoveredPin === pin.id}
                                    onHover={handlePinHover}
                                    onLeave={handlePinLeave}
                                    onClick={handlePinClick}
                                    color={
                                        pin.type === 'power' ? COLORS.pinPower :
                                            pin.type === 'ground' ? COLORS.pinGround :
                                                COLORS.headerHole
                                    }
                                />
                                <Text
                                    x={pin.x - 10}
                                    y={-8}
                                    width={20}
                                    text={pin.label}
                                    fontSize={4}
                                    fill={COLORS.textMuted}
                                    align="center"
                                />
                            </Group>
                        ))}
                    </Group>

                    {/* === ANALOG HEADER === */}
                    <Group y={148}>
                        <Rect x={158} y={0} width={80} height={14} fill={COLORS.header} cornerRadius={2} />
                        <Text x={180} y={16} text="ANALOG IN" fontSize={5} fill={COLORS.textMuted} />

                        {ANALOG_PINS.map(pin => (
                            <Group key={pin.id}>
                                <PinHole
                                    x={pin.x}
                                    y={7}
                                    pinId={pin.id}
                                    label={pin.label}
                                    isHovered={hoveredPin === pin.id}
                                    onHover={handlePinHover}
                                    onLeave={handlePinLeave}
                                    onClick={handlePinClick}
                                    color={COLORS.pinAnalog}
                                />
                                <Text
                                    x={pin.x - 8}
                                    y={-8}
                                    width={16}
                                    text={pin.label}
                                    fontSize={5}
                                    fill={COLORS.textMuted}
                                    align="center"
                                />
                            </Group>
                        ))}
                    </Group>

                    {/* === BRANDING === */}
                    <Text x={110} y={98} text="ARDUINO" fontSize={9} fill={COLORS.text} fontStyle="bold" />
                    <Text x={170} y={96} text="UNO" fontSize={12} fill={COLORS.text} fontStyle="bold" />

                    {/* === HOVERED PIN TOOLTIP === */}
                    {hoveredPin && (
                        <Group x={130} y={75}>
                            <Rect
                                x={-25}
                                y={-10}
                                width={50}
                                height={18}
                                fill="rgba(0,0,0,0.8)"
                                cornerRadius={4}
                            />
                            <Text
                                x={-25}
                                y={-6}
                                width={50}
                                text={pinLabel || hoveredPin}
                                fontSize={8}
                                fill="#fff"
                                align="center"
                            />
                        </Group>
                    )}

                </Group>
            </Layer>
        </Stage>
    );
});

ArduinoUnoV3.propTypes = {
    scale: PropTypes.number,
    onPinClick: PropTypes.func,
    onPinHover: PropTypes.func,
    onReset: PropTypes.func,
    x: PropTypes.number,
    y: PropTypes.number,
};

export { DIGITAL_PINS, ANALOG_PINS, POWER_PINS, COLORS };
export default ArduinoUnoV3;
