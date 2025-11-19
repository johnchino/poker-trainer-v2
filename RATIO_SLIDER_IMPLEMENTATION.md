# Ratio Slider Feature Implementation Guide

This document provides step-by-step instructions to implement the ratio slider feature for mixed colors in the poker trainer app.

## Overview

The ratio slider feature allows users to adjust the proportion of two colors in a mixed color, creating dynamic gradients from 0% to 100% instead of the fixed 50/50 split.

## Changes Required

### 1. src/App.jsx

#### Change 1.1: Update Initial State (Line 34-36)
Replace:
```javascript
const [mixedColors, setMixedColors] = useState([
  { id: 'mixed1', color1: '#5DBA19', color2: '#B9107A', name: 'mixed action', enabled: true }
]);
```

With:
```javascript
const [mixedColors, setMixedColors] = useState([
  { id: 'mixed1', color1: '#5DBA19', color2: '#B9107A', name: 'mixed action', enabled: true, ratio: 50, showSlider: false }
]);
```

#### Change 1.2: Update loadColors Function (Line 152)
Replace:
```javascript
const validatedMixedColors = (data.mixedColors || []).map(mc => ({ ...mc, color1: mc.color1?.startsWith("#") ? mc.color1 : "#5DBA19", color2: mc.color2?.startsWith("#") ? mc.color2 : "#B9107A" }));
```

With:
```javascript
const validatedMixedColors = (data.mixedColors || []).map(mc => ({
  ...mc,
  color1: mc.color1?.startsWith("#") ? mc.color1 : "#5DBA19",
  color2: mc.color2?.startsWith("#") ? mc.color2 : "#B9107A",
  ratio: mc.ratio ?? 50,
  showSlider: mc.showSlider ?? false
}));
```

#### Change 1.3: Update Default Mixed Colors (Line 165-167)
Replace:
```javascript
const defaultMixedColors = [
  { id: 'mixed1', color1: '#5DBA19', color2: '#B9107A', name: 'mixed action', enabled: true }
];
```

With:
```javascript
const defaultMixedColors = [
  { id: 'mixed1', color1: '#5DBA19', color2: '#B9107A', name: 'mixed action', enabled: true, ratio: 50, showSlider: false }
];
```

#### Change 1.4: Add New Handler Functions (After saveMixedColorName, before addMixedColor)
Add these two new functions:
```javascript
const toggleMixedColorSlider = (mixedColorId) => {
  const newMixedColors = mixedColors.map(m => {
    if (m.id === mixedColorId) {
      const newShowSlider = !m.showSlider;
      return {
        ...m,
        showSlider: newShowSlider,
        ratio: newShowSlider ? m.ratio : 50
      };
    }
    return m;
  });
  setMixedColors(newMixedColors);
  if (user) saveColors(user.uid, colors, newMixedColors);
};

const updateMixedColorRatio = (mixedColorId, newRatio) => {
  const newMixedColors = mixedColors.map(m =>
    m.id === mixedColorId ? { ...m, ratio: newRatio } : m
  );
  setMixedColors(newMixedColors);
  if (user) saveColors(user.uid, colors, newMixedColors);
};
```

#### Change 1.5: Update addMixedColor Function (Line 470-477)
Replace:
```javascript
const newMixedColor = {
  id: `mixed${Date.now()}`,
  name: `mixed ${mixedColors.length + 1}`,
  color1: colors[0]?.color || '#5DBA19',
  color2: colors[1]?.color || '#B9107A',
  enabled: true
};
```

With:
```javascript
const newMixedColor = {
  id: `mixed${Date.now()}`,
  name: `mixed ${mixedColors.length + 1}`,
  color1: colors[0]?.color || '#5DBA19',
  color2: colors[1]?.color || '#B9107A',
  enabled: true,
  ratio: 50,
  showSlider: false
};
```

#### Change 1.6: Update Import Function (Line 723-726)
Replace:
```javascript
newMixedColors.push({
  ...importMixed,
  id: newId
});
```

With:
```javascript
newMixedColors.push({
  ...importMixed,
  id: newId,
  ratio: importMixed.ratio ?? 50,
  showSlider: importMixed.showSlider ?? false
});
```

#### Change 1.7: Update Mixed Color Swatch Gradient (Line 1207-1209)
Replace:
```javascript
style={{
  background: `linear-gradient(135deg, ${mixedColor.color1} 0%, ${mixedColor.color1} 50%, ${mixedColor.color2} 50%, ${mixedColor.color2} 100%)`
}}
```

With:
```javascript
style={{
  background: `linear-gradient(to right, ${mixedColor.color1} ${mixedColor.ratio}%, ${mixedColor.color2} ${mixedColor.ratio}%)`
}}
```

#### Change 1.8: Add Slider Toggle Button and Slider UI (Line 1226-1242)
Replace the entire `mixed-color-actions` div and the closing `</div>` after it with:
```jsx
<div className="mixed-color-actions">
  <button
    onClick={() => setColorPickerTarget({ type: 'mixed1', id: mixedColor.id })}
    className="mixed-color-box"
    style={{ backgroundColor: mixedColor.color1 }}
    title="Change First Color"
  ></button>
  <button
    onClick={() => setColorPickerTarget({ type: 'mixed2', id: mixedColor.id })}
    className="mixed-color-box"
    style={{ backgroundColor: mixedColor.color2 }}
    title="Change Second Color"
  ></button>
  <button
    onClick={() => toggleMixedColorSlider(mixedColor.id)}
    className={`icon-btn-hidden ${mixedColor.showSlider ? 'slider-active' : ''}`}
    title="Toggle Ratio Slider"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/>
      <line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/>
      <line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  </button>
  <button onClick={() => deleteMixedColor(mixedColor.id)} className="icon-btn-hidden icon-btn-delete" title="Delete">
    <Icon icon="x" size={16} />
  </button>
</div>
</div>
{mixedColor.showSlider && (
  <div className="mixed-color-slider-container">
    <div className="slider-header">
      <span className="slider-label">Ratio</span>
      <span className="slider-ratio-display">{mixedColor.ratio}% / {100 - mixedColor.ratio}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={mixedColor.ratio}
      onChange={(e) => updateMixedColorRatio(mixedColor.id, parseInt(e.target.value))}
      className="mixed-color-slider"
      style={{
        background: `linear-gradient(to right, ${mixedColor.color1} 0%, ${mixedColor.color1} ${mixedColor.ratio}%, ${mixedColor.color2} ${mixedColor.ratio}%, ${mixedColor.color2} 100%)`
      }}
    />
  </div>
)}
</div>
```

#### Change 1.9: Update Statistics Panel Gradient (Line 1287-1289)
Replace:
```javascript
style={{
  background: `linear-gradient(135deg, ${mixedColor.color1} 0%, ${mixedColor.color1} 50%, ${mixedColor.color2} 50%, ${mixedColor.color2} 100%)`
}}
```

With:
```javascript
style={{
  background: `linear-gradient(to right, ${mixedColor.color1} ${mixedColor.ratio}%, ${mixedColor.color2} ${mixedColor.ratio}%)`
}}
```

### 2. src/components/PokerGrid.jsx

#### Change 2.1: Update getCellStyle Function (Line 95-105)
Replace:
```javascript
const mixedColor = mixedColors.find(m => m.id === state);
if (mixedColor) {
  const color1 = mixedColor.color1;
  const color2 = mixedColor.color2;
  // Find the first color object to get textColor setting
  const firstColorObj = colors.find(c => c.color === color1);
  const textColor = firstColorObj?.textColor || 'white';
  return {
    background: `linear-gradient(135deg, ${color1} 0%, ${color1} 50%, ${color2} 50%, ${color2} 100%)`,
    color: textColor
  };
}
```

With:
```javascript
const mixedColor = mixedColors.find(m => m.id === state);
if (mixedColor) {
  const color1 = mixedColor.color1;
  const color2 = mixedColor.color2;
  const ratio = mixedColor.ratio ?? 50;
  // Find the first color object to get textColor setting
  const firstColorObj = colors.find(c => c.color === color1);
  const textColor = firstColorObj?.textColor || 'white';
  return {
    background: `linear-gradient(to right, ${color1} ${ratio}%, ${color2} ${ratio}%)`,
    color: textColor
  };
}
```

### 3. src/utils/trainingHelpers.js

#### Change 3.1: Update getColorValue Function (Line 138-143)
Replace:
```javascript
// Check mixed colors
const mixedColor = mixedColors.find(c => c.id === colorId);
if (mixedColor) {
  const color1 = mixedColor.color1;
  const color2 = mixedColor.color2;
  return `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)`;
}
```

With:
```javascript
// Check mixed colors
const mixedColor = mixedColors.find(c => c.id === colorId);
if (mixedColor) {
  const color1 = mixedColor.color1;
  const color2 = mixedColor.color2;
  const ratio = mixedColor.ratio ?? 50;
  return `linear-gradient(to right, ${color1} ${ratio}%, ${color2} ${ratio}%)`;
}
```

### 4. src/styles.css

#### Change 4.1: Add Slider Styles (After line 1090)
Add the following CSS after the `.mixed-color-box:hover` rule:

```css
/* Slider Toggle Button */
.icon-btn-hidden.slider-active {
  opacity: 1;
  color: #5DBA19;
}

/* Mixed Color Slider Container */
.mixed-color-slider-container {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: #252932;
  border-radius: 0.375rem;
  border: 1px solid #4b5563;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 100px;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.slider-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 600;
}

.slider-ratio-display {
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
  font-family: monospace;
}

/* Mixed Color Slider Input */
.mixed-color-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  border: 1px solid #4b5563;
}

.mixed-color-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid #1a1d24;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.mixed-color-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}

.mixed-color-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 2px solid #1a1d24;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.mixed-color-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}
```

## Feature Details

### Functionality
- Each mixed color now has two new properties:
  - `ratio` (Number, 0-100): The percentage of the first color in the gradient
  - `showSlider` (Boolean): Whether the slider UI is currently displayed

- When the slider toggle button is clicked:
  - The slider UI expands/collapses with a smooth animation
  - When hiding the slider, the ratio resets to 50 (50/50 split)

- The slider updates the ratio in real-time:
  - The gradient preview updates as you drag the slider
  - The ratio display shows both percentages (e.g., "70% / 30%")
  - All instances of the mixed color (grid cells, statistics) update immediately

### UI Elements
1. **Slider Toggle Button**: Icon with vertical sliders, appears next to color picker buttons
2. **Slider Container**: Collapsible panel with smooth animation
3. **Range Input**: Custom-styled slider with gradient background matching the mixed colors
4. **Ratio Display**: Shows current split (e.g., "50% / 50%")

### Data Persistence
- The `ratio` and `showSlider` values are saved to Firestore
- Export/import functionality includes ratio data
- Legacy mixed colors without ratio default to 50

## Testing Checklist
- [ ] Create a new mixed color - should have ratio: 50, showSlider: false
- [ ] Toggle slider on/off - should expand/collapse smoothly
- [ ] Adjust slider - should update gradient in real-time
- [ ] Turn slider off - ratio should reset to 50
- [ ] Paint cells with mixed color - should show correct gradient
- [ ] Check statistics panel - mixed color should show correct gradient
- [ ] Export ranges - should include ratio data
- [ ] Import ranges - should restore ratio values
- [ ] Refresh page - ratio should persist
- [ ] Training mode - mixed colors should display with correct ratios

## Notes
- The slider icon SVG is defined inline (vertical sliders icon)
- When `showSlider` is true, the button gets the `slider-active` class (green color)
- The slider background is a gradient that visually represents the current ratio
- All gradients have been changed from diagonal (135deg) to horizontal (to right)
