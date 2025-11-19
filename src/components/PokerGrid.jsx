import { useState, forwardRef } from 'react';
import { getCellComparisonClass, getCellComparisonColor } from '../utils/trainingHelpers';

const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const generateHands = () => {
  const hands = [];
  for (let i = 0; i < ranks.length; i++) {
    const row = [];
    for (let j = 0; j < ranks.length; j++) {
      if (i === j) {
        row.push(`${ranks[i]}${ranks[i]}`);
      } else if (i < j) {
        row.push(`${ranks[i]}${ranks[j]}s`);
      } else {
        row.push(`${ranks[j]}${ranks[i]}o`);
      }
    }
    hands.push(row);
  }
  return hands;
};

export const PokerGrid = forwardRef(({
  cellStates,
  onCellStatesChange,
  colors,
  mixedColors,
  paintMode,
  selectedColor,
  selectedMixedColor,
  simpleView,
  comparisonMode = false,
  correctAnswers = {}
}, ref) => {
  const hands = generateHands();
  const [isDrawing, setIsDrawing] = useState(false);

  const paintCell = (hand) => {
    if (paintMode === 'solid') {
      const current = cellStates[hand] || 'default';
      if (current === selectedColor) {
        onCellStatesChange({ ...cellStates, [hand]: 'default' });
      } else {
        onCellStatesChange({ ...cellStates, [hand]: selectedColor });
      }
    } else {
      const current = cellStates[hand] || 'default';
      if (current === selectedMixedColor) {
        onCellStatesChange({ ...cellStates, [hand]: 'default' });
      } else {
        onCellStatesChange({ ...cellStates, [hand]: selectedMixedColor });
      }
    }
  };

  const handleMouseDown = (hand) => {
    setIsDrawing(true);
    paintCell(hand);
  };

  const handleMouseEnter = (hand) => {
    if (isDrawing) paintCell(hand);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const getCellColor = (hand) => {
    const state = cellStates[hand] || 'default';
    if (state === 'default') return 'cell-default';
    return '';
  };

  const getCellStyle = (hand) => {
    // In comparison mode, use special colors
    if (comparisonMode) {
      const comparisonColor = getCellComparisonColor(hand, correctAnswers, cellStates, colors, mixedColors);
      if (comparisonColor) {
        // Check if it's a gradient (mixed color)
        if (comparisonColor.startsWith('linear-gradient')) {
          return { background: comparisonColor };
        } else {
          return { backgroundColor: comparisonColor };
        }
      }
      return {};
    }

    // Normal mode
    const state = cellStates[hand] || 'default';
    if (state === 'default') return {};

    const mixedColor = mixedColors.find(m => m.id === state);
    if (mixedColor) {
      const color1 = mixedColor.color1;
      const color2 = mixedColor.color2;
      const ratio = mixedColor.ratio ?? 50;
      const showSlider = mixedColor.showSlider ?? false;
      // Use the mixed color's own textColor property
      const textColor = mixedColor.textColor || 'white';
      return {
        background: showSlider
          ? `linear-gradient(to right, ${color1} ${ratio}%, ${color2} ${ratio}%)`
          : `linear-gradient(135deg, ${color1} 0%, ${color1} 50%, ${color2} 50%, ${color2} 100%)`,
        color: textColor
      };
    }

    const color = colors.find(c => c.id === state);
    if (color) {
      return {
        backgroundColor: color.color,
        color: color.textColor || 'white'
      };
    }
    return {};
  };

  return (
    <div className="poker-grid-container" ref={ref} onMouseUp={handleMouseUp}>
      <div className="poker-grid">
        {hands.map((row, i) => (
          <div key={i} className="poker-grid-row">
            {row.map((hand, j) => {
              const isPair = i === j;
              const isCenterPair = i === 6 && j === 6;
              const displayText = hand.slice(0, 2);
              const suffix = simpleView ? '' : (hand.endsWith('s') ? 's' : hand.endsWith('o') ? 'o' : '');
              const hasColor = cellStates[hand] && cellStates[hand] !== 'default';
              const textOpacity = hasColor ? 'opacity-100' : 'opacity-40';

              // Get comparison class if in comparison mode
              const comparisonClass = comparisonMode
                ? getCellComparisonClass(hand, correctAnswers, cellStates)
                : '';

              return (
                <button
                  key={`${i}-${j}`}
                  onMouseDown={() => handleMouseDown(hand)}
                  onMouseEnter={() => handleMouseEnter(hand)}
                  style={getCellStyle(hand)}
                  className={`poker-cell ${isPair ? 'poker-cell-pair-style4c' : ''} ${getCellColor(hand)} ${comparisonClass}`}
                >
                  {isCenterPair && simpleView ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" className={textOpacity}>
                      <circle cx="10" cy="10" r="8" fill="currentColor" />
                    </svg>
                  ) : (
                    <span className={`cell-text ${textOpacity}`}>
                      {displayText}
                      {!simpleView && <span className="cell-suffix">{suffix}</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});