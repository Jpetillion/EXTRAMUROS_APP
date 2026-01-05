import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsAPI } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/helpers';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import Spinner from '../components/atoms/Spinner';
import Modal from '../components/molecules/Modal';
import TripForm from '../components/organisms/TripForm';
import styles from './Trips.module.css';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripsAPI.getAll();
      setTrips(response.data || []);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      error('Failed to load trips');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = () => {
    setEditingTrip(null);
    setIsModalOpen(true);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingTrip) {
        await tripsAPI.update(editingTrip.id, formData);
        success('Trip updated successfully');
      } else {
        await tripsAPI.create(formData);
        success('Trip created successfully');
      }
      handleCloseModal();
      fetchTrips();
    } catch (err) {
      console.error('Failed to save trip:', err);
      error(err?.data?.message || 'Failed to save trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      await tripsAPI.delete(tripId);
      success('Trip deleted successfully');
      fetchTrips();
    } catch (err) {
      console.error('Failed to delete trip:', err);
      error(err?.data?.message || 'Failed to delete trip');
    }
  };

  const handlePublishTrip = async (tripId) => {
    try {
      await tripsAPI.publish(tripId);
      success('Trip published successfully');
      fetchTrips();
    } catch (err) {
      console.error('Failed to publish trip:', err);
      error(err?.data?.message || 'Failed to publish trip');
    }
  };

  const handleUnpublishTrip = async (tripId) => {
    try {
      await tripsAPI.unpublish(tripId);
      success('Trip unpublished successfully');
      fetchTrips();
    } catch (err) {
      console.error('Failed to unpublish trip:', err);
      error(err?.data?.message || 'Failed to unpublish trip');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'published':
        return 'green';
      case 'draft':
        return 'yellow';
      case 'archived':
        return 'gray';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
        <p>Loading trips...</p>
      </div>
    );
  }

  return (
    <div className={styles.trips}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Trips</h1>
          <p className={styles.subtitle}>Manage your trips and excursions</p>
        </div>
        <Button onClick={handleCreateTrip}>Create Trip</Button>
      </div>

      {trips.length === 0 ? (
        <Card>
          <div className={styles.emptyState}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h3>No trips yet</h3>
            <p>Get started by creating your first trip</p>
            <Button onClick={handleCreateTrip}>Create Trip</Button>
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          {trips.map((trip) => (
            <Card key={trip.id} className={styles.tripCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.tripTitle}>{trip.title}</h3>
                <Badge variant={getStatusBadgeVariant(trip.status)}>
                  {trip.status}
                </Badge>
              </div>

              <p className={styles.tripDescription}>{trip.description}</p>

              <div className={styles.tripMeta}>
                <div className={styles.metaItem}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{trip.city}, {trip.country}</span>
                </div>
                {trip.duration && (
                  <div className={styles.metaItem}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{trip.duration}</span>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.footerLeft}>
                  <span className={styles.date}>
                    Updated {formatDate(trip.updatedAt, 'short')}
                  </span>
                </div>
                <div className={styles.actions}>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => handleEditTrip(trip)}
                  >
                    Edit
                  </Button>
                  {trip.status === 'draft' && (
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={() => handlePublishTrip(trip.id)}
                    >
                      Publish
                    </Button>
                  )}
                  {trip.status === 'published' && (
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={() => handleUnpublishTrip(trip.id)}
                    >
                      Unpublish
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => handleDeleteTrip(trip.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTrip ? 'Edit Trip' : 'Create New Trip'}
        size="large"
      >
        <TripForm
          initialData={editingTrip}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default Trips;
