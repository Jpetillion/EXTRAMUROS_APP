import { useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { TripList } from '../components/organisms/TripList.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { useOfflineContext } from '../context/OfflineContext.jsx';
import './TripListPage.css';

export function TripListPage() {
  const navigate = useNavigate();
  const { downloadedTrips, isLoading, deleteTrip } = useTripContext();
  const { isOnline } = useOfflineContext();

  const handleTripClick = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  const handleDelete = async (tripId) => {
    if (confirm('Are you sure you want to delete this trip? All downloaded content will be removed.')) {
      try {
        await deleteTrip(tripId);
      } catch (error) {
        alert('Failed to delete trip. Please try again.');
      }
    }
  };

  return (
    <div className="trip-list-page">
      <Header title="My Trips" showBack={true} />

      <div className="trip-list-page__container">
        {!isOnline && downloadedTrips.length === 0 && (
          <div className="trip-list-page__offline-notice">
            <p>You are offline. Download trips when you have an internet connection.</p>
          </div>
        )}

        {isOnline && downloadedTrips.length === 0 && (
          <div className="trip-list-page__empty">
            <div className="trip-list-page__empty-icon">🗺️</div>
            <h3>No Downloaded Trips</h3>
            <p>Browse and download trips to access them offline.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/browse')}
              icon="⬇️"
            >
              Browse Trips
            </Button>
          </div>
        )}

        {downloadedTrips.length > 0 && (
          <TripList
            trips={downloadedTrips}
            isLoading={isLoading}
            onTripClick={handleTripClick}
            onDelete={handleDelete}
            emptyMessage="No trips downloaded yet"
          />
        )}
      </div>
    </div>
  );
}
