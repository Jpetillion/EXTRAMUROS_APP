import { useState } from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { calculateDistance, getCurrentPosition } from '../../utils/geolocation';
import './CheckInButton.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function CheckInButton({ event, tripId }) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCheckIn = async () => {
    if (!event.lat || !event.lng) {
      setError('Dit event heeft geen locatie voor check-in');
      return;
    }

    setChecking(true);
    setError(null);
    setSuccess(false);

    try {
      // Get current position
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;

      // Calculate distance
      const distance = calculateDistance(latitude, longitude, event.lat, event.lng);

      // Check if within 100m radius
      if (distance > 100) {
        throw new Error(
          `Je bent ${Math.round(distance)}m verwijderd van deze locatie. Kom dichterbij (binnen 100m) om in te checken.`
        );
      }

      // Get username from localStorage
      const username = localStorage.getItem('student_username') || 'Anonymous';

      // Send check-in to backend
      const response = await fetch(`${API_URL}/trips/${tripId}/events/${event.id}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          lat: latitude,
          lng: longitude,
          accuracy,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Check-in mislukt');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.message || 'Kon niet inchecken. Controleer je GPS-toestemming.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="check-in-button">
      <Button
        onClick={handleCheckIn}
        loading={checking}
        variant={success ? 'success' : 'primary'}
        disabled={success}
        fullWidth
      >
        <Icon name={success ? 'check' : 'location'} size="medium" />
        {' '}
        {success ? 'Ingecheckt!' : 'Check In'}
      </Button>

      {error && (
        <div className="check-in-button__error">
          <Icon name="warning" size="small" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="check-in-button__success">
          <Icon name="check" size="small" />
          <span>Je bent succesvol ingecheckt bij deze locatie!</span>
        </div>
      )}
    </div>
  );
}
