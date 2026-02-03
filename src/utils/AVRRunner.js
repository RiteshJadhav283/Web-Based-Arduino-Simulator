import {
    avrInstruction,
    avrInterrupt,
    AVRTimer,
    CPU,
    timer0Config,
    portBConfig, // Digital 8-13
    portCConfig, // Analog 0-5
    portDConfig, // Digital 0-7
} from 'avr8js';


// Default Blink Hex (Blinks Pin 13 LED)
const BLINK_HEX = `:100000000C9434000C943E000C943E000C943E004E
:100010000C943E000C943E000C943E000C943E0010
:100020000C943E000C943E000C943E000C943E0000
:100030000C943E000C943E000C943E000C943E00F0
:100040000C943E000C943E000C943E000C943E00E0
:100050000C943E000C943E000C943E000C943E00D0
:100060000C943E000C943E0011241FBECFEFD8E0A7
:10007000DEbfcDBF0E9440000C9443000C94000016
:100080008FE08093810080938000209A289A309A4D
:1000900088E190E00E94530020982898309888E14E
:1000A00090E00E945300F7CF3197F1F00895689405
:0400B00062F8089565
:00000001FF`;

export const loadHex = (source, target) => {
    for (const line of source.split('\n')) {
        if (line[0] === ':' && line.substr(7, 2) === '00') {
            const bytes = parseInt(line.substr(1, 2), 16);
            const addr = parseInt(line.substr(3, 4), 16);
            for (let i = 0; i < bytes; i++) {
                target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
            }
        }
    }
};

export class AVRRunner {
    constructor(hex = BLINK_HEX) {
        this.program = new Uint16Array(16384);
        loadHex(hex, new Uint8Array(this.program.buffer));

        this.cpu = new CPU(this.program);
        this.timer = new AVRTimer(this.cpu, timer0Config); // Timer0 for millis()

        // Hook into ports to listen for changes
        // PORTB: Digital 8-13
        this.cpu.readHooks[0x25] = (val) => { // PORTB
            this.onPortBChange?.(val);
            return val;
        }

        // PORTD: Digital 0-7
        this.cpu.readHooks[0x2b] = (val) => { // PORTD
            this.onPortDChange?.(val);
            return val;
        }

        this.stopping = false;
        this.speed = 16_000_000; // 16 MHz
        this.workUnitCycles = 500000; // Cycles per tick

        // Digital input shadow state (per pin)
        this.inputPins = {};
    }

    // Callbacks
    onPortBChange = null; // Digital 8-13
    onPortDChange = null; // Digital 0-7

    execute(callback) {
        this.stopping = false;
        const tick = () => {
            if (this.stopping) return;

            const startTime = performance.now();

            // Execute cycles
            for (let i = 0; i < this.workUnitCycles; i++) {
                avrInstruction(this.cpu);
                this.cpu.tick();
            }

            const endTime = performance.now();
            const timeTaken = endTime - startTime;

            // Call the callback to update UI
            callback?.();

            // Schedule next tick
            // If simulation is running too fast (slower than real time), just setTimeout(0)
            // If running strictly real-time is needed, we need more logic, but for blinking LED this is okay.
            setTimeout(tick, 0);
        };
        tick();
    }

    stop() {
        this.stopping = true;
    }

    // Helper to get pin state
    // Standard Arduino mapping:
    // D0-D7 maps to PORTD 0-7
    // D8-D13 maps to PORTB 0-5
    getPinState(pin) {
        if (pin >= 8 && pin <= 13) {
            // PORTB at 0x25
            const portB = this.cpu.data[0x25];
            return (portB >> (pin - 8)) & 1;
        } else if (pin >= 0 && pin <= 7) {
            // PORTD at 0x2b
            const portD = this.cpu.data[0x2b];
            return (portD >> pin) & 1;
        }
        return 0;
    }

    // Set digital input level for a given Arduino pin.
    // For now we only support PORTD pins (0-7), which covers D2 for button input.
    setDigitalInput(pin, value) {
        const level = value ? 1 : 0;
        this.inputPins[pin] = level;

        // ATmega328p register map:
        // PIND = 0x29, PINB = 0x23 (not currently used here)
        if (pin >= 0 && pin <= 7) {
            const bit = 1 << pin;
            if (level) {
                this.cpu.data[0x29] |= bit;
            } else {
                this.cpu.data[0x29] &= ~bit;
            }
        }
    }
}
