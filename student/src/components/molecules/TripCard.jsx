import { Badge } from '../atoms/Badge.jsx';
import { Icon } from '../atoms/Icon.jsx';
import { formatDate } from '../../utils/helpers.js';
import './TripCard.css';

export function TripCard({
  trip,
  onClick,
  actions
}) {
  return (
    <div className="trip-card" onClick={onClick}>
      {trip.imageUrl && (
        <div className="trip-card__image">
          <img src={trip.imageUrl} alt={trip.title} />
        </div>
      )}

      <div className="trip-card__content">
        <div className="trip-card__header">
          <h3 className="trip-card__title">{trip.title}</h3>
          {trip.isDownloaded && (
            <Badge variant="success" size="small">Downloaded</Badge>
          )}
        </div>

        {trip.description && (
          <p className="trip-card__description">{trip.description}</p>
        )}

        <div className="trip-card__meta">
          {trip.location && (
            <span className="trip-card__location">
              <Icon name="location" size="small" />
              {' '}
              {trip.location}
            </span>
          )}
          {trip.date && (
            <span className="trip-card__date">
              <Icon name="schedule" size="small" />
              {' '}
              {formatDate(trip.date)}
            </span>
          )}
        </div>

        {trip.downloadedAt && (
          <div className="trip-card__footer">
            <span className="trip-card__downloaded-date">
              Downloaded: {formatDate(trip.downloadedAt)}
            </span>
          </div>
        )}

        {actions && (
          <div className="trip-card__actions" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
