import { useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { useOfflineContext } from '../context/OfflineContext.jsx';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const { downloadedTrips } = useTripContext();
  const { isOnline } = useOfflineContext();

  return (
    <div className="home">
      <Header title="Extra Muros" />

      <div className="home__container">
        <div className="home__hero">
          <div className="home__icon">
            <Icon name="backpack" size="xlarge" color="var(--color-primary)" />
          </div>
          <h2 className="home__title">Welcome to Extra Muros</h2>
          <p className="home__description">
            Your offline-first companion for educational trips and adventures.
            Download trips and access all content even without an internet connection.
          </p>
        </div>

        <div className="home__stats">
          <div className="home__stat">
            <div className="home__stat-value">{downloadedTrips.length}</div>
            <div className="home__stat-label">Downloaded Trips</div>
          </div>
          <div className="home__stat">
            <Badge variant={isOnline ? 'online' : 'offline'}>
              <Icon name={isOnline ? 'online' : 'offline'} size="small" />
              {' '}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
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
            My Trips
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
            Browse & Download
          </Button>

          <Button
            variant="ghost"
            size="medium"
            fullWidth
            onClick={() => navigate('/settings')}
          >
            <Icon name="settings" size="medium" />
            {' '}
            Settings
          </Button>
        </div>

        <div className="home__features">
          <h3 className="home__features-title">Features</h3>
          <div className="home__feature-list">
            <div className="home__feature">
              <span className="home__feature-icon">
                <Icon name="offline" size="large" color="var(--color-primary)" />
              </span>
              <div className="home__feature-content">
                <h4>Offline First</h4>
                <p>Access all downloaded content without internet</p>
              </div>
            </div>

            <div className="home__feature">
              <span className="home__feature-icon">
                <Icon name="map" size="large" color="var(--color-primary)" />
              </span>
              <div className="home__feature-content">
                <h4>Interactive Maps</h4>
                <p>Explore locations with detailed maps</p>
              </div>
            </div>

            <div className="home__feature">
              <span className="home__feature-icon">
                <Icon name="audio" size="large" color="var(--color-primary)" />
              </span>
              <div className="home__feature-content">
                <h4>Rich Media</h4>
                <p>Text, images, audio, and interactive content</p>
              </div>
            </div>

            <div className="home__feature">
              <span className="home__feature-icon">
                <Icon name="sync" size="large" color="var(--color-primary)" />
              </span>
              <div className="home__feature-content">
                <h4>Auto Sync</h4>
                <p>Progress syncs automatically when online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
