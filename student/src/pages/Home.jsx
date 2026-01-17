import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { useOfflineContext } from '../context/OfflineContext.jsx';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Home() {
  const navigate = useNavigate();
  const { selectedClass, changeClass } = useAuth();
  const { downloadedTrips } = useTripContext();
  const { isOnline, isSyncing } = useOfflineContext();

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await fetch(`${API_URL}/classes`);

      if (!response.ok) {
        throw new Error('Failed to load classes');
      }

      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Kon klassen niet laden');
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSelectClass = (classData) => {
    changeClass(classData);
  };

  // Show class selection if no class is selected
  if (!selectedClass) {
    return (
      <div className="home">
        <div className="home__header">
          <div className="home__header-container">
            <div className="home__logo">
              <div className="home__logo-icon">
                <Icon name="backpack" size="medium" color="white" />
              </div>
              <h1>Extra Muros</h1>
            </div>
          </div>
        </div>

        <div className="home__container">
          <div className="home__class-selection">
            <div className="home__class-selection-header">
              <Icon name="users" size="xlarge" color="var(--color-primary)" />
              <h2>Selecteer je klas</h2>
              <p>Kies je klas om beschikbare uitstappen te bekijken</p>
            </div>

            {loadingClasses ? (
              <div className="home__loading">
                <Icon name="spinner" size="large" />
                <p>Klassen laden...</p>
              </div>
            ) : error ? (
              <div className="home__error">
                <Icon name="warning" size="medium" />
                <p>{error}</p>
                <Button variant="secondary" onClick={fetchClasses}>
                  Opnieuw proberen
                </Button>
              </div>
            ) : classes.length === 0 ? (
              <div className="home__empty">
                <Icon name="info" size="medium" />
                <p>Geen klassen beschikbaar</p>
              </div>
            ) : (
              <div className="home__class-list">
                {classes.map((classData) => (
                  <button
                    key={classData.id}
                    className="home__class-card"
                    onClick={() => handleSelectClass(classData)}
                  >
                    <div className="home__class-card-icon">
                      <Icon name="users" size="large" color="var(--color-primary)" />
                    </div>
                    <div className="home__class-card-content">
                      <h3>{classData.name}</h3>
                      {classData.schoolYear && (
                        <p className="home__class-card-year">{classData.schoolYear}</p>
                      )}
                    </div>
                    <Icon name="chevron-right" size="medium" color="var(--color-gray-400)" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show main home content after class is selected
  return (
    <div className="home">
      {/* Custom header */}
      <div className="home__header">
        <div className="home__header-container">
          <div className="home__logo">
            <div className="home__logo-icon">
              <Icon name="backpack" size="medium" color="white" />
            </div>
            <h1>Extra Muros</h1>
          </div>
          <div className="home__header-right">
            {isSyncing && (
              <Badge variant="info" size="small">
                <Icon name="sync" size="small" />
                {' '}
                Syncing
              </Badge>
            )}
            {!isOnline && !isSyncing && (
              <Badge variant="offline" size="small">
                <Icon name="offline" size="small" />
                {' '}
                Offline
              </Badge>
            )}
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate('/settings')}
            >
              <Icon name="settings" size="medium" />
            </Button>
          </div>
        </div>
      </div>

      <div className="home__container">
        {/* Show selected class */}
        <div className="home__selected-class">
          <Badge variant="primary" size="medium">
            <Icon name="users" size="small" />
            {' '}
            {selectedClass.name}
          </Badge>
        </div>

        <div className="home__hero">
          <h2 className="home__hero-title">Welkom terug!</h2>
          <p className="home__hero-description">
            Ontdek en download educatieve uitstappen. Alle content is beschikbaar, zelfs zonder internetverbinding.
          </p>
        </div>

        <div className="home__stats">
          <div className="home__stat-card">
            <div className="home__stat-icon">
              <Icon name="map" size="large" color="var(--color-primary)" />
            </div>
            <div className="home__stat-info">
              <div className="home__stat-value">{downloadedTrips.length}</div>
              <div className="home__stat-label">Gedownloade uitstappen</div>
            </div>
          </div>
          <div className="home__stat-card">
            <div className="home__stat-icon">
              <Icon name={isOnline ? 'online' : 'offline'} size="large" color={isOnline ? 'var(--color-success)' : 'var(--color-gray-400)'} />
            </div>
            <div className="home__stat-info">
              <div className="home__stat-value">{isOnline ? 'Online' : 'Offline'}</div>
              <div className="home__stat-label">Status</div>
            </div>
          </div>
        </div>

        <div className="home__actions">
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={() => navigate('/trips')}
          >
            <Icon name="map" size="medium" />
            {' '}
            Mijn Uitstappen
          </Button>

          <Button
            variant="secondary"
            size="large"
            fullWidth
            onClick={() => navigate('/browse')}
            disabled={!isOnline}
          >
            <Icon name="download" size="medium" />
            {' '}
            Ontdek & Download
          </Button>
        </div>

      </div>
    </div>
  );
}
