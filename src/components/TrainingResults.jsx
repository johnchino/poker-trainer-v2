import { formatDuration, getPerformanceRating } from '../utils/trainingHelpers';
import { Icon } from './Icons';

/**
 * Training Results Panel
 * Displays session results with accuracy breakdown and action buttons
 */
export const TrainingResults = ({
  sessionStats,
  onTryAgain,
  onExit
}) => {
  if (!sessionStats) return null;

  const rating = getPerformanceRating(sessionStats.accuracy);

  return (
    <div className="panel training-results-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Icon icon="trophy" size={18} />
          Results
        </h2>
      </div>

      <div className="results-summary">
        <div className="accuracy-display">
          <div
            className="accuracy-circle"
            style={{ borderColor: rating.color }}
          >
            <span className="accuracy-value">{sessionStats.accuracy}%</span>
            <span className="accuracy-label">Accuracy</span>
          </div>
          <div className="rating-label" style={{ color: rating.color }}>
            {rating.emoji} {rating.label}
          </div>
        </div>

        <div className="results-stats">
          <div className="stat-row stat-correct">
            <Icon icon="check-circle" size={16} />
            <span className="stat-label">Correct:</span>
            <span className="stat-value">{sessionStats.correctCount}</span>
          </div>

          {sessionStats.missedCount > 0 && (
            <div className="stat-row stat-missed">
              <Icon icon="x-circle" size={16} />
              <span className="stat-label">Missed:</span>
              <span className="stat-value">{sessionStats.missedCount}</span>
            </div>
          )}

          {sessionStats.extraCount > 0 && (
            <div className="stat-row stat-extra">
              <Icon icon="alert-circle" size={16} />
              <span className="stat-label">Extra:</span>
              <span className="stat-value">{sessionStats.extraCount}</span>
            </div>
          )}

          {sessionStats.incorrectColorCount > 0 && (
            <div className="stat-row stat-wrong-color">
              <Icon icon="alert-triangle" size={16} />
              <span className="stat-label">Wrong Color:</span>
              <span className="stat-value">{sessionStats.incorrectColorCount}</span>
            </div>
          )}

          <div className="stat-row stat-time">
            <Icon icon="clock" size={16} />
            <span className="stat-label">Time:</span>
            <span className="stat-value">{formatDuration(sessionStats.duration)}</span>
          </div>
        </div>
      </div>

      <div className="results-legend">
        <div className="legend-title">Grid Legend:</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-box legend-correct"></div>
            <span>Correct</span>
          </div>
          <div className="legend-item">
            <div className="legend-box legend-missed"></div>
            <span>Missed</span>
          </div>
          {sessionStats.extraCount > 0 && (
            <div className="legend-item">
              <div className="legend-box legend-extra"></div>
              <span>Extra</span>
            </div>
          )}
          {sessionStats.incorrectColorCount > 0 && (
            <div className="legend-item">
              <div className="legend-box legend-wrong-color"></div>
              <span>Wrong Color</span>
            </div>
          )}
        </div>
      </div>

      {sessionStats.accuracy < 70 && sessionStats.missedHands.length > 0 && (
        <div className="problem-hands-preview">
          <div className="problem-header">
            <Icon icon="alert-circle" size={14} />
            <span>Hands to Review:</span>
          </div>
          <div className="problem-hands-list">
            {sessionStats.missedHands.slice(0, 5).map(hand => (
              <span key={hand} className="problem-hand">{hand}</span>
            ))}
            {sessionStats.missedHands.length > 5 && (
              <span className="problem-more">+{sessionStats.missedHands.length - 5} more</span>
            )}
          </div>
        </div>
      )}

      <div className="results-actions">
        <button
          onClick={onTryAgain}
          className="training-btn training-btn-try-again"
        >
          <Icon icon="refresh" size={16} />
          Try Again
        </button>

        <button
          onClick={onExit}
          className="training-btn training-btn-exit"
        >
          <Icon icon="x" size={16} />
          Exit Training
        </button>
      </div>

      {sessionStats.accuracy >= 85 && (
        <div className="results-encouragement">
          Great job! Your range knowledge is solid. Keep practicing to maintain your skills.
        </div>
      )}

      {sessionStats.accuracy >= 50 && sessionStats.accuracy < 85 && (
        <div className="results-encouragement">
          Good effort! A few more practice sessions will help solidify this range.
        </div>
      )}

      {sessionStats.accuracy < 50 && (
        <div className="results-encouragement">
          Keep practicing! This range needs more review. Try breaking it down by position or action.
        </div>
      )}
    </div>
  );
};
