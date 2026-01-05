import { TripCard } from '../molecules/TripCard.jsx';
import { Button } from '../atoms/Button.jsx';
import { Spinner } from '../atoms/Spinner.jsx';
import './TripList.css';

export function TripList({
  trips,
  isLoading,
  onTripClick,
  onDelete,
  emptyMessage = 'No trips available'
}) {
  if (isLoading) {
    return (
      <div className="trip-list trip-list--loading">
        <Spinner size="large" variant="primary" />
        <p>Loading trips...</p>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className="trip-list trip-list--empty">
        <p className="trip-list__empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="trip-list">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onClick={() => onTripClick(trip.id)}
          actions={
            onDelete && (
              <Button
                variant="danger"
                size="small"
                onClick={() => onDelete(trip.id)}
                icon="🗑️"
              >
                Delete
              </Button>
            )
          }
        />
      ))}
    </div>
  );
}
