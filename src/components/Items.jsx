import { useState } from 'react';
import './Items.css';

function Items() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const categories = [
        {
            name: 'General',
            components: [
                { id: 'resistor', name: 'Resistor', element: 'resistor', scale: 0.7 },
                { id: 'led-red', name: 'LED Red', element: 'led-red', props: { color: 'red' }, scale: 1.2 },
                { id: 'led-green', name: 'LED Green', element: 'led-green', props: { color: 'green' }, scale: 1.2 },
                { id: 'led-yellow', name: 'LED Yellow', element: 'led-yellow', props: { color: 'yellow' }, scale: 1.2 },
            ]
        },
        {
            name: 'Input',
            components: [
                { id: 'pushbutton', name: 'Pushbutton', element: 'pushbutton', scale: 0.6 },
            ]
        },
        {
            name: 'Output',
            components: [
                { id: 'buzzer', name: 'Buzzer', element: 'wokwi-buzzer', scale: 0.5 },
            ]
        },
        {
            name: 'Boards',
            components: [
                { id: 'arduino-uno-v4', name: 'Arduino Uno', element: 'arduino-uno-v4', scale: 0.18 },
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
            case 'arduino-uno-v4':
                return (
                    <svg width="56" height="45" viewBox="0 0 320 260" style={style}>
                        <rect x="0" y="0" width="320" height="260" rx="6" fill="#5B99C5" />
                        <circle cx="15" cy="12" r="5" fill="#F5F5DC" />
                        <circle cx="305" cy="12" r="5" fill="#F5F5DC" />
                        <circle cx="15" cy="248" r="5" fill="#F5F5DC" />
                        <circle cx="305" cy="200" r="5" fill="#F5F5DC" />
                        <rect x="125" y="130" width="155" height="38" fill="#2a2a2a" rx="2" />
                        <text x="160" y="95" fill="#B8D4E8" fontSize="28" fontWeight="bold">UNO</text>
                    </svg>
                );
            case 'led-red':
                return (
                    <svg width="30" height="50" viewBox="0 0 40 80" style={style}>
                        <ellipse cx="20" cy="22" rx="14" ry="18" fill="#FF4444" />
                        <ellipse cx="14" cy="14" rx="5" ry="6" fill="rgba(255,255,255,0.3)" />
                        <rect x="8" y="38" width="24" height="10" fill="#555" rx="2" />
                        <rect x="12" y="48" width="3" height="20" fill="#AAA" />
                        <rect x="25" y="48" width="3" height="16" fill="#AAA" />
                    </svg>
                );
            case 'led-green':
                return (
                    <svg width="30" height="50" viewBox="0 0 40 80" style={style}>
                        <ellipse cx="20" cy="22" rx="14" ry="18" fill="#44FF44" />
                        <ellipse cx="14" cy="14" rx="5" ry="6" fill="rgba(255,255,255,0.3)" />
                        <rect x="8" y="38" width="24" height="10" fill="#555" rx="2" />
                        <rect x="12" y="48" width="3" height="20" fill="#AAA" />
                        <rect x="25" y="48" width="3" height="16" fill="#AAA" />
                    </svg>
                );
            case 'led-yellow':
                return (
                    <svg width="30" height="50" viewBox="0 0 40 80" style={style}>
                        <ellipse cx="20" cy="22" rx="14" ry="18" fill="#FFFF44" />
                        <ellipse cx="14" cy="14" rx="5" ry="6" fill="rgba(255,255,255,0.3)" />
                        <rect x="8" y="38" width="24" height="10" fill="#555" rx="2" />
                        <rect x="12" y="48" width="3" height="20" fill="#AAA" />
                        <rect x="25" y="48" width="3" height="16" fill="#AAA" />
                    </svg>
                );
            case 'wokwi-led':
                return <wokwi-led color={props.color} value="1" style={style} />;
            case 'pushbutton':
                return (
                    <svg width="40" height="70" viewBox="0 0 70 120" style={style}>
                        {/* Top pins (1b, 2b) */}
                        <rect x="17" y="0" width="6" height="30" fill="#AAA" />
                        <rect x="47" y="0" width="6" height="30" fill="#AAA" />
                        {/* Button housing */}
                        <rect x="5" y="30" width="60" height="60" fill="#1C1C1C" rx="4" />
                        {/* Button ring */}
                        <circle cx="35" cy="60" r="22" fill="#992222" />
                        {/* Button cap */}
                        <circle cx="35" cy="60" r="17" fill="#CC3333" />
                        {/* Highlight */}
                        <circle cx="30" cy="54" r="6" fill="rgba(255,255,255,0.3)" />
                        {/* Bottom pins (1a, 2a) */}
                        <rect x="17" y="90" width="6" height="30" fill="#AAA" />
                        <rect x="47" y="90" width="6" height="30" fill="#AAA" />
                    </svg>
                );
            case 'wokwi-pushbutton':
                return <wokwi-pushbutton color="green" style={style} />;
            case 'wokwi-buzzer':
                return <wokwi-buzzer style={style} />;
            case 'resistor':
                return (
                    <svg width="30" height="70" viewBox="0 0 50 120" style={style}>
                        {/* Top lead */}
                        <line x1="25" y1="5" x2="25" y2="30" stroke="#AAA" strokeWidth="3" />
                        {/* Bottom lead */}
                        <line x1="25" y1="90" x2="25" y2="115" stroke="#AAA" strokeWidth="3" />
                        {/* Resistor body */}
                        <rect x="15" y="30" width="20" height="60" fill="#D4B896" stroke="#8B7355" strokeWidth="1" rx="3" />
                        {/* End caps */}
                        <rect x="15" y="30" width="20" height="5" fill="#A08060" rx="2" />
                        <rect x="15" y="85" width="20" height="5" fill="#A08060" rx="2" />
                        {/* Color bands (horizontal stripes) */}
                        <rect x="17" y="38" width="16" height="6" fill="#8B4513" />
                        <rect x="17" y="48" width="16" height="6" fill="#000000" />
                        <rect x="17" y="58" width="16" height="6" fill="#000000" />
                        <rect x="17" y="68" width="16" height="6" fill="#FF0000" />
                        <rect x="17" y="78" width="16" height="4" fill="#FFD700" />
                    </svg>
                );
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
