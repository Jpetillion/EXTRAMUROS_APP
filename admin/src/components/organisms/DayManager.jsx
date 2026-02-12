import { useState, useEffect } from 'react';
import { daysAPI } from '../../utils/api';
import Button from '../atoms/Button';
import Card from '../molecules/Card';
import DayCard from '../molecules/DayCard';
import DayForm from './DayForm';
import styles from './DayManager.module.css';

const DayManager = ({ tripId, onUpdate, onAddEvent }) => {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDays();
  }, [tripId]);

  const fetchDays = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await daysAPI.getAll(tripId);
      const sortedDays = response.data.sort((a, b) => a.order_index - b.order_index);
      setDays(sortedDays);
    } catch (err) {
      console.error('Failed to fetch days:', err);
      setError('Failed to load trip days');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDay(null);
    setIsFormOpen(true);
  };

  const handleEdit = (day) => {
    setEditingDay(day);
    setIsFormOpen(true);
  };

  const handleSave = async (dayData) => {
    try {
      setIsSaving(true);
      setError(null);

      if (editingDay) {
        // Update existing day
        await daysAPI.update(tripId, editingDay.id, dayData);
      } else {
        // Create new day
        const orderIndex = days.length;
        await daysAPI.create(tripId, { ...dayData, orderIndex });
      }

      await fetchDays();
      setIsFormOpen(false);
      setEditingDay(null);

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to save day:', err);
      setError(err.data?.error || 'Failed to save day');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (dayId) => {
    try {
      setError(null);
      await daysAPI.delete(tripId, dayId);
      await fetchDays();

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to delete day:', err);
      setError(err.data?.error || 'Failed to delete day');
    }
  };

  const handleMoveUp = async (dayId) => {
    const index = days.findIndex((d) => d.id === dayId);
    if (index <= 0) return;

    try {
      setError(null);
      const newDays = [...days];
      [newDays[index - 1], newDays[index]] = [newDays[index], newDays[index - 1]];

      // Reorder using the reorder endpoint
      const dayIds = newDays.map(d => d.id);
      await daysAPI.reorder(tripId, dayIds);

      await fetchDays();

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to reorder days:', err);
      setError('Failed to reorder days');
    }
  };

  const handleMoveDown = async (dayId) => {
    const index = days.findIndex((d) => d.id === dayId);
    if (index === -1 || index >= days.length - 1) return;

    try {
      setError(null);
      const newDays = [...days];
      [newDays[index], newDays[index + 1]] = [newDays[index + 1], newDays[index]];

      // Reorder using the reorder endpoint
      const dayIds = newDays.map(d => d.id);
      await daysAPI.reorder(tripId, dayIds);

      await fetchDays();

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to reorder days:', err);
      setError('Failed to reorder days');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingDay(null);
    setError(null);
  };

  if (loading) {
    return (
      <Card title="Trip Days">
        <div className={styles.loading}>Loading days...</div>
      </Card>
    );
  }

  if (isFormOpen) {
    return (
      <Card title={editingDay ? 'Edit Day' : 'Add New Day'}>
        {error && <div className={styles.error}>{error}</div>}
        <DayForm
          day={editingDay}
          dayNumber={editingDay ? editingDay.day_number : days.length + 1}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      </Card>
    );
  }

  return (
    <Card
      title="Trip Days"
      subtitle={`${days.length} day${days.length !== 1 ? 's' : ''} in this trip`}
      footer={
        <Button variant="primary" onClick={handleCreate}>
          + Add Day
        </Button>
      }
    >
      {error && <div className={styles.error}>{error}</div>}

      {days.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📅</div>
          <h3>No days yet</h3>
          <p>Structure your trip by adding days. Each day can contain multiple events.</p>
          <Button variant="primary" onClick={handleCreate}>
            Add First Day
          </Button>
        </div>
      ) : (
        <div className={styles.daysList}>
          {days.map((day, index) => (
            <DayCard
              key={day.id}
              day={day}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onAddEvent={onAddEvent}
              isFirst={index === 0}
              isLast={index === days.length - 1}
            >
              {day.events && day.events.length > 0 && (
                <div className={styles.eventsList}>
                  {day.events.map((event) => (
                    <div key={event.id} className={styles.eventItem}>
                      <span className={styles.eventTitle}>{event.title}</span>
                      {event.category && (
                        <span className={styles.eventCategory}>{event.category}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </DayCard>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DayManager;
