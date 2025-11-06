/**
 * Training Mode Helper Functions
 * Handles comparison logic, accuracy calculation, and result analysis
 */

/**
 * Calculate training results by comparing correct answers with user attempt
 * @param {Object} correctCellStates - The correct range (original grid cellStates)
 * @param {Object} userAttempt - User's painted cells
 * @returns {Object} Results object with accuracy stats and hand categorization
 */
export const calculateTrainingResults = (correctCellStates, userAttempt) => {
  const correctHands = [];
  const missedHands = [];
  const extraHands = [];
  const incorrectColorHands = []; // Painted but with wrong color

  // Get all hands that should be painted (non-default colors in correct answers)
  const correctlyPaintedHands = Object.entries(correctCellStates).filter(
    ([hand, color]) => color && color !== 'default'
  );

  // Check each hand in the correct range
  correctlyPaintedHands.forEach(([hand, correctColor]) => {
    const userColor = userAttempt[hand];

    if (userColor === correctColor) {
      // Correct: same color
      correctHands.push(hand);
    } else if (!userColor || userColor === 'default') {
      // Missed: should be painted but isn't
      missedHands.push(hand);
    } else {
      // Incorrect color: painted but wrong color
      incorrectColorHands.push({ hand, correct: correctColor, user: userColor });
    }
  });

  // Check for extra hands (painted but shouldn't be)
  Object.entries(userAttempt).forEach(([hand, userColor]) => {
    if (userColor && userColor !== 'default') {
      const correctColor = correctCellStates[hand];
      if (!correctColor || correctColor === 'default') {
        extraHands.push(hand);
      }
    }
  });

  // Calculate accuracy
  const totalCorrectInRange = correctlyPaintedHands.length;
  const accuracy = totalCorrectInRange > 0
    ? (correctHands.length / totalCorrectInRange) * 100
    : 0;

  return {
    correctHands,
    missedHands,
    extraHands,
    incorrectColorHands,
    correctCount: correctHands.length,
    missedCount: missedHands.length,
    extraCount: extraHands.length,
    incorrectColorCount: incorrectColorHands.length,
    accuracy: Math.round(accuracy * 10) / 10,
    totalHandsInRange: totalCorrectInRange
  };
};

/**
 * Get the comparison class for a cell in comparison mode
 * @param {string} hand - Hand notation (e.g., "AA", "AKs")
 * @param {Object} correctCellStates - Correct answers
 * @param {Object} userAttempt - User's attempt
 * @returns {string} CSS class name for the cell
 */
export const getCellComparisonClass = (hand, correctCellStates, userAttempt) => {
  const correct = correctCellStates[hand];
  const user = userAttempt[hand];

  // Normalize undefined/null to 'default'
  const correctColor = correct || 'default';
  const userColor = user || 'default';

  if (correctColor === userColor && correctColor !== 'default') {
    return 'cell-correct'; // Green border - correct
  } else if (correctColor !== 'default' && userColor === 'default') {
    return 'cell-missed'; // Red border - should be painted but isn't
  } else if (correctColor === 'default' && userColor !== 'default') {
    return 'cell-extra'; // Yellow border - shouldn't be painted but is
  } else if (correctColor !== 'default' && userColor !== 'default' && correctColor !== userColor) {
    return 'cell-wrong-color'; // Orange border - painted but wrong color
  }

  return '';
};

/**
 * Get the display color for a cell in comparison mode
 * Shows correct color for missed hands (faded), user color for others
 * @param {string} hand - Hand notation
 * @param {Object} correctCellStates - Correct answers
 * @param {Object} userAttempt - User's attempt
 * @param {Array} colors - Available solid colors
 * @param {Array} mixedColors - Available mixed colors
 * @returns {string} Color value or null
 */
export const getCellComparisonColor = (hand, correctCellStates, userAttempt, colors, mixedColors) => {
  const correct = correctCellStates[hand];
  const user = userAttempt[hand];
  const correctColor = correct || 'default';
  const userColor = user || 'default';

  // For missed hands, show the correct color (will be styled with opacity)
  if (correctColor !== 'default' && userColor === 'default') {
    return getColorValue(correctColor, colors, mixedColors);
  }

  // For all other cases, show user's color
  if (userColor && userColor !== 'default') {
    return getColorValue(userColor, colors, mixedColors);
  }

  return null;
};

/**
 * Get the actual color value from color ID
 * @param {string} colorId - Color ID (e.g., "green", "mixed1")
 * @param {Array} colors - Solid colors array
 * @param {Array} mixedColors - Mixed colors array
 * @returns {string} Hex color value or gradient
 */
const getColorValue = (colorId, colors, mixedColors) => {
  // Check solid colors
  const solidColor = colors.find(c => c.id === colorId);
  if (solidColor) return solidColor.color;

  // Check mixed colors
  const mixedColor = mixedColors.find(c => c.id === colorId);
  if (mixedColor) {
    const color1 = mixedColor.color1;
    const color2 = mixedColor.color2;
    return `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)`;
  }

  return null;
};

/**
 * Format duration in seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time string
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get performance rating based on accuracy
 * @param {number} accuracy - Accuracy percentage (0-100)
 * @returns {Object} Rating object with label and color
 */
export const getPerformanceRating = (accuracy) => {
  if (accuracy >= 95) {
    return { label: 'Perfect!', color: '#22c55e', emoji: '🎯' };
  } else if (accuracy >= 85) {
    return { label: 'Excellent', color: '#22c55e', emoji: '⭐' };
  } else if (accuracy >= 70) {
    return { label: 'Good', color: '#3b82f6', emoji: '👍' };
  } else if (accuracy >= 50) {
    return { label: 'Needs Practice', color: '#f59e0b', emoji: '📚' };
  } else {
    return { label: 'Keep Trying', color: '#ef4444', emoji: '💪' };
  }
};
