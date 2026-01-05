import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { ModuleList } from '../components/organisms/ModuleList.jsx';
import { Spinner } from '../components/atoms/Spinner.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { getTrip, getModulesByTrip, getAllProgress } from '../utils/storage.js';
import { formatDate } from '../utils/helpers.js';
import './TripView.css';

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

      const [tripData, modulesData, progressData] = await Promise.all([
        getTrip(parseInt(tripId)),
        getModulesByTrip(parseInt(tripId)),
        getAllProgress()
      ]);

      setTrip(tripData);
      setModules(modulesData);
      setCompletedContents(
        progressData.filter(p => p.completed).map(p => p.contentId)
      );
    } catch (error) {
      console.error('Failed to load trip:', error);
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
                <span className="trip-view__meta-icon">📍</span>
                <span>{trip.location}</span>
              </div>
            )}
            {trip.date && (
              <div className="trip-view__meta-item">
                <span className="trip-view__meta-icon">📅</span>
                <span>{formatDate(trip.date)}</span>
              </div>
            )}
            {trip.downloadedAt && (
              <div className="trip-view__meta-item">
                <span className="trip-view__meta-icon">⬇️</span>
                <span>Downloaded: {formatDate(trip.downloadedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="trip-view__content">
          <h3 className="trip-view__section-title">Modules</h3>
          {modules.length > 0 ? (
            <ModuleList
              modules={modules}
              onModuleClick={handleModuleClick}
              completedContents={completedContents}
            />
          ) : (
            <div className="trip-view__no-modules">
              <p>No modules available for this trip.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
