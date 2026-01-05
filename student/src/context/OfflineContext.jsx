import { createContext, useContext, useState, useEffect } from 'react';
import { SyncManager, listenToOnlineStatus } from '../utils/sync.js';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncManager] = useState(() => new SyncManager());

  useEffect(() => {
    // Set up sync manager callbacks
    syncManager.onSyncStart = () => {
      setIsSyncing(true);
    };

    syncManager.onSyncComplete = (itemCount) => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
      console.log(`Sync completed: ${itemCount} items`);
    };

    syncManager.onSyncError = (error) => {
      setIsSyncing(false);
      console.error('Sync error:', error);
    };

    // Listen to online/offline events
    listenToOnlineStatus(
      () => {
        setIsOnline(true);
        // Auto-sync when coming back online
        syncManager.syncProgress();
      },
      () => {
        setIsOnline(false);
      }
    );

    // Initial sync if online
    if (navigator.onLine) {
      syncManager.syncProgress();
    }

    // Start auto-sync (every 5 minutes)
    const intervalId = syncManager.startAutoSync(300000);

    return () => {
      syncManager.stopAutoSync(intervalId);
    };
  }, [syncManager]);

  const manualSync = async () => {
    if (isOnline) {
      await syncManager.syncProgress();
    }
  };

  const value = {
    isOnline,
    isSyncing,
    lastSyncTime,
    manualSync
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflineContext() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineContext must be used within OfflineProvider');
  }
  return context;
}
