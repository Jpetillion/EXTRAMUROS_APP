import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { saveTrip } from '../utils/storage.js';
import './BrowseTrips.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function BrowseTrips() {
  const navigate = useNavigate();
  const { selectedClass, userEmail } = useAuth();
  const { isTripDownloaded, refreshTrips } = useTripContext();

  const [availableTrips, setAvailableTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedClass) {
      fetchAvailableTrips();
    }
  }, [selectedClass]);

  const fetchAvailableTrips = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/classes/${selectedClass.id}/trips?published=true`);

      if (!response.ok) {
        throw new Error('Failed to load trips');
      }

      const data = await response.json();
      setAvailableTrips(data);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      setError('Failed to load available trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTrip = async (trip) => {
    try {
      setDownloading(prev => ({ ...prev, [trip.id]: true }));

      // Fetch full trip details with events
      const response = await fetch(`${API_URL}/api/trips/${trip.id}`);
      if (!response.ok) throw new Error('Failed to fetch trip details');

      const tripData = await response.json();

      // Fetch events for the trip
      const eventsResponse = await fetch(`${API_URL}/api/trips/${trip.id}/events`);
      if (!eventsResponse.ok) throw new Error('Failed to fetch trip events');

      const events = await eventsResponse.json();

      // Fetch teachers for the trip (public endpoint)
      const teachersResponse = await fetch(`${API_URL}/api/trips/${trip.id}/teachers/public`);
      let teachers = [];
      if (teachersResponse.ok) {
        teachers = await teachersResponse.json();
      }

      // Download and convert media blobs to base64
      const eventsWithMedia = await Promise.all(
        events.map(async (event) => {
          const eventWithMedia = { ...event };

          // Always try to download image (backend will return 404 if not present)
          try {
            const imgResponse = await fetch(`${API_URL}/api/trips/${trip.id}/events/${event.id}/image`);
            if (imgResponse.ok && imgResponse.status === 200) {
              const blob = await imgResponse.blob();
              // Only add if we got actual data
              if (blob.size > 0) {
                const base64 = await blobToBase64(blob);
                eventWithMedia.imageBase64 = base64;
                eventWithMedia.imageMimeType = blob.type;
                console.log(`Downloaded image for event ${event.id}: ${blob.size} bytes`);
              }
            }
          } catch (err) {
            console.error('Failed to download image for event:', event.id, err);
          }

          // Always try to download audio (backend will return 404 if not present)
          try {
            const audioResponse = await fetch(`${API_URL}/api/trips/${trip.id}/events/${event.id}/audio`);
            if (audioResponse.ok && audioResponse.status === 200) {
              const blob = await audioResponse.blob();
              // Only add if we got actual data
              if (blob.size > 0) {
                const base64 = await blobToBase64(blob);
                eventWithMedia.audioBase64 = base64;
                eventWithMedia.audioMimeType = blob.type;
                console.log(`Downloaded audio for event ${event.id}: ${blob.size} bytes`);
              }
            }
          } catch (err) {
            console.error('Failed to download audio for event:', event.id, err);
          }

          return eventWithMedia;
        })
      );

      // Save trip with events, teachers, and media to IndexedDB
      const tripToSave = {
        ...tripData,
        events: eventsWithMedia,
        teachers: teachers,
        downloadedAt: Date.now(),
        studentEmail: userEmail,
        classId: selectedClass.id
      };

      await saveTrip(tripToSave);
      await refreshTrips();

      alert('Trip downloaded successfully!');
    } catch (err) {
      console.error('Failed to download trip:', err);
      alert('Failed to download trip. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [trip.id]: false }));
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (loading) {
    return (
      <div className="browse-trips">
        <Header title="Browse Trips" showBack={true} />
        <div className="browse-trips__loading">
          <Icon name="spinner" size="large" />
          <p>Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-trips">
      <Header title="Browse Trips" showBack={true} />

      <div className="browse-trips__container">
        {selectedClass && (
          <div className="browse-trips__class-badge">
            <Badge variant="primary">
              <Icon name="users" size="small" />
              {' '}
              {selectedClass.name}
            </Badge>
          </div>
        )}

        {error && (
          <div className="browse-trips__error">
            <Icon name="warning" size="medium" />
            <p>{error}</p>
            <Button variant="secondary" onClick={fetchAvailableTrips}>
              Try Again
            </Button>
          </div>
        )}

        {!error && availableTrips.length === 0 && (
          <div className="browse-trips__empty">
            <Icon name="map" size="xlarge" color="var(--color-gray-400)" />
            <h3>No Trips Available</h3>
            <p>There are no published trips assigned to your class yet.</p>
          </div>
        )}

        {!error && availableTrips.length > 0 && (
          <div className="browse-trips__list">
            {availableTrips.map((trip) => {
              const isDownloaded = isTripDownloaded(trip.id);
              const isDownloading = downloading[trip.id];

              return (
                <div key={trip.id} className="browse-trips__card">
                  {trip.coverImageUrl && (
                    <div className="browse-trips__card-image">
                      <img src={trip.coverImageUrl} alt={trip.title} />
                    </div>
                  )}

                  <div className="browse-trips__card-content">
                    <h3 className="browse-trips__card-title">{trip.title}</h3>

                    {trip.description && (
                      <p className="browse-trips__card-description">
                        {trip.description}
                      </p>
                    )}

                    <div className="browse-trips__card-footer">
                      {isDownloaded ? (
                        <Badge variant="success">
                          <Icon name="check" size="small" />
                          {' '}
                          Downloaded
                        </Badge>
                      ) : (
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleDownloadTrip(trip)}
                          disabled={isDownloading}
                        >
                          <Icon name="download" size="small" />
                          {' '}
                          {isDownloading ? 'Downloading...' : 'Download'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
