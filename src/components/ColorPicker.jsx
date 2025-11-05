import { useState, useEffect } from 'react';

export const ColorPicker = ({ color, onChange, onClose }) => {
  const hexToHsv = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / diff + 2) / 6;
      else h = ((r - g) / diff + 4) / 6;
    }
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return { h: h * 360, s: s * 100, v: v * 100 };
  };

  const hsvToHex = (h, s, v) => {
    h = h / 360;
    s = s / 100;
    v = v / 100;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r, g, b;
    switch (i % 6) {
      case 0: [r, g, b] = [v, t, p]; break;
      case 1: [r, g, b] = [q, v, p]; break;
      case 2: [r, g, b] = [p, v, t]; break;
      case 3: [r, g, b] = [p, q, v]; break;
      case 4: [r, g, b] = [t, p, v]; break;
      case 5: [r, g, b] = [v, p, q]; break;
    }
    
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  };

  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [recentColors, setRecentColors] = useState(() => {
    const saved = localStorage.getItem('recentColors');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const hex = hsvToHex(hsv.h, hsv.s, hsv.v);
    setHexInput(hex.toUpperCase());
    onChange(hex);
  }, [hsv, onChange]);

  const addToRecentColors = (hexColor) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== hexColor.toLowerCase());
      const updated = [hexColor, ...filtered].slice(0, 10);
      localStorage.setItem('recentColors', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSVMouseDown = (e) => {
    setIsDraggingSV(true);
    updateSV(e);
  };

  const updateSV = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(240, e.clientX - rect.left));
    const y = Math.max(0, Math.min(180, e.clientY - rect.top));
    setHsv(prev => ({ ...prev, s: (x / 240) * 100, v: (1 - y / 180) * 100 }));
  };

  const handleHueMouseDown = (e) => {
    setIsDraggingHue(true);
    updateHue(e);
  };

  const updateHue = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(240, e.clientX - rect.left));
    setHsv(prev => ({ ...prev, h: (x / 240) * 360 }));
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSV) {
        const svArea = document.getElementById('sv-area');
        if (svArea) {
          const rect = svArea.getBoundingClientRect();
          const x = Math.max(0, Math.min(240, e.clientX - rect.left));
          const y = Math.max(0, Math.min(180, e.clientY - rect.top));
          setHsv(prev => ({ ...prev, s: (x / 240) * 100, v: (1 - y / 180) * 100 }));
        }
      }
      if (isDraggingHue) {
        const hueBar = document.getElementById('hue-bar');
        if (hueBar) {
          const rect = hueBar.getBoundingClientRect();
          const x = Math.max(0, Math.min(240, e.clientX - rect.left));
          setHsv(prev => ({ ...prev, h: (x / 240) * 360 }));
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSV(false);
      setIsDraggingHue(false);
    };

    if (isDraggingSV || isDraggingHue) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingSV, isDraggingHue]);

  const handleHexChange = (e) => {
    const value = e.target.value.toUpperCase();
    setHexInput(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setHsv(hexToHsv(value));
      addToRecentColors(value);
    }
  };

  const selectRecentColor = (hexColor) => {
    setHsv(hexToHsv(hexColor));
    setHexInput(hexColor.toUpperCase());
    addToRecentColors(hexColor);
  };

  const handleClose = () => {
    const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
    addToRecentColors(currentHex);
    onClose();
  };

  return (
    <div className="color-picker-overlay" onClick={handleClose}>
      <div className="color-picker" onClick={e => e.stopPropagation()}>
        <div 
          id="sv-area"
          className="sv-area"
          style={{
            background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, hsl(${hsv.h}, 100%, 50%))`,
          }}
          onMouseDown={handleSVMouseDown}
        >
          <div 
            className="sv-cursor"
            style={{
              left: `${(hsv.s / 100) * 240}px`,
              top: `${(1 - hsv.v / 100) * 180}px`,
            }}
          />
        </div>
        
        <div 
          id="hue-bar"
          className="hue-bar"
          onMouseDown={handleHueMouseDown}
        >
          <div 
            className="hue-cursor"
            style={{ 
              left: `${(hsv.h / 360) * 240}px`,
              borderColor: hsvToHex(hsv.h, 100, 100),
            }}
          />
        </div>
        
        <div className="hex-input-container">
          <div 
            className="color-preview"
            style={{ backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v) }}
          ></div>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            maxLength={7}
            className="hex-input"
            placeholder="#000000"
          />
        </div>

        {recentColors.length > 0 && (
          <div className="recent-colors-container">
            <div className="recent-colors-label">Recently used</div>
            <div className="recent-colors-grid">
              {recentColors.map((recentColor, idx) => (
                <button
                  key={idx}
                  onClick={() => selectRecentColor(recentColor)}
                  className="recent-color-swatch"
                  style={{ backgroundColor: recentColor }}
                  title={recentColor}
                ></button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};