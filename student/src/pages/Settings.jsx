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
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { clearAllData, getStorageSize } from '../utils/storage.js';
import { formatBytes, formatDateTime } from '../utils/helpers.js';
import './Settings.css';

export function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { downloadedTrips, refreshTrips } = useTripContext();
  const { isOnline, isSyncing, lastSyncTime } = useOfflineContext();
  const { storageInfo, refresh: refreshStorage } = useStorage();
  const { sync } = useSync();
  const { success, error: showError, info } = useToast();
  const { confirm, confirmState, handleClose } = useConfirm();
  const [isClearing, setIsClearing] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  const username = localStorage.getItem('student_username') || 'Anonymous';

  useEffect(() => {
    refreshStorage();
  }, [downloadedTrips]);

  const handleSync = async () => {
    if (!isOnline) {
      showError('Je moet online zijn om te synchroniseren.');
      return;
    }

    try {
      await sync();
      success('Synchronisatie succesvol voltooid!');
    } catch (error) {
      showError('Synchronisatie mislukt. Probeer het opnieuw.');
    }
  };

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Alle Gegevens Wissen',
      message: 'Weet je zeker dat je alle gedownloade uitstappen en gegevens wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
      confirmText: 'Alles Verwijderen',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      setIsClearing(true);
      await clearAllData();
      await refreshTrips();
      await refreshStorage();
      success('Alle gegevens succesvol gewist!');
    } catch (error) {
      showError('Kon gegevens niet wissen. Probeer het opnieuw.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleInstallApp = async () => {
    if (isInstalled) {
      info('App is al geïnstalleerd!');
      return;
    }

    const result = await installApp();

    if (!result.success) {
      if (result.error === 'NO_PROMPT') {
        // Provide platform-specific instructions
        if (result.isIOS) {
          info('Om te installeren op iOS: Tik op de Deel-knop en selecteer "Zet op beginscherm".');
        } else {
          info('Om deze app te installeren, zoek naar "Installeren" of "Zet op startscherm" in je browser menu.');
        }
      } else if (result.outcome === 'dismissed') {
        info('Installatie geannuleerd.');
      } else {
        showError('Installatie mislukt. Probeer het opnieuw.');
      }
    } else {
      success('App succesvol geïnstalleerd!');
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Uitloggen',
      message: 'Weet je zeker dat je wilt uitloggen?',
      confirmText: 'Uitloggen',
      variant: 'primary',
    });

    if (!confirmed) return;

    // Clear username
    localStorage.removeItem('student_username');
    logout();
    navigate('/');
  };

  return (
    <div className="settings">
      <Header title="Instellingen" showBack={true} />

      <div className="settings__container">
        <section className="settings__section">
          <h3 className="settings__section-title">Account</h3>
          <div className="settings__card">
            <div className="settings__row">
              <span className="settings__label">Gebruikersnaam</span>
              <span className="settings__value">{username}</span>
            </div>

            <div className="settings__actions">
              <Button
                variant="danger"
                fullWidth
                onClick={handleLogout}
              >
                <Icon name="logout" size="medium" />
                {' '}
                Uitloggen
              </Button>
            </div>
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title">Verbindingsstatus</h3>
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
                <span className="settings__label">Laatst Gesynchroniseerd</span>
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
                {isSyncing ? 'Synchroniseren...' : 'Nu Synchroniseren'}
              </Button>
            </div>
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title">Opslag</h3>
          <div className="settings__card">
            <div className="settings__row">
              <span className="settings__label">Gedownloade Uitstappen</span>
              <Badge variant="info">{downloadedTrips.length}</Badge>
            </div>

            {storageInfo && (
              <>
                <div className="settings__row">
                  <span className="settings__label">Opslag Gebruikt</span>
                  <span className="settings__value">
                    {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
                  </span>
                </div>

                <div className="settings__row">
                  <span className="settings__label">Gebruik</span>
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
                Opslaginfo Vernieuwen
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={handleClearAll}
                disabled={isClearing || downloadedTrips.length === 0}
              >
                <Icon name="delete" size="medium" />
                {' '}
                {isClearing ? 'Bezig met wissen...' : 'Alle Gegevens Wissen'}
              </Button>
            </div>
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title">App</h3>
          <div className="settings__card">
            <div className="settings__row">
              <span className="settings__label">Versie</span>
              <span className="settings__value">1.0.0</span>
            </div>

            <div className="settings__actions">
              <Button
                variant={isInstallable ? "primary" : "secondary"}
                fullWidth
                onClick={handleInstallApp}
                disabled={isInstalled}
              >
                <Icon name={isInstalled ? "check" : "download"} size="medium" />
                {' '}
                {isInstalled ? 'App Geïnstalleerd' : (isInstallable ? 'App Nu Installeren' : 'App Installeren')}
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/')}
              >
                <Icon name="home" size="medium" />
                {' '}
                Terug naar Home
              </Button>
            </div>
          </div>
        </section>

        <section className="settings__section">
          <h3 className="settings__section-title">Over</h3>
          <div className="settings__card">
            <p className="settings__about">
              Extra Muros is een offline-first educatieve uitstap begeleider app.
              Download uitstappen en krijg toegang tot alle content, zelfs zonder internetverbinding.
            </p>
            <p className="settings__about settings__about--small">
              Gemaakt met React en IndexedDB
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
