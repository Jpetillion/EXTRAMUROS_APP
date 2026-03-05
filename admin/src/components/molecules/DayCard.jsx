import { useState, useEffect, useRef } from 'react';
import Button from '../atoms/Button';
import styles from './DayCard.module.css';

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#ef4444', // red
  '#f97316', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#eab308', // yellow
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#6b7280', // gray
];

const DayCard = ({ day, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onAddEvent, onColorChange, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dotColor, setDotColor] = useState(day.color || '#3b82f6');
  const [colorMenu, setColorMenu] = useState(null);
  const menuRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    if (!colorMenu) return;
    const handleClose = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setColorMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClose);
    document.addEventListener('touchstart', handleClose, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('touchstart', handleClose);
    };
  }, [colorMenu]);

  const openColorMenu = (x, y) => {
    // Clamp menu position so it stays within the viewport
    const menuWidth = 160;
    const menuHeight = 100;
    const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
    const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);
    setColorMenu({ x: Math.max(8, clampedX), y: Math.max(8, clampedY) });
  };

  const handleDotContextMenu = (e) => {
    e.preventDefault();
    openColorMenu(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    longPressTimer.current = setTimeout(() => {
      openColorMenu(x, y);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleTouchMove = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleSelectColor = (color) => {
    setDotColor(color);
    setColorMenu(null);
    onColorChange?.(day.id, color);
  };

  const handleDelete = async () => {
    const eventsCount = day.events?.length || 0;
    const confirmMsg = eventsCount > 0
      ? `Are you sure you want to delete "${day.title}"? This will also delete ${eventsCount} event(s).`
      : `Are you sure you want to delete "${day.title}"?`;

    if (window.confirm(confirmMsg)) {
      setIsDeleting(true);
      try {
        await onDelete(day.id);
      } catch (error) {
        console.error('Delete failed:', error);
        setIsDeleting(false);
      }
    }
  };

  const eventsCount = day.events?.length || 0;

  return (
    <div className={styles.dayCard}>
      <div className={styles.header}>
        <div className={styles.orderIndex}>
          <span
            className={styles.number}
            style={{ background: dotColor }}
            onContextMenu={handleDotContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            title="Rechtermuisknop om kleur te wijzigen"
          >
            {day.day_number}
          </span>
          <div className={styles.orderControls}>
            <button
              className={styles.orderButton}
              onClick={() => onMoveUp(day.id)}
              disabled={isFirst}
              title="Move up"
            >
              ↑
            </button>
            <button
              className={styles.orderButton}
              onClick={() => onMoveDown(day.id)}
              disabled={isLast}
              title="Move down"
            >
              ↓
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h4 className={styles.title}>{day.title}</h4>
            <span className={styles.eventsCount}>
              {eventsCount} event{eventsCount !== 1 ? 's' : ''}
            </span>
          </div>
          {day.description && <p className={styles.description}>{day.description}</p>}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <Button variant="secondary" size="small" onClick={() => onEdit(day)}>
            Edit
          </Button>
          <Button variant="danger" size="small" onClick={handleDelete} loading={isDeleting}>
            Delete
          </Button>
        </div>
      </div>

      {colorMenu && (
        <div
          ref={menuRef}
          className={styles.colorMenu}
          style={{ top: colorMenu.y, left: colorMenu.x }}
        >
          <p className={styles.colorMenuLabel}>Kies kleur</p>
          <div className={styles.colorSwatches}>
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                className={styles.colorSwatch}
                style={{ background: color, outline: dotColor === color ? `3px solid ${color}` : 'none', outlineOffset: '2px' }}
                onClick={() => handleSelectColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.eventsHeader}>
            <h5>Events</h5>
            <Button variant="primary" size="small" onClick={() => onAddEvent(day.id)}>
              + Add Event
            </Button>
          </div>

          {eventsCount === 0 ? (
            <div className={styles.emptyEvents}>
              <p>No events yet for this day</p>
            </div>
          ) : (
            <div className={styles.events}>{children}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayCard;
