import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { ModuleList } from '../components/organisms/ModuleList.jsx';
import { Spinner } from '../components/atoms/Spinner.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import { MapViewer } from '../components/molecules/MapViewer.jsx';
import { getTrip, getModulesByTrip, getAllProgress } from '../utils/storage.js';
import { formatDate } from '../utils/helpers.js';
import './TripView.css';

// Helper function to convert YouTube URLs to embed format
function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  // Already an embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Convert watch URL to embed URL
  // Supports: youtube.com/watch?v=ID, youtu.be/ID
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }

  // Return original if can't parse
  return url;
}

export function TripView() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedContents, setCompletedContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
    try {
      setIsLoading(true);

      // Use tripId directly (it's a UUID, not a number)
      const tripData = await getTrip(tripId);

      if (!tripData) {
        setTrip(null);
        setIsLoading(false);
        return;
      }

      // For the new event-based structure, events are stored directly on the trip
      setTrip(tripData);

      console.log('=== TRIPVIEW LOADED DATA ===');
      console.log('Loaded trip data:', tripData);
      console.log('Trip has events:', tripData.events?.length);
      if (tripData.events && tripData.events.length > 0) {
        const firstEvent = tripData.events[0];
        console.log('First event:', firstEvent);
        console.log('First event has imageBase64:', !!firstEvent.imageBase64);
        console.log('First event imageBase64 length:', firstEvent.imageBase64?.length);
        console.log('First event imageBase64 preview:', firstEvent.imageBase64?.substring(0, 100));
        console.log('First event has audioBase64:', !!firstEvent.audioBase64);
        console.log('First event audioBase64 length:', firstEvent.audioBase64?.length);
        console.log('First event has videoUrl:', !!firstEvent.videoUrl);
        console.log('First event textContent:', firstEvent.textContent);
        console.log('First event address:', firstEvent.address);
        console.log('First event category:', firstEvent.category);
        console.log('First event durationMinutes:', firstEvent.durationMinutes);
      }
      console.log('=== END TRIPVIEW DATA ===');

      // Check if this is old module-based data or new event-based data
      if (tripData.events && Array.isArray(tripData.events)) {
        // New event-based structure - convert events to modules format for display
        setModules(tripData.events.map((event, index) => ({
          id: event.id,
          tripId: tripData.id,
          title: event.title,
          orderIndex: index,
          contents: [{
            id: event.id,
            moduleId: event.id,
            type: event.category || 'text',
            title: event.title,
            data: event
          }]
        })));
      } else {
        // Old module-based structure
        const modulesData = await getModulesByTrip(tripId);
        setModules(modulesData);
      }

      const progressData = await getAllProgress();
      setCompletedContents(
        progressData.filter(p => p.completed).map(p => p.contentId)
      );
    } catch (error) {
      console.error('Failed to load trip:', error);
      setTrip(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleClick = (moduleId, contentId) => {
    navigate(`/content/${contentId}`);
  };

  if (isLoading) {
    return (
      <div className="trip-view">
        <Header title="Loading..." showBack={true} />
        <div className="trip-view__loading">
          <Spinner size="large" variant="primary" />
          <p>Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-view">
        <Header title="Trip Not Found" showBack={true} />
        <div className="trip-view__error">
          <p>Trip not found. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-view">
      <Header title={trip.title} showBack={true} />

      <div className="trip-view__container">
        {trip.imageUrl && (
          <div className="trip-view__hero">
            <img src={trip.imageUrl} alt={trip.title} />
          </div>
        )}

        <div className="trip-view__header">
          <div className="trip-view__title-section">
            <h2 className="trip-view__title">{trip.title}</h2>
            <Badge variant="success" size="small">Downloaded</Badge>
          </div>

          {trip.description && (
            <p className="trip-view__description">{trip.description}</p>
          )}

          <div className="trip-view__meta">
            {trip.location && (
              <div className="trip-view__meta-item">
                <span className="trip-view__meta-icon">
                  <Icon name="location" size="small" color="var(--color-primary)" />
                </span>
                <span>{trip.location}</span>
              </div>
            )}
            {trip.date && (
              <div className="trip-view__meta-item">
                <span className="trip-view__meta-icon">
                  <Icon name="schedule" size="small" color="var(--color-primary)" />
                </span>
                <span>{formatDate(trip.date)}</span>
              </div>
            )}
            {trip.downloadedAt && (
              <div className="trip-view__meta-item">
                <span className="trip-view__meta-icon">
                  <Icon name="download" size="small" color="var(--color-success)" />
                </span>
                <span>Downloaded: {formatDate(trip.downloadedAt)}</span>
              </div>
            )}
          </div>

          {/* Teachers Section */}
          {trip.teachers && trip.teachers.length > 0 && (
            <div className="trip-view__teachers">
              <h3 className="trip-view__section-subtitle">
                <Icon name="users" size="small" color="var(--color-primary)" />
                {' '}
                Contact Information
              </h3>
              <div className="trip-view__teachers-list">
                {trip.teachers.map((teacher, index) => (
                  <div key={index} className="trip-view__teacher">
                    <strong className="trip-view__teacher-name">
                      {teacher.first_name || teacher.firstName} {teacher.last_name || teacher.lastName}
                    </strong>
                    <div className="trip-view__teacher-contacts">
                      {teacher.email && (
                        <a href={`mailto:${teacher.email}`} className="trip-view__teacher-contact">
                          <Icon name="email" size="small" />
                          {' '}
                          {teacher.email}
                        </a>
                      )}
                      {(teacher.phone_number || teacher.phoneNumber) && (
                        <a href={`tel:${teacher.phone_number || teacher.phoneNumber}`} className="trip-view__teacher-contact">
                          <Icon name="phone" size="small" />
                          {' '}
                          {teacher.phone_number || teacher.phoneNumber}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="trip-view__content">
          <h3 className="trip-view__section-title">
            {trip.events && trip.events.length > 0 ? 'Events' : 'Modules'}
          </h3>
          {trip.events && trip.events.length > 0 ? (
            <div className="trip-view__events">
              {trip.events.map((event, index) => (
                <div key={event.id} className="trip-view__event-card">
                  <div className="trip-view__event-number">{index + 1}</div>
                  <div className="trip-view__event-content">
                    {/* Header Section */}
                    <div className="trip-view__event-header">
                      <h4 className="trip-view__event-title">{event.title}</h4>
                      {event.category && (
                        <Badge variant="info" size="small">{event.category}</Badge>
                      )}
                    </div>

                    {/* Meta Information */}
                    {(event.address || event.durationMinutes) && (
                      <div className="trip-view__event-meta">
                        {event.address && (
                          <div className="trip-view__event-meta-item">
                            <Icon name="location" size="small" />
                            <span>{event.address}</span>
                          </div>
                        )}
                        {event.durationMinutes && (
                          <div className="trip-view__event-meta-item">
                            <Icon name="clock" size="small" />
                            <span>{event.durationMinutes} minuten</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description Text */}
                    {event.textContent && (
                      <p className="trip-view__event-text">{event.textContent}</p>
                    )}
                    {(event.lat && event.lng) && (
                      <MapViewer
                        lat={event.lat}
                        lng={event.lng}
                        title={event.title}
                        address={event.address}
                      />
                    )}
                    {event.imageBase64 && (
                      <img
                        src={event.imageBase64}
                        alt={event.title}
                        className="trip-view__event-image"
                      />
                    )}
                    {(event.audioBase64 || event.audioUrl) && (
                      <div className="trip-view__event-audio-wrapper">
                        <audio controls className="trip-view__event-audio">
                          <source src={event.audioBase64 || event.audioUrl} type={event.audioMimeType || 'audio/mpeg'} />
                        </audio>
                        {event.audioUrl && !event.audioBase64 && (
                          <p className="trip-view__audio-notice">
                            <Icon name="wifi" size="small" />
                            {' '}
                            Audio streaming heeft internetverbinding nodig
                          </p>
                        )}
                      </div>
                    )}
                    {(event.videoUrl || event.video_url) && (
                      <div className="trip-view__event-video">
                        <iframe
                          src={getYouTubeEmbedUrl(event.videoUrl || event.video_url)}
                          title={event.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : modules.length > 0 ? (
            <ModuleList
              modules={modules}
              onModuleClick={handleModuleClick}
              completedContents={completedContents}
            />
          ) : (
            <div className="trip-view__no-modules">
              <p>No content available for this trip.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
