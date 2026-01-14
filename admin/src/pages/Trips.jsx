import { useState, useEffect, useMemo } from 'react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeTrip = (trip) => {
    // Support both old + new API shapes
    const publishedFlag = trip.published ?? trip.is_published ?? trip.isPublished ?? false;

    // status can be string or derived from published
    const status =
      trip.status ??
      (publishedFlag ? 'published' : 'draft');

    // updatedAt can be snake_case or camelCase, unix seconds or ISO string
    const rawUpdated =
      trip.updatedAt ??
      trip.updated_at ??
      trip.updated ??
      trip.createdAt ??
      trip.created_at ??
      null;

    const updatedAt =
      typeof rawUpdated === 'number'
        ? new Date(rawUpdated * 1000).toISOString()
        : rawUpdated;

    // "Location summary" now comes from stops
    const stops = Array.isArray(trip.stops) ? trip.stops : [];
    const firstStop = stops[0] || null;

    const city =
      trip.city ??
      trip.locationCity ??
      firstStop?.city ??
      firstStop?.place ??
      firstStop?.title ??
      firstStop?.name ??
      '';

    const country =
      trip.country ??
      trip.locationCountry ??
      firstStop?.country ??
      '';

    // duration: either trip.duration or derived from stops
    const duration =
      trip.duration ??
      trip.totalDuration ??
      (stops.length ? `${stops.length} stop${stops.length === 1 ? '' : 's'}` : null);

    return {
      ...trip,
      status,
      updatedAt,
      stops,
      city,
      country,
      duration
    };
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripsAPI.getAll();

      const rows = response?.data || [];
      setTrips(Array.isArray(rows) ? rows.map(normalizeTrip) : []);
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
      // axios errors are usually err.response.data
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save trip';
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await tripsAPI.delete(tripId);
      success('Trip deleted successfully');
      fetchTrips();
    } catch (err) {
      console.error('Failed to delete trip:', err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete trip';
      error(msg);
    }
  };

  const handlePublishTrip = async (tripId) => {
    try {
      await tripsAPI.publish(tripId);
      success('Trip published successfully');
      fetchTrips();
    } catch (err) {
      console.error('Failed to publish trip:', err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to publish trip';
      error(msg);
    }
  };

  const handleUnpublishTrip = async (tripId) => {
    try {
      await tripsAPI.unpublish(tripId);
      success('Trip unpublished successfully');
      fetchTrips();
    } catch (err) {
      console.error('Failed to unpublish trip:', err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to unpublish trip';
      error(msg);
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

  const renderStopSummary = (trip) => {
    const stops = trip.stops || [];
    if (!stops.length) return null;

    // show first 2 stops as quick glance (title + optional category/duration)
    const top = stops.slice(0, 2);
    const remaining = stops.length - top.length;

    return (
      <div style={{ marginTop: 8 }}>
        {top.map((s, idx) => {
          const title = s.title || s.name || s.place || `Stop ${idx + 1}`;
          const category = s.category ? String(s.category) : null;
          const dur =
            s.duration ||
            s.durationMinutes ||
            s.duration_minutes ||
            null;

          const durText =
            typeof dur === 'number' ? `${dur} min` : (dur ? String(dur) : null);

          const meta = [durText, category].filter(Boolean).join(' • ');

          return (
            <div key={s.id || idx} style={{ fontSize: 12, opacity: 0.9, display: 'flex', gap: 8 }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                • {title}
              </span>
              {meta ? <span style={{ opacity: 0.7, whiteSpace: 'nowrap' }}>{meta}</span> : null}
            </div>
          );
        })}
        {remaining > 0 ? (
          <div style={{ fontSize: 12, opacity: 0.7 }}>+ {remaining} more</div>
        ) : null}
      </div>
    );
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

                  <span>
                    {trip.city}
                    {trip.country ? `, ${trip.country}` : ''}
                  </span>
                </div>

                {trip.duration ? (
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
                ) : null}
              </div>

              {/* Stops preview (new model) */}
              {renderStopSummary(trip)}

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
                    Details
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
