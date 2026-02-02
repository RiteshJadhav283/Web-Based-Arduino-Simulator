import { useState } from 'react';
import './Items.css';

function Items() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const categories = [
        {
            name: 'General',
            components: [
                { id: 'resistor', name: 'Resistor', element: 'wokwi-resistor', scale: 0.8 },
                { id: 'capacitor', name: 'Capacitor', element: 'wokwi-buzzer', scale: 0.5 },
                { id: 'potentiometer', name: 'Potentiometer', element: 'wokwi-potentiometer', scale: 0.4 },
                { id: 'led-red', name: 'LED Red', element: 'wokwi-led', props: { color: 'red' }, scale: 1.2 },
                { id: 'led-green', name: 'LED Green', element: 'wokwi-led', props: { color: 'green' }, scale: 1.2 },
                { id: 'led-yellow', name: 'LED Yellow', element: 'wokwi-led', props: { color: 'yellow' }, scale: 1.2 },
            ]
        },
        {
            name: 'Input',
            components: [
                { id: 'pushbutton', name: 'Pushbutton', element: 'wokwi-pushbutton', scale: 0.6 },
                { id: 'potentiometer2', name: 'Potentiometer', element: 'wokwi-potentiometer', scale: 0.4 },
                { id: 'slideswitch', name: 'Slideswitch', element: 'wokwi-pushbutton', scale: 0.6 },
            ]
        },
        {
            name: 'Output',
            components: [
                { id: 'buzzer', name: 'Buzzer', element: 'wokwi-buzzer', scale: 0.5 },
                { id: 'servo', name: 'Servo', element: 'wokwi-servo', scale: 0.35 },
                { id: 'lcd1602', name: 'LCD 16x2', element: 'wokwi-lcd1602', scale: 0.1 },
            ]
        },
        {
            name: 'Boards',
            components: [
                { id: 'arduino-uno', name: 'Arduino Uno', element: 'arduino-uno', scale: 0.12 },
                { id: 'arduino-uno-v2', name: 'Arduino Uno V2', element: 'arduino-uno-v2', scale: 0.2 },
                { id: 'arduino-uno-v3', name: 'Arduino Uno V3', element: 'arduino-uno-v3', scale: 0.2 },
                { id: 'arduino-uno-v4', name: 'Arduino Uno V4', element: 'arduino-uno-v4', scale: 0.18 },
            ]
        },
    ];

    // Filter components based on search query
    const filterComponents = (components) => {
        if (!searchQuery) return components;
        return components.filter(component =>
            component.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Handle drag start - pass component data
    const handleDragStart = (e, component) => {
        e.dataTransfer.setData('application/json', JSON.stringify(component));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const renderPreview = (component) => {
        const scale = component.scale || 1;
        const props = component.props || {};
        const style = {
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
        };

        switch (component.element) {
            case 'arduino-uno':
                return (
                    <div style={{ ...style, fontSize: '10px', color: '#1565C0', fontWeight: 'bold', textAlign: 'center' }}>
                        <svg width="60" height="40" viewBox="0 0 60 40" style={style}>
                            <rect x="2" y="2" width="56" height="36" rx="3" fill="#1565C0" stroke="#0D47A1" strokeWidth="1" />
                            <rect x="0" y="12" width="6" height="16" rx="1" fill="#90A4AE" />
                            <text x="30" y="24" fill="#BBDEFB" fontSize="8" textAnchor="middle" fontWeight="bold">UNO</text>
                        </svg>
                    </div>
                );
            case 'arduino-uno-v2':
                return (
                    <svg width="56" height="36" viewBox="0 0 280 180" style={style}>
                        <rect x="0" y="0" width="280" height="180" rx="8" fill="#00979D" />
                        <circle cx="14" cy="14" r="5" fill="none" stroke="#007A7F" strokeWidth="2" />
                        <circle cx="266" cy="14" r="5" fill="none" stroke="#007A7F" strokeWidth="2" />
                        <circle cx="14" cy="166" r="5" fill="none" stroke="#007A7F" strokeWidth="2" />
                        <circle cx="266" cy="166" r="5" fill="none" stroke="#007A7F" strokeWidth="2" />
                        <text x="140" y="100" fill="#B2DFDB" fontSize="40" textAnchor="middle" fontWeight="bold">V2</text>
                    </svg>
                );
            case 'arduino-uno-v3':
                return (
                    <svg width="56" height="36" viewBox="0 0 280 180" style={style}>
                        <rect x="0" y="0" width="280" height="180" rx="8" fill="#00979D" />
                        <circle cx="14" cy="14" r="5" fill="none" stroke="#007A7F" strokeWidth="2" />
                        <circle cx="266" cy="14" r="5" fill="none" stroke="#007A7F" strokeWidth="2" />
                        <circle cx="14" cy="166" r="5" fill="none" stroke="#007A7F" strokeWidth="2" />
                        <circle cx="266" cy="166" r="5" fill="none" stroke="#007A7F" strokeWidth="2" />
                        <text x="140" y="100" fill="#B2DFDB" fontSize="40" textAnchor="middle" fontWeight="bold">V3</text>
                    </svg>
                );
            case 'arduino-uno-v4':
                return (
                    <svg width="56" height="45" viewBox="0 0 320 260" style={style}>
                        <rect x="0" y="0" width="320" height="260" rx="6" fill="#5B99C5" />
                        <circle cx="15" cy="12" r="5" fill="#F5F5DC" />
                        <circle cx="305" cy="12" r="5" fill="#F5F5DC" />
                        <circle cx="15" cy="248" r="5" fill="#F5F5DC" />
                        <circle cx="305" cy="200" r="5" fill="#F5F5DC" />
                        <rect x="125" y="130" width="155" height="38" fill="#2a2a2a" rx="2" />
                        <text x="160" y="95" fill="#B8D4E8" fontSize="28" fontWeight="bold">V4</text>
                    </svg>
                );
            case 'wokwi-arduino-uno':
                return <wokwi-arduino-uno style={style} />;
            case 'wokwi-led':
                return <wokwi-led color={props.color} value="1" style={style} />;
            case 'wokwi-pushbutton':
                return <wokwi-pushbutton color="green" style={style} />;
            case 'wokwi-buzzer':
                return <wokwi-buzzer style={style} />;
            case 'wokwi-resistor':
                return <wokwi-resistor value="1000" style={style} />;
            case 'wokwi-potentiometer':
                return <wokwi-potentiometer style={style} />;
            case 'wokwi-servo':
                return <wokwi-servo style={style} />;
            case 'wokwi-lcd1602':
                return <wokwi-lcd1602 style={style} />;
            default:
                return <div className="fallback-icon">📦</div>;
        }
    };

    return (
        <div className="items-panel">
            {/* Filter Row */}
            <div className="filter-row">
                <div className="filter-dropdown-wrapper">
                    <span className="filter-label">Components</span>
                    <select
                        className="filter-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                    </select>
                    <span className="dropdown-arrow">▼</span>
                </div>
                <button className="view-toggle-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>

            {/* Components List with Categories */}
            <div className="items-scroll">
                {categories.map((category) => {
                    const filtered = filterComponents(category.components);
                    if (filtered.length === 0) return null;

                    return (
                        <div key={category.name} className="category-section">
                            <h3 className="category-title">{category.name}</h3>
                            <div className="items-grid">
                                {filtered.map((component) => (
                                    <div
                                        key={component.id}
                                        className="item-card"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, component)}
                                        data-component={component.element}
                                    >
                                        <div className="item-preview">
                                            {renderPreview(component)}
                                        </div>
                                        <span className="item-name">{component.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Items;
