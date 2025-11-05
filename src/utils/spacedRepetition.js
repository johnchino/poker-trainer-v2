/**
 * Spaced Repetition Algorithm (SM-2)
 * Calculates optimal review intervals based on performance
 */

/**
 * Convert accuracy percentage to quality rating (0-5) for SM-2 algorithm
 * @param {number} accuracy - Accuracy percentage (0-100)
 * @returns {number} Quality rating from 0-5
 */
export const accuracyToQuality = (accuracy) => {
  if (accuracy >= 95) return 5; // Perfect
  if (accuracy >= 85) return 4; // Good
  if (accuracy >= 70) return 3; // Pass
  if (accuracy >= 50) return 2; // Hard
  if (accuracy >= 30) return 1; // Fail but remembered something
  return 0; // Complete fail
};

/**
 * Calculate next review date and interval using SM-2 algorithm
 * @param {number} quality - User performance quality (0-5)
 * @param {number} repetitions - Number of successful repetitions
 * @param {number} easinessFactor - Current easiness factor (min 1.3)
 * @param {number} interval - Current interval in days
 * @returns {Object} { interval, repetitions, easinessFactor, nextReviewDate, dueForReview }
 */
export const calculateNextReview = (quality, repetitions = 0, easinessFactor = 2.5, interval = 0) => {
  // Calculate new easiness factor
  let newEasiness = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure easiness doesn't go below 1.3
  newEasiness = Math.max(1.3, newEasiness);

  let newRepetitions = repetitions;
  let newInterval = interval;

  if (quality < 3) {
    // Failed: restart from beginning
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Passed: increment repetitions and calculate new interval
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1; // First review: 1 day
    } else if (newRepetitions === 2) {
      newInterval = 6; // Second review: 6 days
    } else {
      // Subsequent reviews: multiply previous interval by easiness factor
      newInterval = Math.round(interval * newEasiness);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // Check if due for review (today or earlier)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueForReview = nextReviewDate <= today;

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easinessFactor: newEasiness,
    nextReviewDate: nextReviewDate.toISOString(),
    dueForReview
  };
};

/**
 * Check if a grid is due for review based on next review date
 * @param {string} nextReviewDateISO - ISO date string
 * @returns {boolean} True if due for review
 */
export const isDueForReview = (nextReviewDateISO) => {
  if (!nextReviewDateISO) return true; // Never reviewed, always due

  const nextReviewDate = new Date(nextReviewDateISO);
  const today = new Date();

  // Set both to midnight for fair comparison
  nextReviewDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return nextReviewDate <= today;
};

/**
 * Get a friendly description of when next review is due
 * @param {string} nextReviewDateISO - ISO date string
 * @returns {string} Human-readable time until review
 */
export const getNextReviewDescription = (nextReviewDateISO) => {
  if (!nextReviewDateISO) return 'Not practiced yet';

  const nextReview = new Date(nextReviewDateISO);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextReview.setHours(0, 0, 0, 0);

  const diffTime = nextReview - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    if (overdue === 1) return 'Due yesterday';
    return `Overdue by ${overdue} days`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else if (diffDays <= 30) {
    const weeks = Math.round(diffDays / 7);
    return `Due in ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else {
    const months = Math.round(diffDays / 30);
    return `Due in ${months} month${months > 1 ? 's' : ''}`;
  }
};

/**
 * Initialize default progress data for a new grid
 * @returns {Object} Default progress object
 */
export const initializeProgress = () => {
  return {
    totalAttempts: 0,
    lastAttemptDate: null,
    lastAccuracy: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    dueForReview: true,
    sessionHistory: [],
    problemHands: []
  };
};
