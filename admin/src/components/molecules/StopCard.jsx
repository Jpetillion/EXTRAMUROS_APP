import { useState } from 'react';
import Button from '../atoms/Button';
import styles from './StopCard.module.css';

const StopCard = ({ stop, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${stop.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(stop.id);
      } catch (error) {
        console.error('Delete failed:', error);
        setIsDeleting(false);
      }
    }
  };

  const hasLocation = stop.lat && stop.lng;
  const hasMedia = stop.pictureUrl || stop.audioUrl || stop.videoUrl;

  return (
    <div className={styles.stopCard}>
      <div className={styles.orderIndex}>
        <span className={styles.number}>{stop.orderIndex + 1}</span>
        <div className={styles.orderControls}>
          <button
            className={styles.orderButton}
            onClick={() => onMoveUp(stop.id)}
            disabled={isFirst}
            title="Move up"
          >
            ↑
          </button>
          <button
            className={styles.orderButton}
            onClick={() => onMoveDown(stop.id)}
            disabled={isLast}
            title="Move down"
          >
            ↓
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{stop.title}</h4>
          {stop.category && (
            <span className={`${styles.badge} ${styles[stop.category.toLowerCase()]}`}>
              {stop.category}
            </span>
          )}
        </div>

        <div className={styles.details}>
          {stop.durationMinutes && (
            <span className={styles.detail}>
              <span className={styles.icon}>⏱</span>
              {stop.durationMinutes} min
            </span>
          )}
          {stop.difficulty && (
            <span className={styles.detail}>
              <span className={styles.icon}>⚡</span>
              {stop.difficulty}
            </span>
          )}
          {hasLocation && (
            <span className={styles.detail}>
              <span className={styles.icon}>📍</span>
              {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
            </span>
          )}
        </div>

        {stop.address && (
          <p className={styles.address}>{stop.address}</p>
        )}

        {hasMedia && (
          <div className={styles.media}>
            {stop.pictureUrl && <span className={styles.mediaIcon} title="Has picture">🖼️</span>}
            {stop.audioUrl && <span className={styles.mediaIcon} title="Has audio">🎵</span>}
            {stop.videoUrl && <span className={styles.mediaIcon} title="Has video">🎬</span>}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="small"
          onClick={() => onEdit(stop)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="small"
          onClick={handleDelete}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default StopCard;
