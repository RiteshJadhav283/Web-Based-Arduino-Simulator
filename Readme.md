# 🔌 Web-Based Arduino Simulator

A professional web-based Arduino Uno simulator with visual circuit design, automatic code generation, and real-time simulation capabilities. Built with React, Konva, and AVR8js.

![Arduino Web Simulator](https://img.shields.io/badge/Arduino-Simulator-00979D?style=for-the-badge&logo=arduino&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Features

### 🎨 Visual Circuit Designer
- **Drag-and-drop interface** for building circuits
- Component palette with Arduino Uno, LEDs, Push Buttons, and Resistors
- Interactive canvas with grid background
- Visual wire routing with custom bend points
- Real-time component positioning

### ⚡ Auto-Wiring System
- **Automatic component wiring** based on pin assignments
- Default configuration: LED on D10, Push Button on D2
- Dynamic rewiring when pin assignments change
- Color-coded wires (red for signal, black for ground)
- Smart conflict resolution for pin assignments

### 📝 Automatic Code Generation
- **Real-time Arduino code generation** from circuit design
- Includes `pinMode()`, `digitalWrite()`, and `digitalRead()`
- Code updates automatically when pins are changed
- Read-only mode during experiment to prevent manual edits
- Syntax-highlighted code editor with line numbers

### 🎮 Logic-Level Simulation
- **AVR8js-powered** Arduino simulation
- Real-time pin state monitoring
- Visual LED feedback (on/off based on GPIO state)
- Interactive button press/release
- Wokwi Hexi cloud compiler integration

### 🔧 Pin Configuration
- **Configurable digital pins** (D2 - D13)
- Dropdown menus for easy pin reassignment
- Mutual exclusion prevents pin conflicts
- UI automatically updates to show available pins
- Live wire and code updates on pin changes

### 📱 View Modes
- **Circuit View**: Focus on circuit design
- **Code View**: Focus on Arduino code
- **Both View**: Side-by-side circuit and code

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RiteshJadhav283/Web-Based-Arduino-Simulator.git
   cd Web-Based-Arduino-Simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   Navigate to http://localhost:5173
   ```

## 📖 Usage Guide

### Quick Start with Example Experiment

1. Click **"Load Example Experiment"** button in the toolbar
2. The simulator will automatically:
   - Place Arduino Uno on the canvas
   - Add an LED (connected to D10)
   - Add a Push Button (connected to D2)
   - Wire all components
   - Generate Arduino code

3. Click **"▶ Start"** to run the simulation
4. Click on the **Push Button** to control the LED

### Manual Circuit Building

1. **Add Components**
   - Drag components from the left sidebar to the canvas
   - Available: Arduino Uno, LEDs (Red/Green/Yellow), Push Button, Resistor

2. **Wire Components**
   - Click on a component pin to start wiring
   - Click on canvas to add bend points
   - Click on another component's pin to complete the wire
   - Press ESC to cancel wiring

3. **Configure Pins**
   - In experiment mode, use the dropdowns to change pin assignments
   - LED Pin: Select from D2-D13 (excluding button pin)
   - Button Pin: Select from D2-D13 (excluding LED pin)

4. **Run Simulation**
   - Click **"▶ Start"** to compile and run your code
   - The LED will respond to button presses based on your code logic
   - Click **"■ Stop"** to stop the simulation

### Keyboard Shortcuts

- **ESC**: Cancel wiring mode
- **Delete/Backspace**: Remove selected wire or component

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Canvas Rendering**: Konva + React-Konva
- **Arduino Simulation**: AVR8js
- **Compiler**: Wokwi Hexi Cloud Compiler
- **Component Library**: @wokwi/elements

### Project Structure

```
src/
├── components/
│   ├── arduino_comp/     # Arduino Uno component
│   ├── led_comp/         # LED component
│   ├── button_comp/      # Push Button component
│   ├── resistor_comp/    # Resistor component
│   ├── wire_comp/        # Wire rendering
│   ├── Items.jsx         # Component palette
│   ├── Workspace.jsx     # Main canvas
│   └── CodeWindow.jsx    # Code editor
├── utils/
│   └── AVRRunner.js      # AVR simulation wrapper
├── App.jsx               # Main application logic
└── main.jsx              # Entry point
```

### Key Components

#### App.jsx
- Central state management
- Auto-wiring logic
- Code generation
- Simulation control
- Pin configuration management

#### Workspace.jsx
- Canvas rendering with Konva
- Drag-and-drop handling
- Wire management
- Component interactions
- View mode switching

#### ArduinoUnoV4.jsx
- Custom Arduino board rendering
- Accurate pin layout matching Tinkercad
- Interactive pin connections
- Visual feedback (LEDs, hover states)

## 🎯 Supported Components

| Component | Type | Pins | Description |
|-----------|------|------|-------------|
| Arduino Uno | Board | Digital (D0-D13), Analog (A0-A5), Power | Main controller |
| LED | Output | Anode, Cathode | Visual indicator (Red/Green/Yellow) |
| Push Button | Input | 1a, 1b, 2a, 2b | Digital input component |
| Resistor | Passive | Lead1, Lead2 | Current limiting |

## 🔬 How It Works

1. **Circuit Design**: User builds circuit visually using drag-and-drop
2. **Auto-Wiring**: System automatically creates wire connections based on pin assignments
3. **Code Generation**: Arduino sketch is generated using `buildExperimentSketch()`
4. **Compilation**: Code is sent to Wokwi Hexi compiler for hex file generation
5. **Simulation**: AVR8js runs the compiled hex file
6. **Visual Feedback**: Pin states are read and reflected in component visuals (LED on/off)

## 📋 Requirements Compliance

✅ **Task 1**: Visual interface with component palette and canvas  
✅ **Task 2**: Auto-wiring with configurable pins (D2-D13)  
✅ **Task 3**: Auto code generation with pinMode, digitalWrite, digitalRead  
✅ **End-to-End Flow**: Complete workflow from design to simulation

## 🛠️ Build & Deploy

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Ritesh Jadhav**
- GitHub: [@RiteshJadhav283](https://github.com/RiteshJadhav283)

## 🙏 Acknowledgments

- [Wokwi](https://wokwi.com/) for the Arduino elements and compiler API
- [AVR8js](https://github.com/wokwi/avr8js) for Arduino simulation
- [Konva](https://konvajs.org/) for canvas rendering
- Arduino community for inspiration

## 🐛 Known Issues

None at the moment! 🎉

## 🔮 Future Enhancements

- [ ] Support for more components (servo, LCD, sensors)
- [ ] Save/load circuit designs
- [ ] Export Arduino code to file
- [ ] Multiple Arduino boards support
- [ ] Serial monitor integration
- [ ] Breadboard view

---

Made with ❤️ using React + Vite
