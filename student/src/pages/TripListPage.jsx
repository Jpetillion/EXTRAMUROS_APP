import { useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { TripList } from '../components/organisms/TripList.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import ConfirmModal from '../components/molecules/ConfirmModal.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { useOfflineContext } from '../context/OfflineContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { useConfirm } from '../hooks/useConfirm.js';
import './TripListPage.css';

export function TripListPage() {
  const navigate = useNavigate();
  const { downloadedTrips, isLoading, deleteTrip } = useTripContext();
  const { isOnline } = useOfflineContext();
  const { success, error: showError } = useToast();
  const { confirm, confirmState, handleClose } = useConfirm();

  const handleTripClick = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  const handleDelete = async (tripId) => {
    const confirmed = await confirm({
      title: 'Uitstap Verwijderen',
      message: 'Weet je zeker dat je deze uitstap wilt verwijderen? Alle gedownloade content wordt verwijderd.',
      confirmText: 'Verwijderen',
      cancelText: 'Annuleren',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteTrip(tripId);
      success('Uitstap succesvol verwijderd');
    } catch (error) {
      showError('Kon uitstap niet verwijderen. Probeer het opnieuw.');
    }
  };

  return (
    <div className="trip-list-page">
      <Header title="Mijn Uitstappen" showBack={true} />

      <div className="trip-list-page__container">
        {!isOnline && downloadedTrips.length === 0 && (
          <div className="trip-list-page__offline-notice">
            <Icon name="offline" size="xlarge" color="var(--color-gray-400)" />
            <h3>Je bent offline</h3>
            <p>Download uitstappen wanneer je een internetverbinding hebt.</p>
          </div>
        )}

        {isOnline && downloadedTrips.length === 0 && (
          <div className="trip-list-page__empty">
            <div className="trip-list-page__empty-icon">
              <Icon name="map" size="xlarge" color="var(--color-gray-400)" />
            </div>
            <h3>Geen Gedownloade Uitstappen</h3>
            <p>Ontdek en download uitstappen om ze offline te bekijken.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/browse')}
            >
              <Icon name="download" size="medium" />
              {' '}
              Uitstappen Ontdekken
            </Button>
          </div>
        )}

        {downloadedTrips.length > 0 && (
          <TripList
            trips={downloadedTrips}
            isLoading={isLoading}
            onTripClick={handleTripClick}
            onDelete={handleDelete}
            emptyMessage="Nog geen uitstappen gedownload"
          />
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleClose}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />
    </div>
  );
}
