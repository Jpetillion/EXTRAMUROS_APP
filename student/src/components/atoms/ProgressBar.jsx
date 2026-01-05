import './ProgressBar.css';

export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'medium',
  showLabel = false,
  label,
  className = ''
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const classes = [
    'progress-bar',
    `progress-bar--${variant}`,
    `progress-bar--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {(showLabel || label) && (
        <div className="progress-bar__label">
          <span>{label || `${Math.round(percentage)}%`}</span>
        </div>
      )}
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
