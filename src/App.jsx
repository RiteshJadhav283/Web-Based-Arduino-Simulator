import { useState } from 'react'
import Items from "./components/Items"
import Workspace from "./components/Workspace"
import CodeWindow from "./components/CodeWindow.jsx"
import './App.css'

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

  return (
    <div className="app-container">
      <Items />
      <Workspace
        components={workspaceComponents}
        onDrop={handleDrop}
        onComponentMove={handleComponentMove}
        onComponentDelete={handleComponentDelete}
      />
      <CodeWindow />
    </div>
  )
}

export default App