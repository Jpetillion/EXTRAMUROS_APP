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
  const { downloadedTrips } = useTripContext();
  const { isOnline } = useOfflineContext();

  const [username, setUsername] = useState(
    localStorage.getItem('student_username') || ''
  );
  const [inputValue, setInputValue] = useState('');

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      localStorage.setItem('student_username', inputValue.trim());
      setUsername(inputValue.trim());
    }
  };

  // Show username prompt if no username is set
  if (!username) {
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
              <Icon name="user" size="xlarge" color="var(--color-primary)" />
              <h2>Welkom bij Extra Muros</h2>
              <p>Voer je naam in om te beginnen</p>
            </div>

            <form onSubmit={handleUsernameSubmit} className="home__username-form">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Je volledige naam..."
                className="home__username-input"
                autoFocus
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!inputValue.trim()}
                style={{ width: '100%' }}
              >
                Doorgaan
              </Button>
            </form>
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
            {!isOnline && (
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
        {/* Show username badge */}
        <div className="home__selected-class">
          <div className="home__class-badge">
            <div className="home__class-badge-icon">
              <Icon name="user" size="medium" color="white" />
            </div>
            <span className="home__class-badge-text">{username}</span>
          </div>
        </div>

        <div className="home__hero">
          <h2 className="home__hero-title">Welkom terug, {username.split(' ')[0]}!</h2>
          <p className="home__hero-description">
            Bekijk en download educatieve uitstappen. Alle content is beschikbaar, zelfs zonder internetverbinding.
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
        </div>

      </div>
    </div>
  );
}
