import { useState, useEffect } from 'react';
import { stopsAPI } from '../../utils/api';
import Button from '../atoms/Button';
import Card from '../molecules/Card';
import StopCard from '../molecules/StopCard';
import StopForm from './StopForm';
import styles from './TripStopsManager.module.css';

const TripStopsManager = ({ tripId, onUpdate }) => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStops();
  }, [tripId]);

  const fetchStops = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await stopsAPI.getAll(tripId);
      const sortedStops = response.data.sort((a, b) => a.orderIndex - b.orderIndex);
      setStops(sortedStops);
    } catch (err) {
      console.error('Failed to fetch stops:', err);
      setError('Failed to load trip stops');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStop(null);
    setIsFormOpen(true);
  };

  const handleEdit = (stop) => {
    setEditingStop(stop);
    setIsFormOpen(true);
  };

  const handleSave = async (stopData) => {
    try {
      setIsSaving(true);
      setError(null);

      if (editingStop) {
        // Update existing stop
        await stopsAPI.update(tripId, editingStop.id, stopData);
      } else {
        // Create new stop
        const orderIndex = stops.length;
        await stopsAPI.create(tripId, { ...stopData, orderIndex });
      }

      await fetchStops();
      setIsFormOpen(false);
      setEditingStop(null);

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to save stop:', err);
      setError(err.data?.error || 'Failed to save stop');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (stopId) => {
    try {
      setError(null);
      await stopsAPI.delete(tripId, stopId);
      await fetchStops();

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to delete stop:', err);
      setError(err.data?.error || 'Failed to delete stop');
    }
  };

  const handleMoveUp = async (stopId) => {
    const index = stops.findIndex((s) => s.id === stopId);
    if (index <= 0) return;

    try {
      setError(null);
      const newStops = [...stops];
      [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];

      // Update order indices
      await Promise.all([
        stopsAPI.update(tripId, newStops[index - 1].id, { orderIndex: index - 1 }),
        stopsAPI.update(tripId, newStops[index].id, { orderIndex: index }),
      ]);

      await fetchStops();

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to reorder stops:', err);
      setError('Failed to reorder stops');
    }
  };

  const handleMoveDown = async (stopId) => {
    const index = stops.findIndex((s) => s.id === stopId);
    if (index === -1 || index >= stops.length - 1) return;

    try {
      setError(null);
      const newStops = [...stops];
      [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];

      // Update order indices
      await Promise.all([
        stopsAPI.update(tripId, newStops[index].id, { orderIndex: index }),
        stopsAPI.update(tripId, newStops[index + 1].id, { orderIndex: index + 1 }),
      ]);

      await fetchStops();

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to reorder stops:', err);
      setError('Failed to reorder stops');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingStop(null);
    setError(null);
  };

  if (loading) {
    return (
      <Card title="Trip Stops">
        <div className={styles.loading}>Loading stops...</div>
      </Card>
    );
  }

  if (isFormOpen) {
    return (
      <Card title={editingStop ? 'Edit Stop' : 'Add New Stop'}>
        {error && <div className={styles.error}>{error}</div>}
        <StopForm stop={editingStop} onSave={handleSave} onCancel={handleCancel} isLoading={isSaving} />
      </Card>
    );
  }

  return (
    <Card
      title="Trip Stops"
      subtitle={`${stops.length} stop${stops.length !== 1 ? 's' : ''} in this trip`}
      footer={
        <Button variant="primary" onClick={handleCreate}>
          + Add Stop
        </Button>
      }
    >
      {error && <div className={styles.error}>{error}</div>}

      {stops.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📍</div>
          <h3>No stops yet</h3>
          <p>Add waypoints, locations, or points of interest for this trip.</p>
          <Button variant="primary" onClick={handleCreate}>
            Add First Stop
          </Button>
        </div>
      ) : (
        <div className={styles.stopsList}>
          {stops.map((stop, index) => (
            <StopCard
              key={stop.id}
              stop={stop}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={index === 0}
              isLast={index === stops.length - 1}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default TripStopsManager;
