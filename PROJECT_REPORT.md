# PROJECT REPORT Ritesh Jadhav
## Web-Based Arduino Simulator

---

**Project Title:** Open Source Hardware - Web-Based Arduino Simulator  
**Student Name:** Ritesh Jadhav  
**GitHub Repository:** [RiteshJadhav283/Web-Based-Arduino-Simulator](https://github.com/RiteshJadhav283/Web-Based-Arduino-Simulator)  
**Deployed Link:** https://web-based-arduino-simulator.onrender.com/  
**Email:** ritesh6798@hotmail.com   /  2024.riteshs@isu.ac.in
**Date:** February 2026  

---

## 1. ABSTRACT

This project presents a web-based Arduino Uno simulator that enables users to design circuits visually, automatically generates Arduino code, and provides real-time simulation capabilities. The application features a drag-and-drop interface, automatic component wiring, configurable pin assignments, and AVR-based Arduino simulation. Built using React, Konva for canvas rendering, and AVR8js for accurate microcontroller emulation, the simulator provides an accessible platform for learning and prototyping Arduino projects without physical hardware.

**Keywords:** Arduino Simulator, Web-based IDE, Visual Circuit Design, AVR8js, React, Code Generation

---

## 2. INTRODUCTION

### 2.1 Background

Arduino has become one of the most popular platforms for electronics prototyping and embedded systems education. However, access to physical Arduino boards and components can be limited due to cost, availability, or remote learning constraints. Web-based simulators provide an accessible alternative, allowing users to learn and experiment with Arduino programming without hardware requirements.

### 2.2 Problem Statement

Build a minimal Web-based Arduino simulator for LED control using a Push Button (With Auto-wiring, Configurable pins, and Auto Code Generation)

### 2.3 Objectives

The primary objectives of this project are:
1. Develop a visual circuit design interface with drag-and-drop functionality
2. Implement automatic component-to-Arduino pin connections
3. Generate Arduino code automatically based on circuit configuration
4. Provide real-time logic-level simulation of Arduino behavior
5. Support configurable pin assignments (D2-D13)
6. Ensure single-pin-per-component constraint enforcement

### 2.4 Scope

The project scope includes:
- **Components:** Arduino Uno, LED (Red/Green/Yellow), Push Button, Resistor
- **Features:** Visual design, auto-wiring, code generation, simulation
- **Pin Range:** Digital pins D2 to D13
- **Simulation:** Logic-level (GPIO HIGH/LOW), visual LED feedback

---

## 3. LITERATURE REVIEW / EXISTING SYSTEMS

### 3.1 Wokwi
- **Strengths:** Fast simulation, good component library, collaboration features
- **Limitations:** Limited free tier, less focus on educational auto-wiring

### 3.2 Arduino Web Editor
- **Strengths:** Official Arduino platform, cloud compilation
- **Limitations:** No visual circuit design, requires hardware for testing

### 3.4 Gap Analysis
Existing solutions lack:
- Automatic pin assignment with conflict resolution
- Real-time code generation from visual circuits
- Educational focus on auto-wiring logic
- Offline-capable web application

---

## 4. SYSTEM REQUIREMENTS

### 4.1 Functional Requirements

1. **FR1:** Visual component palette with Arduino Uno, LEDs, and Push Button
2. **FR2:** Drag-and-drop canvas for circuit design
3. **FR3:** Automatic wiring based on pin configuration
4. **FR4:** Default pin mapping (LED→D10, Button→D2)
5. **FR5:** Pin reassignment UI with dropdowns
6. **FR6:** One-pin-per-component constraint enforcement
7. **FR7:** Automatic Arduino code generation with pinMode(), digitalWrite(), digitalRead()
8. **FR8:** Code updates when pins change
9. **FR9:** Start/Stop simulation controls
10. **FR10:** View modes (Circuit, Code, Both)

### 4.2 Non-Functional Requirements

1. **NFR1:** Response time < 100ms for UI interactions
2. **NFR2:** Code generation < 50ms
3. **NFR3:** Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
4. **NFR4:** Responsive design for different screen sizes
5. **NFR5:** Intuitive user interface requiring no training

---

## 5. SYSTEM DESIGN

### 5.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Items.jsx  │  │Workspace.jsx │  │CodeWindow.jsx│  │
│  │  (Palette)   │  │   (Canvas)   │  │   (Editor)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Application Logic Layer (App.jsx)           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ State Management │ Auto-wiring │ Code Generation │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Rendering & Simulation Layer            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Konva     │  │  AVR8js      │  │Wokwi Compiler│  │
│  │   (Canvas)   │  │(Simulation)  │  │   (Cloud)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       Components                         │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ ArduinoUno  │  │     LED     │  │ PushButton  │    │
│  │   V4.jsx    │  │   .jsx      │  │   .jsx      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │  Resistor   │  │    Wire     │                      │
│  │   .jsx      │  │   .jsx      │                      │
│  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Data Flow Diagram

The following workflow diagram illustrates the complete user journey from designing a circuit to running the simulation.

```
                        ┌─────────────────────────┐
                        │   USER STARTS APP       │
                        └────────────┬────────────┘
                                     ↓
                        ┌─────────────────────────┐
                        │  1. CIRCUIT DESIGN      │
                        └────────────┬────────────┘
                                     ↓
         ┌───────────────────────────────────────────────────┐
         │  User selects components from palette             │
         │  - Arduino Uno                                    │
         │  - LED (Red/Green/Yellow)                         │
         │  - Push Button                                    │
         │  - Resistor                                       │
         └────────────────────┬──────────────────────────────┘
                              ↓
         ┌───────────────────────────────────────────────────┐
         │  User drags & drops components onto canvas        │
         │  → Components placed on Konva canvas              │
         │  → State updated: workspaceComponents[]           │
         └────────────────────┬──────────────────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │  2. AUTO-WIRING         │
                    └────────────┬────────────┘
                                 ↓
         ┌───────────────────────────────────────────────────┐
         │  User clicks "Load Example Experiment"            │
         └────────────────────┬──────────────────────────────┘
                              ↓
         ┌───────────────────────────────────────────────────┐
         │  System automatically:                            │
         │  1. Sets pin configuration (LED→D10, Button→D2)   │
         │  2. Creates wire connections                      │
         │     - LED anode → Arduino D10                     │
         │     - LED cathode → Arduino GND                   │
         │     - Button → Arduino D2 & GND                   │
         │  3. Renders wires on canvas                       │
         │  → State updated: wires[], pinConfig{}            │
         └────────────────────┬──────────────────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │  3. CODE GENERATION     │
                    └────────────┬────────────┘
                                 ↓
         ┌───────────────────────────────────────────────────┐
         │  buildExperimentSketch() triggered automatically  │
         │  - Generates complete Arduino code                │
         │  - Includes pinMode(), digitalWrite(),            │
         │    digitalRead() functions                        │
         │  - Uses configured pin numbers                    │
         │  → Code displayed in editor                       │
         │  → State updated: code, generatedCode             │
         └────────────────────┬──────────────────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │  4. USER CLICKS "RUN"   │
                    └────────────┬────────────┘
                                 ↓
         ┌───────────────────────────────────────────────────┐
         │  handleRunCode() executes                         │
         │  - Retrieves code from state                      │
         │  - Prepares compilation request                   │
         └────────────────────┬──────────────────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │  5. CLOUD COMPILATION   │
                    └────────────┬────────────┘
                                 ↓
         ┌───────────────────────────────────────────────────┐
         │  POST to Wokwi Hexi Compiler API                  │
         │  Request:                                         │
         │    - sketch: Arduino code string                  │
         │    - board: "uno"                                 │
         └────────────────────┬──────────────────────────────┘
                              ↓
         ┌───────────────────────────────────────────────────┐
         │  Wokwi Cloud Compiler:                            │
         │  1. Parses C/C++ code                             │
         │  2. Compiles using AVR-GCC                        │
         │  3. Generates Intel HEX file                      │
         └────────────────────┬──────────────────────────────┘
                              ↓
         ┌───────────────────────────────────────────────────┐
         │  Response received:                               │
         │    - hex: Compiled machine code                   │
         │    - stderr: Error messages (if any)              │
         └────────────────────┬──────────────────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │  6. HEX PARSING         │
                    └────────────┬────────────┘
                                 ↓
         ┌───────────────────────────────────────────────────┐
         │  Parse Intel HEX format                           │
         │  - Extract machine code instructions              │
         │  - Validate format and checksum                   │
         │  → HEX ready for AVR emulation                    │
         └────────────────────┬──────────────────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │  7. AVR INITIALIZATION  │
                    └────────────┬────────────┘
                                 ↓
         ┌───────────────────────────────────────────────────┐
         │  new AVRRunner(hex)                               │
         │  - Initializes AVR8js CPU emulator                │
         │  - Loads hex into program memory                  │
         │  - Sets up I/O registers                          │
         │  - Initializes pin states (button HIGH)           │
         │  - Starts execution loop                          │
         └────────────────────┬──────────────────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │  8. SIMULATION RUNNING  │
                    └────────────┬────────────┘
                                 ↓
         ┌───────────────────────────────────────────────────┐
         │  Continuous execution loop (~60 FPS):             │
         │  1. AVR8js executes Arduino code                  │
         │  2. Read all digital pin states (D0-D13)          │
         │  3. updateCircuit(pinStates)                      │
         │     - Trace wire connections                      │
         │     - Update LED states based on pin values       │
         │  4. React re-renders LED components               │
         │  → LED visually responds to pin states            │
         └────────────────────┬──────────────────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │  9. USER INTERACTION    │
                    └────────────┬────────────┘
                                 ↓
         ┌───────────────────────────────────────────────────┐
         │  User presses button on canvas:                   │
         │  → setDigitalInput(buttonPin, LOW)                │
         │  → Arduino code: digitalRead() returns LOW        │
         │  → digitalWrite(ledPin, HIGH)                     │
         │  → LED lights up ✨                               │
         │                                                   │
         │  User releases button:                            │
         │  → setDigitalInput(buttonPin, HIGH)               │
         │  → digitalWrite(ledPin, LOW)                      │
         │  → LED turns off                                  │
         └───────────────────────────────────────────────────┘
```

### Workflow Summary Table

| Phase | Input | Process | Output |
|-------|-------|---------|--------|
| **Circuit Design** | Drag & drop | Component placement on canvas | Visual circuit |
| **Auto-Wiring** | Load experiment | Pin assignment + wire creation | Wired circuit |
| **Code Generation** | Pin config | buildExperimentSketch() | Arduino code |
| **Compilation** | Arduino code | Wokwi Hexi API (cloud) | Intel HEX file |
| **Parsing** | HEX response | Format validation | Machine code |
| **Initialization** | Machine code | AVRRunner setup | AVR emulator |
| **Simulation** | Emulator | Execute + monitor pins | Live feedback |
| **Interaction** | Button press/release | Pin state changes | LED on/off |

**Key Technologies:** React (UI), Konva (Canvas), Wokwi Hexi (Compiler), AVR8js (Emulator)

### 5.4 Database/State Management

The application uses React's `useState` hooks for client-side state management:

| State Variable | Type | Purpose |
|----------------|------|---------|
| `workspaceComponents` | Array | All components on canvas |
| `wires` | Array | Wire connections between components |
| `pinConfig` | Object | Current LED & button pin assignments |
| `generatedCode` | String | Auto-generated Arduino code |
| `code` | String | User-editable code |
| `simState` | Object | Component states (LED on/off) |
| `isRunning` | Boolean | Simulation running status |
| `experimentActive` | Boolean | Experiment mode flag |

---

## 6. IMPLEMENTATION

### 6.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | React | 19.2.0 | UI components & state management |
| Build Tool | Vite | 7.2.4 | Fast development & bundling |
| Canvas Rendering | Konva + React-Konva | 10.2.0 / 19.2.1 | Circuit visualization |
| Arduino Simulation | AVR8js | 0.20.1 | AVR microcontroller emulation |
| Compiler | Wokwi Hexi API | Cloud | Arduino code compilation |
| Component Library | @wokwi/elements | 1.9.1 | Arduino component visuals |
| Language | JavaScript (ES6+) | - | Application logic |


### 6. File Structure

```
arduino-web-based/
├── src/
│   ├── components/
│   │   ├── arduino_comp/
│   │   │   ├── ArduinoUnoV4.jsx      # Arduino board component
│   │   │   ├── ArduinoUno.css        # Arduino styling
│   │   │   └── index.js
│   │   ├── led_comp/
│   │   │   ├── LED.jsx               # LED component
│   │   │   └── index.js
│   │   ├── button_comp/
│   │   │   ├── PushButton.jsx        # Push button component
│   │   │   └── index.js
│   │   ├── resistor_comp/
│   │   │   ├── Resistor.jsx          # Resistor component
│   │   │   └── index.js
│   │   ├── wire_comp/
│   │   │   ├── Wire.jsx              # Wire rendering
│   │   │   └── index.js
│   │   ├── Items.jsx                 # Component palette
│   │   ├── Items.css
│   │   ├── Workspace.jsx             # Main canvas
│   │   ├── Workspace.css
│   │   ├── CodeWindow.jsx            # Code editor
│   │   └── CodeWindow.css
│   ├── utils/
│   │   └── AVRRunner.js              # AVR simulation wrapper
│   ├── App.jsx                       # Main application
│   ├── App.css
│   ├── main.jsx                      # Entry point
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 7. CONCLUSION

### 7.1 Conclusion

This project successfully developed a web-based Arduino simulator that meets all specified requirements. The application provides:
- An intuitive visual interface for circuit design
- Automatic component wiring with intelligent pin management
- Real-time Arduino code generation
- Accurate logic-level simulation

The simulator serves as an accessible educational tool for learning Arduino programming without requiring physical hardware.


## 8. REFERENCES

1. Arduino Official Documentation. (2024). *Arduino Language Reference*. Retrieved from https://www.arduino.cc/reference/

2. Wokwi Documentation. (2024). *Wokwi Arduino Simulator*. Retrieved from https://docs.wokwi.com/

3. AVR8js Documentation. (2024). *AVR8js - Arduino Simulator for JavaScript*. Retrieved from https://github.com/wokwi/avr8js

4. React Documentation. (2024). *React - A JavaScript library for building user interfaces*. Retrieved from https://react.dev/

5. Konva.js Documentation. (2024). *Konva - HTML5 2d canvas library*. Retrieved from https://konvajs.org/

6. Let's Code Arduino Simulator from Scratch (with JavaScript) *Youtube - Wokwi* https://youtu.be/fArqj-USmjA?si=r5FbfXGvwYBRV8VO

7. The Right Way to Animate SVG in React *Youtube - CoderOne* https://youtu.be/SrmTDrN1lkU?si=gqUvty44lAlzZ_P_

---

## 9. APPENDICES

### Appendix A: Deployed Link
https://web-based-arduino-simulator.onrender.com/

### Appendix B: Source Code
Complete source code available at:
https://github.com/RiteshJadhav283/Web-Based-Arduino-Simulator

---

**END OF REPORT**
