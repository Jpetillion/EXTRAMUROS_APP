import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/organisms/Header.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { Badge } from '../components/atoms/Badge.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import ConfirmModal from '../components/molecules/ConfirmModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import { useOfflineContext } from '../context/OfflineContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { useConfirm } from '../hooks/useConfirm.js';
import { useStorage } from '../hooks/useStorage.js';
import { useSync } from '../hooks/useSync.js';
import { clearAllData, getStorageSize } from '../utils/storage.js';
import { formatBytes, formatDateTime } from '../utils/helpers.js';
import './Settings.css';

export function Settings() {
  const navigate = useNavigate();
  const { userEmail, selectedClass, logout } = useAuth();
  const { downloadedTrips, refreshTrips } = useTripContext();
  const { isOnline, isSyncing, lastSyncTime } = useOfflineContext();
  const { storageInfo, refresh: refreshStorage } = useStorage();
  const { sync } = useSync();
  const { success, error: showError, info } = useToast();
  const { confirm, confirmState, handleClose } = useConfirm();
  const [isClearing, setIsClearing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    refreshStorage();
  }, [downloadedTrips]);

  // Capture the beforeinstallprompt event
  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstalled(true);
      success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [success]);

  const handleSync = async () => {
    if (!isOnline) {
      showError('You need to be online to sync.');
      return;
    }

    try {
      await sync();
      success('Sync completed successfully!');
    } catch (error) {
      showError('Sync failed. Please try again.');
    }
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Clear All Data',
      message: 'Are you sure you want to delete all downloaded trips and data? This cannot be undone.',
      confirmText: 'Delete All',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      setIsClearing(true);
      await clearAllData();
      await refreshTrips();
      await refreshStorage();
      success('All data cleared successfully!');
    } catch (error) {
      showError('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleInstallApp = async () => {
    if (isInstalled) {
      info('App is already installed!');
      return;
    }

    if (!deferredPrompt) {
      // Provide platform-specific instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        info('To install on iOS: Tap the Share button and select "Add to Home Screen".');
      } else {
        info('To install this app, look for "Install" or "Add to Home Screen" in your browser menu.');
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      success('Installing app...');
    } else {
      info('Installation cancelled.');
    }

    // Clear the deferredPrompt for next time
    setDeferredPrompt(null);
  };

  const handleChangeClass = async () => {
    const confirmed = await confirm({
      title: 'Change Class',
      message: 'Are you sure you want to change your class? You will need to select a new class.',
      confirmText: 'Change Class',
      variant: 'primary',
    });

    if (!confirmed) return;

    logout();
    navigate('/login');
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      confirmText: 'Log Out',
      variant: 'primary',
    });

    if (!confirmed) return;

    logout();
    navigate('/login');
  };

  return (
    <div className="settings">
      <Header title="Settings" showBack={true} />

      <div className="settings__container">
        <section className="settings__section">
          <h3 className="settings__section-title">Account</h3>
          <div className="settings__card">
            <div className="settings__row">
              <span className="settings__label">Email</span>
              <span className="settings__value">{userEmail}</span>
            </div>

            <div className="settings__row">
              <span className="settings__label">Class</span>
              <Badge variant="primary">{selectedClass?.name || 'Unknown'}</Badge>
            </div>

            <div className="settings__actions">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleChangeClass}
              >
                <Icon name="users" size="medium" />
                {' '}
                Change Class
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={handleLogout}
              >
                <Icon name="logout" size="medium" />
                {' '}
                Log Out
              </Button>
            </div>
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title">Connection Status</h3>
          <div className="settings__card">
            <div className="settings__row">
              <span className="settings__label">Status</span>
              <Badge variant={isOnline ? 'online' : 'offline'}>
                <Icon name={isOnline ? 'online' : 'offline'} size="small" />
                {' '}
                {isOnline ? 'Online' : 'Offline'}
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
              >
                <Icon name="sync" size="medium" />
                {' '}
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
              >
                <Icon name="sync" size="medium" />
                {' '}
                Refresh Storage Info
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={handleClearAll}
                disabled={isClearing || downloadedTrips.length === 0}
              >
                <Icon name="delete" size="medium" />
                {' '}
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
                disabled={isInstalled}
              >
                <Icon name={isInstalled ? "check" : "download"} size="medium" />
                {' '}
                {isInstalled ? 'App Installed' : 'Install App'}
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/')}
              >
                <Icon name="home" size="medium" />
                {' '}
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleClose}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />
    </div>
  );
}
