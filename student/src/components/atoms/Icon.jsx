import './Icon.css';

export function Icon({
  name,
  size = 'medium',
  color,
  className = ''
}) {
  const classes = [
    'icon',
    `icon--${size}`,
    className
  ].filter(Boolean).join(' ');

  const style = color ? { color } : {};

  return (
    <span className={classes} style={style}>
      {getIconContent(name)}
    </span>
  );
}

function getIconContent(name) {
  const icons = {
    home: '🏠',
    map: '🗺️',
    download: '⬇️',
    settings: '⚙️',
    back: '←',
    forward: '→',
    check: '✓',
    close: '×',
    menu: '☰',
    location: '📍',
    audio: '🎵',
    image: '🖼️',
    text: '📝',
    schedule: '📅',
    activity: '✓',
    sync: '🔄',
    offline: '📵',
    online: '🌐',
    delete: '🗑️',
    edit: '✏️',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✓',
    star: '⭐',
    heart: '❤️',
    play: '▶️',
    pause: '⏸️',
    stop: '⏹️'
  };

  return icons[name] || '•';
}
