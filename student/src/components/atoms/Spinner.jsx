import './Spinner.css';

export function Spinner({
  size = 'medium',
  variant = 'primary',
  className = ''
}) {
  const classes = [
    'spinner',
    `spinner--${size}`,
    `spinner--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="spinner__circle"></div>
    </div>
  );
}
