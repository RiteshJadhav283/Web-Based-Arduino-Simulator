import { useState, useRef, useEffect } from 'react'
import Items from "./components/Items"
import Workspace from "./components/Workspace"
import CodeWindow from "./components/CodeWindow.jsx"
import { AVRRunner } from './utils/AVRRunner';
import './App.css'

// Mapping between Arduino header IDs (labels on the board) and digital pin numbers
const DIGITAL_PIN_ID_TO_NUMBER = {
  '13': 13,
  '12': 12,
  '~11': 11,
  '~10': 10,
  '~9': 9,
  '8': 8,
  '7': 7,
  '~6': 6,
  '~5': 5,
  '4': 4,
  '~3': 3,
  '2': 2,
  'TX→1': 1,
  'RX←0': 0,
};

const DIGITAL_PIN_NUMBER_TO_ID = Object.fromEntries(
  Object.entries(DIGITAL_PIN_ID_TO_NUMBER).map(([id, num]) => [num, id])
);

// Build auto-generated sketch for experiment mode based on current pinConfig
function buildExperimentSketch({ ledPin, buttonPin }) {
  return `
const int ledPin = ${ledPin};
const int buttonPin = ${buttonPin};

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}
`.trim();
}

function App() {
  const [workspaceComponents, setWorkspaceComponents] = useState([]);

  const handleDrop = (component, position) => {
    const newComponent = {
      ...component,
      id: `${component.id}-${Date.now()}`,
      x: position.x,
      y: position.y,
    };
    setWorkspaceComponents(prev => [...prev, newComponent]);
  };

  const handleComponentMove = (id, newPosition) => {
    setWorkspaceComponents(prev =>
      prev.map(comp =>
        comp.id === id ? { ...comp, x: newPosition.x, y: newPosition.y } : comp
      )
    );
  };

  const handleComponentDelete = (id) => {
    setWorkspaceComponents(prev => prev.filter(comp => comp.id !== id));
  };

  const [wires, setWires] = useState([]);
  const [simState, setSimState] = useState({}); // Stores simulation state { compId: { isOn: true } }
  const runnerRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [experimentActive, setExperimentActive] = useState(false);
  const [viewMode, setViewMode] = useState('both'); // 'circuit' | 'code' | 'both'
  const [pinConfig, setPinConfig] = useState({
    ledPin: 10,
    buttonPin: 2,
  });
  const [generatedCode, setGeneratedCode] = useState('');

  const [code, setCode] = useState('');

  // Simple circuit tracing (Arduino Digital Pins -> Components)
  // pinStates: { [digitalPinNumber: number]: 0 | 1 }
  const updateCircuit = (pinStates) => {
    // 1. Find the Arduino component
    const arduino = workspaceComponents.find(c => c.element === 'arduino-uno-v4');
    if (!arduino) return;

    // Helper to find connected components recursively
    const findConnectedComponents = (startPin, startCompId, visited = new Set()) => {
      const connected = [];
      const visitedKey = `${startCompId}:${startPin}`;
      if (visited.has(visitedKey)) return [];
      visited.add(visitedKey);

      wires.forEach(wire => {
        let nextPin = null;
        let nextCompId = null;

        if (wire.startPin.componentId === startCompId && wire.startPin.pin === startPin) {
          nextPin = wire.endPin.pin;
          nextCompId = wire.endPin.componentId;
        } else if (wire.endPin.componentId === startCompId && wire.endPin.pin === startPin) {
          nextPin = wire.startPin.pin;
          nextCompId = wire.startPin.componentId;
        }

        if (nextCompId) {
          connected.push({ compId: nextCompId, pin: nextPin });

          // If resistor, traverse through
          const comp = workspaceComponents.find(c => c.id === nextCompId);
          if (comp && comp.element === 'resistor') {
            const otherPin = nextPin === 'lead1' ? 'lead2' : 'lead1';
            connected.push(...findConnectedComponents(otherPin, nextCompId, visited));
          }
        }
      });
      return connected;
    };

    // Start with all LEDs off; we'll turn specific ones on based on pin states
    const newSimState = {};
    workspaceComponents.forEach(comp => {
      if (comp.element && comp.element.startsWith('led-')) {
        newSimState[comp.id] = { isOn: false };
      }
    });

    // For each digital pin, trace its connections and update any LEDs on that net
    Object.entries(DIGITAL_PIN_ID_TO_NUMBER).forEach(([headerId, pinNumber]) => {
      const pinState = pinStates[pinNumber];
      if (pinState == null) return;

      const targets = findConnectedComponents(headerId, arduino.id);
      // console.log('[DEBUG] Pin', pinNumber, '(', headerId, ') State:', pinState, 'Targets:', targets);

      targets.forEach(target => {
        const comp = workspaceComponents.find(c => c.id === target.compId);
        if (comp && comp.element && comp.element.startsWith('led-')) {
          newSimState[target.compId] = { isOn: pinState === 1 };
        }
      });
    });

    setSimState(newSimState);
  };

  const ensureExperimentComponents = () => {
    setWorkspaceComponents((prev) => {
      const components = [...prev];

      // Ensure exactly one Arduino Uno
      let arduino = components.find(c => c.element === 'arduino-uno-v4');
      if (!arduino) {
        arduino = {
          id: `arduino-uno-v4-${Date.now()}`,
          element: 'arduino-uno-v4',
          x: 150,
          y: 150,
        };
        components.push(arduino);
      }

      // Ensure one LED (use red by default)
      let led = components.find(c => c.element && c.element.startsWith('led-'));
      if (!led) {
        led = {
          id: `led-red-${Date.now()}`,
          element: 'led-red',
          // Place LED clearly above the board, roughly above D10
          x: arduino.x + 150,
          y: arduino.y - 140,
        };
        components.push(led);
      }

      // Ensure one push button
      let button = components.find(c => c.element === 'pushbutton');
      if (!button) {
        button = {
          id: `pushbutton-${Date.now()}`,
          element: 'pushbutton',
          // Place button clearly to the right of the board
          x: arduino.x + 380,
          y: arduino.y + 40,
        };
        components.push(button);
      }

      // Auto-wire LED to default pin (D10) for experiment mode
      const targetLedPin = 10;
      const headerId = DIGITAL_PIN_NUMBER_TO_ID[targetLedPin];

      if (arduino && led && headerId) {
        setWires((prevWires) => {
          // Remove any wires connected to this LED (regardless of Arduino pin),
          // but leave button wires and other connections untouched.
          const filtered = prevWires.filter((w) => {
            const involvesLed = w.startPin.componentId === led.id || w.endPin.componentId === led.id;
            return !involvesLed;
          });

          const idBase = Date.now();
          const ledToPinWire = {
            id: `wire-led-pin-${idBase}`,
            startPin: { pin: 'anode', componentId: led.id },
            endPin: { pin: headerId, componentId: arduino.id },
            bendPoints: [],
            color: 'red',
          };
          const ledToGndWire = {
            id: `wire-led-gnd-${idBase}`,
            startPin: { pin: 'cathode', componentId: led.id },
            endPin: { pin: 'GND1', componentId: arduino.id },
            bendPoints: [],
            color: 'black',
          };

          return [...filtered, ledToPinWire, ledToGndWire];
        });
      }

      return components;
    });
  };

  const handleLoadExperiment = () => {
    setExperimentActive(true);
    // Reset to default pin mapping when starting the experiment
    setPinConfig({ ledPin: 10, buttonPin: 2 });
    ensureExperimentComponents();
  };

  const handleExitExperiment = () => {
    // Stop any running simulation
    if (runnerRef.current) {
      runnerRef.current.stop();
      runnerRef.current = null;
    }
    setIsRunning(false);
    setExperimentActive(false);
    // Restore editable user code (keep whatever was last in manual mode)
    // No need to clear components or wires; user can continue working manually.
  };

  const updatePinConfig = (partial) => {
    setPinConfig((prev) => {
      const clampPin = (p) => Math.min(13, Math.max(2, p));
      let next = { ...prev, ...partial };
      next.ledPin = clampPin(next.ledPin);
      next.buttonPin = clampPin(next.buttonPin);

      // Ensure pins are not equal; if conflict, move the non-edited one
      if (next.ledPin === next.buttonPin) {
        if (partial.ledPin !== undefined) {
          // Move button pin to closest free pin
          for (let p = 2; p <= 13; p++) {
            if (p !== next.ledPin) {
              next.buttonPin = p;
              break;
            }
          }
        } else if (partial.buttonPin !== undefined) {
          for (let p = 2; p <= 13; p++) {
            if (p !== next.buttonPin) {
              next.ledPin = p;
              break;
            }
          }
        }
      }

      return next;
    });
  };

  // Auto-rewire LED whenever its assigned pin changes in experiment mode
  useEffect(() => {
    if (!experimentActive) return;

    const arduino = workspaceComponents.find(c => c.element === 'arduino-uno-v4');
    const led = workspaceComponents.find(c => c.element && c.element.startsWith('led-'));
    if (!arduino || !led) return;

    const headerId = DIGITAL_PIN_NUMBER_TO_ID[pinConfig.ledPin];
    if (!headerId) return;

    setWires((prevWires) => {
      const filtered = prevWires.filter((w) => {
        const involvesLed = w.startPin.componentId === led.id || w.endPin.componentId === led.id;
        return !involvesLed;
      });

      const idBase = Date.now();
      const ledToPinWire = {
        id: `wire-led-pin-${idBase}`,
        startPin: { pin: 'anode', componentId: led.id },
        endPin: { pin: headerId, componentId: arduino.id },
        bendPoints: [],
        color: 'red',
      };
      const ledToGndWire = {
        id: `wire-led-gnd-${idBase}`,
        startPin: { pin: 'cathode', componentId: led.id },
        endPin: { pin: 'GND1', componentId: arduino.id },
        bendPoints: [],
        color: 'black',
      };

      return [...filtered, ledToPinWire, ledToGndWire];
    });
  }, [pinConfig.ledPin, experimentActive, workspaceComponents]);

  // Auto-wire pushbutton between selected digital pin and GND in experiment mode
  useEffect(() => {
    if (!experimentActive) return;

    const arduino = workspaceComponents.find(c => c.element === 'arduino-uno-v4');
    const button = workspaceComponents.find(c => c.element === 'pushbutton');
    if (!arduino || !button) return;

    const headerId = DIGITAL_PIN_NUMBER_TO_ID[pinConfig.buttonPin];
    if (!headerId) return;

    setWires((prevWires) => {
      const filtered = prevWires.filter((w) => {
        const involvesButton = w.startPin.componentId === button.id || w.endPin.componentId === button.id;
        const involvesArduinoEndpoint =
          (w.startPin.componentId === arduino.id &&
            (w.startPin.pin === headerId || w.startPin.pin === 'GND2')) ||
          (w.endPin.componentId === arduino.id &&
            (w.endPin.pin === headerId || w.endPin.pin === 'GND2'));
        return !(involvesButton || involvesArduinoEndpoint);
      });

      const idBase = Date.now();
      const btnToPinWire = {
        id: `wire-btn-pin-${idBase}`,
        startPin: { pin: '1a', componentId: button.id },
        endPin: { pin: headerId, componentId: arduino.id },
        bendPoints: [],
        color: 'orange',
      };
      const btnToGndWire = {
        id: `wire-btn-gnd-${idBase}`,
        startPin: { pin: '2a', componentId: button.id },
        endPin: { pin: 'GND2', componentId: arduino.id },
        bendPoints: [],
        color: 'black',
      };

      return [...filtered, btnToPinWire, btnToGndWire];
    });
  }, [pinConfig.buttonPin, experimentActive, workspaceComponents]);

  // Keep generatedCode (and underlying code used for build) in sync with pinConfig in experiment mode
  useEffect(() => {
    if (!experimentActive) return;
    const sketch = buildExperimentSketch(pinConfig);
    setGeneratedCode(sketch);
    // Also keep the underlying editable code in sync so the build path works
    setCode(sketch);
  }, [experimentActive, pinConfig]);

  const handleRunCode = async () => {
    if (runnerRef.current) {
      runnerRef.current.stop();
      runnerRef.current = null;
    }

    try {
      console.log('Compiling sketch via Wokwi Hexi...');
      const sourceCode = experimentActive && generatedCode ? generatedCode : code;
      const response = await fetch('https://hexi.wokwi.com/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sketch: sourceCode,
          board: 'arduino-uno',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Compiler error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      const { hex, stderr } = await response.json();

      if (!hex) {
        throw new Error(stderr || 'No HEX returned from compiler');
      }

      console.log('Compilation succeeded, starting simulation...');
      const runner = new AVRRunner(hex); // Use compiled hex from Wokwi
      runnerRef.current = runner;
      // Default: button released -> HIGH when using INPUT_PULLUP
      const buttonPin = experimentActive ? pinConfig.buttonPin : 2;
      runner.setDigitalInput(buttonPin, 1);
      setIsRunning(true);

      runner.execute(() => {
        // This runs every "tick" (approx every frame or slower)
        // Read all digital pins 0-13 and propagate their states into the circuit
        const pinStates = {};
        for (let pin = 0; pin <= 13; pin++) {
          pinStates[pin] = runner.getPinState(pin);
        }
        updateCircuit(pinStates);
      });
    } catch (err) {
      console.error('Failed to compile or run sketch:', err);
      alert(`Failed to compile or run sketch:\n${err.message}`);
      setIsRunning(false);
    }
  };

  // Simple logical mapping: any pushbutton in the workspace controls Arduino D2.
  // Use INPUT_PULLUP in the sketch; pressing the button pulls D2 LOW.
  const handleButtonPress = () => {
    setButtonPressed(true);
    if (runnerRef.current) {
      const buttonPin = experimentActive ? pinConfig.buttonPin : 2;
      runnerRef.current.setDigitalInput(buttonPin, 0); // pressed -> LOW
    }
  };

  const handleButtonRelease = () => {
    setButtonPressed(false);
    if (runnerRef.current) {
      const buttonPin = experimentActive ? pinConfig.buttonPin : 2;
      runnerRef.current.setDigitalInput(buttonPin, 1); // released -> HIGH
    }
  };

  const handleStopCode = () => {
    if (runnerRef.current) {
      runnerRef.current.stop();
      runnerRef.current = null;
    }
    setIsRunning(false);
    // Optionally clear sim state so LEDs go off
    setSimState({});
  };

  return (
    <div className="app-container">
      <Items />
      <div className="main-panel">
        <div className="top-toolbar">
          <button
            className={`experiment-btn ${experimentActive ? 'active' : ''}`}
            onClick={handleLoadExperiment}
          >
            {experimentActive ? 'Experiment Loaded' : 'Load Example Experiment'}
          </button>
          {experimentActive && (
            <button
              className="experiment-exit-btn"
              onClick={handleExitExperiment}
            >
              Exit Experiment
            </button>
          )}
          {experimentActive && (
            <span className="experiment-hint">
              Pins are controlled by the dropdowns. Code is auto-generated and read-only.
            </span>
          )}
        </div>
        <div className="workspace-and-code">
          <Workspace
            components={workspaceComponents}
            wires={wires}
            setWires={setWires}
            simState={simState}
            onButtonPress={handleButtonPress}
            onButtonRelease={handleButtonRelease}
            onDrop={handleDrop}
            onComponentMove={handleComponentMove}
            onComponentDelete={handleComponentDelete}
            onRun={handleRunCode}
            onStop={handleStopCode}
            isRunning={isRunning}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            experimentActive={experimentActive}
            pinConfig={pinConfig}
            onPinConfigChange={updatePinConfig}
          />
          {viewMode !== 'circuit' && (
            <CodeWindow
              code={experimentActive ? generatedCode : code}
              onChange={experimentActive ? undefined : setCode}
              isExperimentMode={experimentActive}
              readOnly={experimentActive}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App