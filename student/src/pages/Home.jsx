import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms/Button.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { useOfflineContext } from '../context/OfflineContext.jsx';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const { downloadedTrips } = useTripContext();
  const { isOnline, isSyncing } = useOfflineContext();

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
