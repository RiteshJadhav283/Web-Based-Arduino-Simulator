import { useState, forwardRef, useImperativeHandle } from 'react';
import { Group, Rect, Circle, Text, Ellipse, Line } from 'react-konva';
import PropTypes from 'prop-types';

const C = {
    // Board
    pcb: '#4A90C2',
    pcbStroke: '#3A7AAA',

    // Components
    header: '#1C1C1C',
    hole: '#0C0C0C',
    chip: '#232323',
    chipPin: '#8A8A8A',
    usb: '#E0E0E0',
    usbInner: '#C0C0C0',
    usbSlot: '#707070',
    dcJack: '#404040',
    dcJackInner: '#303030',
    resetBase: '#606060',
    resetBtn: '#CC3333',
    crystal: '#B8B8B8',
    cap: '#505050',
    capTop: '#606060',

    // LEDs
    ledOff: '#383838',
    ledL: '#FFB800',
    ledTx: '#00CC44',
    ledRx: '#FF6600',
    ledOn: '#00CC44',

    // Holes
    mountHole: '#F0EDD8',

    // Text
    white: '#FFFFFF',
    label: '#90C8E8',
};


const W = 340;  // Width
const H = 270;  // Height



// Digital pins - Left section (AREF to ~9) and Right section (8 to RX←0)
// Based on exact Tinkercad reference layout
const DIGITAL_PINS_LEFT = [
    { id: 'AREF', x: 5 },
    { id: 'GND', x: 18 },
    { id: '13', x: 31 },
    { id: '12', x: 44 },
    { id: '~11', x: 57 },
    { id: '~10', x: 70 },
    { id: '~9', x: 83 },
];

const DIGITAL_PINS_RIGHT = [
    { id: '8', x: 5 },
    { id: '7', x: 18 },
    { id: '~6', x: 31 },
    { id: '~5', x: 44 },
    { id: '4', x: 57 },
    { id: '~3', x: 70 },
    { id: '2', x: 83 },
    { id: 'TX→1', x: 96 },
    { id: 'RX←0', x: 109 },
];

// Combined for exports
const DIGITAL_PINS = [...DIGITAL_PINS_LEFT, ...DIGITAL_PINS_RIGHT];

const POWER_PINS = [
    { id: 'IOREF', x: 130 },
    { id: 'RESET', x: 143 },
    { id: '3.3V', x: 156 },
    { id: '5V', x: 169 },
    { id: 'GND1', x: 182 }, // First GND
    { id: 'GND2', x: 195 }, // Second GND
    { id: 'Vin', x: 208 },
];

const ANALOG_PINS = [
    { id: 'A0', x: 232 },
    { id: 'A1', x: 245 },
    { id: 'A2', x: 258 },
    { id: 'A3', x: 271 },
    { id: 'A4', x: 284 },
    { id: 'A5', x: 297 },
];


const ArduinoUnoV4 = forwardRef(function ArduinoUnoV4({
    x = 0,
    y = 0,
    scale = 1,
    isSelected = false,
    onPinClick,
    onPinHover,
    onReset,
    onSelect,
    draggable = true,
    onDragEnd,
}, ref) {
    const [hoveredPin, setHoveredPin] = useState(null);
    const [resetPressed, setResetPressed] = useState(false);
    const [leds, setLeds] = useState({ L: false, TX: false, RX: false, ON: true });

    useImperativeHandle(ref, () => ({
        setLED: (name, state) => setLeds(prev => ({ ...prev, [name]: state })),
        toggleLED: (name) => setLeds(prev => ({ ...prev, [name]: !prev[name] })),
        blinkLED: (name, ms = 100) => {
            setLeds(prev => ({ ...prev, [name]: true }));
            setTimeout(() => setLeds(prev => ({ ...prev, [name]: false })), ms);
        },
        // Expose dimensions for workspace calculations
        getDimensions: () => ({ width: W * scale, height: H * scale }),
    }));

    const pinHover = (id) => { setHoveredPin(id); document.body.style.cursor = 'crosshair'; onPinHover?.(id); };
    const pinLeave = () => { setHoveredPin(null); document.body.style.cursor = 'default'; };
    const pinClick = (id) => onPinClick?.(id);

    return (
        <Group
            x={x}
            y={y}
            scaleX={scale}
            scaleY={scale}
            draggable={draggable}
            onDragEnd={onDragEnd}
            onClick={onSelect}
        >
            {/* Selection highlight */}
            {isSelected && (
                <Rect
                    x={-5}
                    y={-5}
                    width={W + 10}
                    height={H + 10}
                    stroke="#FFD700"
                    strokeWidth={3}
                    dash={[10, 5]}
                    cornerRadius={10}
                    listening={false}
                />
            )}

            {/* ===== PCB BOARD ===== */}
            <Rect
                width={W} height={H}
                fill={C.pcb} stroke={C.pcbStroke} strokeWidth={2}
                cornerRadius={8}
                shadowColor="#000" shadowBlur={12} shadowOpacity={0.25}
                shadowOffsetX={4} shadowOffsetY={4}
            />

            {/* ===== MOUNTING HOLES ===== */}
            {[[18, 15], [322, 15], [18, 255], [322, 215]].map(([hx, hy], i) => (
                <Circle key={i} x={hx} y={hy} radius={7} fill={C.mountHole} />
            ))}

            {/* ===== USB-B PORT ===== */}
            <Group x={-8} y={72}>
                <Rect width={42} height={55} fill={C.usb} cornerRadius={[6, 0, 0, 6]} />
                <Rect x={6} y={7} width={30} height={41} fill={C.usbInner} cornerRadius={3} />
                <Rect x={11} y={15} width={20} height={25} fill={C.usbSlot} />
            </Group>

            {/* ===== DC POWER JACK ===== */}
            <Group x={-8} y={185}>
                <Rect width={38} height={38} fill={C.dcJack} cornerRadius={[4, 0, 0, 4]} />
                <Circle x={19} y={19} radius={12} fill={C.dcJackInner} />
                <Circle x={19} y={19} radius={6} fill="#1a1a1a" />
            </Group>

            {/* ===== RESET BUTTON ===== */}
            <Group x={38} y={28}>
                <Rect width={22} height={22} fill={C.resetBase} cornerRadius={3} />
                <Circle
                    x={11} y={11 + (resetPressed ? 1 : 0)}
                    radius={8}
                    fill={resetPressed ? '#AA2222' : C.resetBtn}
                    shadowColor="#000" shadowBlur={resetPressed ? 2 : 5} shadowOpacity={0.5}
                    onMouseDown={() => { setResetPressed(true); onReset?.(); }}
                    onMouseUp={() => setResetPressed(false)}
                    onMouseLeave={() => setResetPressed(false)}
                />
            </Group>

            {/* ===== SMALL IC (ATmega16U2) ===== */}
            <Group x={78} y={62}>
                <Rect width={30} height={30} fill={C.chip} />
                {[0, 1, 2, 3].map(i => <Rect key={`l${i}`} x={-5} y={6 + i * 5} width={5} height={2.5} fill={C.chipPin} />)}
                {[0, 1, 2, 3].map(i => <Rect key={`r${i}`} x={30} y={6 + i * 5} width={5} height={2.5} fill={C.chipPin} />)}
            </Group>

            {/* ===== TX/RX LEDs ===== */}
            <Group x={80} y={102}>
                <Text x={-20} y={-4} text="TX" fontSize={9} fill={C.label} />
                <Rect x={0} y={-3} width={6} height={6} fill={leds.TX ? C.ledTx : C.ledOff} cornerRadius={1} />
                <Text x={-20} y={10} text="RX" fontSize={9} fill={C.label} />
                <Rect x={0} y={11} width={6} height={6} fill={leds.RX ? C.ledRx : C.ledOff} cornerRadius={1} />
            </Group>

            {/* ===== L LED ===== */}
            <Group x={128} y={78}>
                <Text x={-10} y={-3} text="L" fontSize={9} fill={C.label} />
                <Circle x={4} y={3} radius={4} fill={leds.L ? C.ledL : C.ledOff}
                    shadowColor={leds.L ? C.ledL : 'transparent'} shadowBlur={leds.L ? 10 : 0} />
            </Group>

            {/* ===== ON LED ===== */}
            <Group x={308} y={82}>
                <Text x={-22} y={-3} text="ON" fontSize={9} fill={C.label} />
                <Circle x={0} y={3} radius={5} fill={leds.ON ? C.ledOn : C.ledOff}
                    shadowColor={leds.ON ? C.ledOn : 'transparent'} shadowBlur={leds.ON ? 8 : 0} />
            </Group>

            {/* ===== CRYSTAL OSCILLATOR ===== */}
            <Ellipse x={105} y={128} radiusX={18} radiusY={7} fill={C.crystal} stroke="#999" strokeWidth={1} />

            {/* ===== 3-PIN COMPONENTS (Transistors/Regulators) ===== */}
            {[[48, 65], [48, 85], [48, 105]].map(([tx, ty], i) => (
                <Group key={`tr${i}`} x={tx} y={ty}>
                    <Rect width={10} height={12} fill="#2a2a2a" />
                    {[0, 1, 2].map(j => <Circle key={j} x={2 + j * 3} y={15} radius={1.5} fill={C.chipPin} />)}
                </Group>
            ))}

            {/* ===== ATMEGA328P ===== */}
            <Group x={138} y={145}>
                <Rect width={168} height={42} fill={C.chip} cornerRadius={2} />
                <Circle x={0} y={21} radius={6} fill="#3a3a3a" />
                {/* Top pins */}
                {[...Array(14)].map((_, i) => (
                    <Rect key={`t${i}`} x={18 + i * 10} y={-6} width={5} height={8} fill={C.chipPin} />
                ))}
                {/* Bottom pins */}
                {[...Array(14)].map((_, i) => (
                    <Rect key={`b${i}`} x={18 + i * 10} y={40} width={5} height={8} fill={C.chipPin} />
                ))}
                {/* Holes */}
                <Circle x={88} y={21} radius={4} fill="#3a3a3a" />
                <Circle x={145} y={21} radius={4} fill="#3a3a3a" />
            </Group>

            {/* ===== ELECTROLYTIC CAPACITORS ===== */}
            {[[108, 205], [135, 205]].map(([cx, cy], i) => (
                <Group key={`cap${i}`} x={cx} y={cy}>
                    <Circle radius={12} fill={C.cap} />
                    <Circle radius={7} fill={C.capTop} />
                    <Line points={[-4, -3, 4, -3]} stroke="#777" strokeWidth={1} />
                    <Line points={[0, -6, 0, 1]} stroke="#777" strokeWidth={1} />
                </Group>
            ))}

            {/* ===== SMALL SMD COMPONENTS ===== */}
            <Rect x={118} y={62} width={14} height={5} fill="#3a3a3a" cornerRadius={1} />
            <Rect x={135} y={90} width={8} height={4} fill="#4a4a4a" cornerRadius={1} />
            <Rect x={155} y={195} width={12} height={5} fill="#4a4a4a" cornerRadius={1} />
            <Rect x={98} y={195} width={6} height={3} fill="#3a3a3a" cornerRadius={1} />

            {/* ===== ICSP HEADER ===== */}
            <Group x={300} y={105}>
                <Rect width={26} height={18} fill={C.header} cornerRadius={2} />
                {[0, 1, 2].map(i => <Rect key={`t${i}`} x={5 + i * 7} y={3} width={5} height={5} fill={C.hole} cornerRadius={1} />)}
                {[0, 1, 2].map(i => <Rect key={`b${i}`} x={5 + i * 7} y={10} width={5} height={5} fill={C.hole} cornerRadius={1} />)}
            </Group>

            {/* ===== DIGITAL HEADER - Matching Tinkercad Reference Exactly ===== */}
            <Group y={5}>
                {/* Left Header Strip (AREF to ~9) - 7 pins */}
                <Group x={80}>
                    <Rect x={-5} y={0} width={100} height={22} fill={C.header} cornerRadius={2} />

                    {/* Pin holes - Tinkercad style with inner square */}
                    {DIGITAL_PINS_LEFT.map((pin) => (
                        <Group key={pin.id} x={pin.x} y={11}>
                            {/* Outer black rectangle */}
                            <Rect x={-5} y={-5} width={10} height={10} fill="#000000" cornerRadius={1} />
                            {/* Inner lighter square (the hole) */}
                            <Rect x={-3} y={-3} width={6} height={6}
                                fill={hoveredPin === pin.id ? '#FFD700' : '#1a1a1a'} cornerRadius={1}
                                stroke={hoveredPin === pin.id ? '#FFD700' : '#333333'} strokeWidth={0.5} />
                            {/* Interaction area */}
                            <Circle radius={8} fill="transparent"
                                onMouseEnter={() => pinHover(pin.id)}
                                onMouseLeave={pinLeave}
                                onClick={() => pinClick(pin.id)} />
                        </Group>
                    ))}

                    {/* Left section labels - rotated 90° */}
                    {DIGITAL_PINS_LEFT.map((pin, i) => (
                        <Text key={`lbl-l${i}`} x={pin.x + 3} y={28} text={pin.id}
                            fontSize={9} fill={C.label} rotation={90} fontStyle="bold" />
                    ))}
                </Group>

                {/* Right Header Strip (8 to RX←0) - 9 pins */}
                <Group x={190}>
                    <Rect x={-5} y={0} width={122} height={22} fill={C.header} cornerRadius={2} />

                    {/* Pin holes - Tinkercad style */}
                    {DIGITAL_PINS_RIGHT.map((pin) => (
                        <Group key={pin.id} x={pin.x} y={11}>
                            {/* Outer black rectangle */}
                            <Rect x={-5} y={-5} width={10} height={10} fill="#000000" cornerRadius={1} />
                            {/* Inner lighter square (the hole) */}
                            <Rect x={-3} y={-3} width={6} height={6}
                                fill={hoveredPin === pin.id ? '#FFD700' : '#1a1a1a'} cornerRadius={1}
                                stroke={hoveredPin === pin.id ? '#FFD700' : '#333333'} strokeWidth={0.5} />
                            {/* Interaction area */}
                            <Circle radius={8} fill="transparent"
                                onMouseEnter={() => pinHover(pin.id)}
                                onMouseLeave={pinLeave}
                                onClick={() => pinClick(pin.id)} />
                        </Group>
                    ))}

                    {/* Right section labels */}
                    {DIGITAL_PINS_RIGHT.map((pin, i) => (
                        <Text key={`lbl-r${i}`} x={pin.x + 3} y={28} text={pin.id}
                            fontSize={9} fill={C.label} rotation={90} fontStyle="bold" />
                    ))}
                </Group>

                {/* DIGITAL (PWM ~) label - positioned below on the right side */}
                <Text x={160} y={45} text="DIGITAL (PWM ~)" fontSize={11} fill={C.label} fontStyle="bold" />
            </Group>

            {/* ===== POWER HEADER ===== */}
            <Group y={240}>
                <Rect x={122} y={5} width={95} height={18} fill={C.header} cornerRadius={2} />
                <Text x={165} y={-30} text="POWER" fontSize={9} fill={C.label} />

                {POWER_PINS.map((pin, i) => (
                    <Group key={pin.id + i} x={pin.x} y={14}>
                        <Rect x={-4} y={-4} width={8} height={8}
                            fill={hoveredPin === `P${pin.id}${i}` ? '#FFD700' : C.hole} cornerRadius={1}
                            shadowColor={hoveredPin === `P${pin.id}${i}` ? '#FFD700' : 'transparent'}
                            shadowBlur={hoveredPin === `P${pin.id}${i}` ? 6 : 0} />
                        <Circle radius={7} fill="transparent"
                            onMouseEnter={() => pinHover(`P${pin.id}${i}`)}
                            onMouseLeave={pinLeave}
                            onClick={() => pinClick(pin.id)} />
                    </Group>
                ))}

                {/* Power pin labels - rotated 90° reading bottom-to-top */}
                {POWER_PINS.map((pin, i) => (
                    <Text
                        key={`plbl${i}`}
                        x={pin.x + 3}
                        y={-19}
                        text={pin.id.startsWith('GND') ? 'GND' : pin.id}
                        fontSize={7}
                        fill={C.label}
                        rotation={90}
                    />
                ))}
            </Group>

            {/* ===== ANALOG HEADER ===== */}
            <Group y={240}>
                <Rect x={224} y={5} width={82} height={18} fill={C.header} cornerRadius={2} />
                <Text x={240} y={-30} text="ANALOG IN" fontSize={9} fill={C.label} />

                {ANALOG_PINS.map((pin) => (
                    <Group key={pin.id} x={pin.x} y={14}>
                        <Rect x={-5} y={-4} width={8} height={8}
                            fill={hoveredPin === pin.id ? '#FFD700' : C.hole} cornerRadius={1}
                            shadowColor={hoveredPin === pin.id ? '#FFD700' : 'transparent'}
                            shadowBlur={hoveredPin === pin.id ? 6 : 0} />
                        <Circle radius={7} fill="transparent"
                            onMouseEnter={() => pinHover(pin.id)}
                            onMouseLeave={pinLeave}
                            onClick={() => pinClick(pin.id)} />
                    </Group>
                ))}

                {/* Analog pin labels - rotated 90° reading bottom-to-top */}
                {ANALOG_PINS.map((pin, i) => (
                    <Text key={`albl${i}`} x={pin.x + 3} y={-15} text={pin.id}
                        fontSize={8} fill={C.label} rotation={90} />
                ))}
            </Group>

            {/* ===== TOOLTIP ===== */}
            {hoveredPin && (
                <Group x={W / 2} y={H / 2 - 20}>
                    <Rect x={-35} y={-12} width={70} height={24}
                        fill="rgba(0,0,0,0.9)" cornerRadius={5} />
                    <Text x={-35} y={-6} width={70} text={hoveredPin.replace(/^P/, '')}
                        fontSize={11} fill="#fff" align="center" fontStyle="bold" />
                </Group>
            )}

        </Group>
    );
});

ArduinoUnoV4.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    scale: PropTypes.number,
    onPinClick: PropTypes.func,
    onPinHover: PropTypes.func,
    onReset: PropTypes.func,
    draggable: PropTypes.bool,
    onDragEnd: PropTypes.func,
};

// Export dimensions for workspace to use
export const BOARD_DIMENSIONS = { width: W, height: H };
export { DIGITAL_PINS, POWER_PINS, ANALOG_PINS };
export default ArduinoUnoV4;
