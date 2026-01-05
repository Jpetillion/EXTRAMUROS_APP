import { useOfflineContext } from '../context/OfflineContext.jsx';

export function useSync() {
  const { isSyncing, lastSyncTime, manualSync } = useOfflineContext();

  const sync = async () => {
    try {
      await manualSync();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  };

  return {
    sync,
    isSyncing,
    lastSyncTime
  };
}
