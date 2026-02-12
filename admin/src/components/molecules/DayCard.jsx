import { useState } from 'react';
import Button from '../atoms/Button';
import styles from './DayCard.module.css';

const DayCard = ({ day, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onAddEvent, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
          <span className={styles.number}>{day.day_number}</span>
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
              <Button variant="primary" size="small" onClick={() => onAddEvent(day.id)}>
                Add First Event
              </Button>
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
