import { formatDuration } from '../utils/trainingHelpers';
import { Icon } from './Icons';

/**
 * Training Controls Panel
 * Displays instructions and action buttons during training mode
 */
export const TrainingControls = ({
  onSubmit,
  onReset,
  elapsedTime,
  userAttemptCount
}) => {
  return (
    <div className="panel training-controls-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Icon icon="brain" size={18} />
          Training Mode
        </h2>
      </div>

      <div className="training-instructions">
        <p>Paint the range from memory. When you're done, click Submit to see your results.</p>
      </div>

      <div className="training-stats-preview">
        <div className="stat-item">
          <span className="stat-label">Hands Painted:</span>
          <span className="stat-value">{userAttemptCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time Elapsed:</span>
          <span className="stat-value">{formatDuration(elapsedTime)}</span>
        </div>
      </div>

      <div className="training-actions">
        <button
          onClick={onSubmit}
          className="training-btn training-btn-submit"
          disabled={userAttemptCount === 0}
        >
          <Icon icon="check" size={16} />
          Submit Answer
        </button>

        <button
          onClick={onReset}
          className="training-btn training-btn-reset"
        >
          <Icon icon="refresh" size={16} />
          Clear & Restart
        </button>
      </div>

      <div className="training-tips">
        <div className="tip-header">
          <Icon icon="lightbulb" size={14} />
          <span>Tips</span>
        </div>
        <ul>
          <li>Take your time - accuracy matters more than speed</li>
          <li>Use the same colors as the original range</li>
          <li>Click and drag to paint multiple cells</li>
        </ul>
      </div>
    </div>
  );
};
