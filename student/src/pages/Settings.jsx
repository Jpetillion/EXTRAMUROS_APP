import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { useOfflineContext } from '../context/OfflineContext.jsx';
import { useStorage } from '../hooks/useStorage.js';
import { useSync } from '../hooks/useSync.js';
import { clearAllData, getStorageSize } from '../utils/storage.js';
import { formatBytes, formatDateTime } from '../utils/helpers.js';
import './Settings.css';

export function Settings() {
  const navigate = useNavigate();
  const { downloadedTrips, refreshTrips } = useTripContext();
  const { isOnline, isSyncing, lastSyncTime } = useOfflineContext();
  const { storageInfo, refresh: refreshStorage } = useStorage();
  const { sync } = useSync();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    refreshStorage();
  }, [downloadedTrips]);

  const handleSync = async () => {
    if (!isOnline) {
      alert('You need to be online to sync.');
      return;
    }

    try {
      await sync();
      alert('Sync completed successfully!');
    } catch (error) {
      alert('Sync failed. Please try again.');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all downloaded trips and data? This cannot be undone.')) {
      return;
    }

    try {
      setIsClearing(true);
      await clearAllData();
      await refreshTrips();
      await refreshStorage();
      alert('All data cleared successfully!');
    } catch (error) {
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleInstallApp = () => {
    if ('BeforeInstallPromptEvent' in window) {
      alert('To install this app, use the "Add to Home Screen" option in your browser menu.');
    } else {
      alert('App installation is managed by your browser. Look for "Install" or "Add to Home Screen" in the menu.');
    }
  };

  return (
    <div className="settings">
      <Header title="Settings" showBack={true} />

      <div className="settings__container">
        <section className="settings__section">
          <h3 className="settings__section-title">Connection Status</h3>
          <div className="settings__card">
            <div className="settings__row">
              <span className="settings__label">Status</span>
              <Badge variant={isOnline ? 'online' : 'offline'}>
                {isOnline ? '🌐 Online' : '📵 Offline'}
              </Badge>
            </div>

            {lastSyncTime && (
              <div className="settings__row">
                <span className="settings__label">Last Sync</span>
                <span className="settings__value">
                  {formatDateTime(lastSyncTime)}
                </span>
              </div>
            )}

            <div className="settings__actions">
              <Button
                variant="primary"
                fullWidth
                onClick={handleSync}
                disabled={!isOnline || isSyncing}
                icon="🔄"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title">Storage</h3>
          <div className="settings__card">
            <div className="settings__row">
              <span className="settings__label">Downloaded Trips</span>
              <Badge variant="info">{downloadedTrips.length}</Badge>
            </div>

            {storageInfo && (
              <>
                <div className="settings__row">
                  <span className="settings__label">Storage Used</span>
                  <span className="settings__value">
                    {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
                  </span>
                </div>

                <div className="settings__row">
                  <span className="settings__label">Usage</span>
                  <span className="settings__value">
                    {storageInfo.percentUsed.toFixed(1)}%
                  </span>
                </div>
              </>
            )}

            <div className="settings__actions">
              <Button
                variant="secondary"
                fullWidth
                onClick={refreshStorage}
                icon="🔄"
              >
                Refresh Storage Info
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={handleClearAll}
                disabled={isClearing || downloadedTrips.length === 0}
                icon="🗑️"
              >
                {isClearing ? 'Clearing...' : 'Clear All Data'}
              </Button>
            </div>
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title">App</h3>
          <div className="settings__card">
            <div className="settings__row">
              <span className="settings__label">Version</span>
              <span className="settings__value">1.0.0</span>
            </div>

            <div className="settings__actions">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleInstallApp}
                icon="📱"
              >
                Install App
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/')}
                icon="🏠"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title">About</h3>
          <div className="settings__card">
            <p className="settings__about">
              Extra Muros is an offline-first educational trip companion app.
              Download trips and access all content even without an internet connection.
            </p>
            <p className="settings__about settings__about--small">
              Made with React and IndexedDB
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
