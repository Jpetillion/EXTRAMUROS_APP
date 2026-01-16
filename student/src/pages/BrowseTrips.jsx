import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { saveTrip } from '../utils/storage.js';
import './BrowseTrips.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function BrowseTrips() {
  const navigate = useNavigate();
  const { selectedClass, userEmail } = useAuth();
  const { isTripDownloaded, refreshTrips } = useTripContext();
  const { success, error: showError } = useToast();

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

      if (response.status === 404) {
        setError('Your class was not found. Please log out and log in again to select your class.');
        setAvailableTrips([]);
        return;
      }

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
            console.log(`Fetching image for event ${event.id}...`);
            const imgResponse = await fetch(`${API_URL}/api/trips/${trip.id}/events/${event.id}/image`);
            console.log(`Image response status: ${imgResponse.status}, ok: ${imgResponse.ok}`);
            console.log(`Image Content-Type: ${imgResponse.headers.get('Content-Type')}`);
            console.log(`Image Content-Length: ${imgResponse.headers.get('Content-Length')}`);

            if (imgResponse.ok && imgResponse.status === 200) {
              const blob = await imgResponse.blob();
              console.log(`Image blob size: ${blob.size} bytes, type: ${blob.type}`);

              // Only add if we got actual data
              if (blob.size > 0) {
                const base64 = await blobToBase64(blob);
                console.log(`Image base64 length: ${base64.length} chars`);
                console.log(`Image base64 preview: ${base64.substring(0, 100)}`);
                eventWithMedia.imageBase64 = base64;
                eventWithMedia.imageMimeType = blob.type;
                console.log(`✓ Downloaded image for event ${event.id}: ${blob.size} bytes`);
              } else {
                console.warn(`Image blob is empty for event ${event.id}`);
              }
            } else {
              console.log(`Image not available for event ${event.id}`);
            }
          } catch (err) {
            console.error('Failed to download image for event:', event.id, err);
          }

          // Always try to download audio (backend will return 404 if not present)
          try {
            console.log(`Fetching audio for event ${event.id}...`);
            const audioResponse = await fetch(`${API_URL}/api/trips/${trip.id}/events/${event.id}/audio`);
            console.log(`Audio response status: ${audioResponse.status}, ok: ${audioResponse.ok}`);
            const contentLength = audioResponse.headers.get('Content-Length');
            console.log(`Audio Content-Length: ${contentLength}`);

            if (audioResponse.ok && audioResponse.status === 200) {
              // Check if file is too large (over 10MB)
              if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
                console.warn(`Audio file is too large (${Math.round(contentLength / 1024 / 1024)}MB), storing URL instead for event ${event.id}`);
                // Store the server URL instead of downloading the file
                eventWithMedia.audioUrl = `${API_URL}/api/trips/${trip.id}/events/${event.id}/audio`;
                eventWithMedia.audioMimeType = audioResponse.headers.get('Content-Type') || 'audio/mpeg';
                console.log(`✓ Stored audio URL for event ${event.id} (will stream from server)`);
              } else {
                const blob = await audioResponse.blob();
                console.log(`Audio blob size: ${blob.size} bytes, type: ${blob.type}`);

                // Only add if we got actual data
                if (blob.size > 0) {
                  const base64 = await blobToBase64(blob);
                  console.log(`Audio base64 length: ${base64.length} chars`);
                  eventWithMedia.audioBase64 = base64;
                  eventWithMedia.audioMimeType = blob.type;
                  console.log(`✓ Downloaded audio for event ${event.id}: ${blob.size} bytes`);
                } else {
                  console.warn(`Audio blob is empty for event ${event.id}`);
                }
              }
            } else {
              console.log(`Audio not available for event ${event.id}`);
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

      console.log('=== TRIP DOWNLOAD SUMMARY ===');
      console.log('Trip ID:', tripToSave.id);
      console.log('Total events:', eventsWithMedia.length);
      console.log('Events with images:', eventsWithMedia.filter(e => e.imageBase64).length);
      console.log('Events with audio:', eventsWithMedia.filter(e => e.audioBase64).length);
      console.log('Events with video:', eventsWithMedia.filter(e => e.videoUrl || e.video_url).length);
      console.log('First event full data:', eventsWithMedia[0]);
      if (eventsWithMedia[0]?.imageBase64) {
        console.log('First event image preview:', eventsWithMedia[0].imageBase64.substring(0, 50));
      }
      if (eventsWithMedia[0]?.audioBase64) {
        console.log('First event audio preview:', eventsWithMedia[0].audioBase64.substring(0, 50));
      }
      console.log('=== END SUMMARY ===');

      await saveTrip(tripToSave);
      await refreshTrips();

      success('Trip downloaded successfully!');
    } catch (err) {
      console.error('Failed to download trip:', err);
      showError('Failed to download trip. Please try again.');
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
