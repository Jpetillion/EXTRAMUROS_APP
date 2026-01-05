import { api } from './api.js';
import { getAllProgress, saveProgress } from './storage.js';

export class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.onSyncStart = null;
    this.onSyncComplete = null;
    this.onSyncError = null;
  }

  async syncProgress() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('Cannot sync while offline');
      return;
    }

    try {
      this.isSyncing = true;

      if (this.onSyncStart) {
        this.onSyncStart();
      }

      // Get all local progress
      const localProgress = await getAllProgress();

      if (localProgress.length === 0) {
        console.log('No progress to sync');
        this.isSyncing = false;
        return;
      }

      // Send progress to server
      const syncData = localProgress.map(p => ({
        contentId: p.contentId,
        completed: p.completed,
        progress: p.progress,
        completedAt: p.completedAt,
        updatedAt: p.updatedAt
      }));

      await api.syncProgress({ progress: syncData });

      console.log(`Successfully synced ${localProgress.length} progress items`);

      if (this.onSyncComplete) {
        this.onSyncComplete(localProgress.length);
      }
    } catch (error) {
      console.error('Sync failed:', error);

      if (this.onSyncError) {
        this.onSyncError(error);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  async fetchServerProgress() {
    if (!navigator.onLine) {
      throw new Error('Cannot fetch progress while offline');
    }

    try {
      const response = await api.getProgress();
      const serverProgress = response.data;

      // Merge with local progress
      for (const progress of serverProgress) {
        await saveProgress(progress);
      }

      return serverProgress;
    } catch (error) {
      console.error('Failed to fetch server progress:', error);
      throw error;
    }
  }

  startAutoSync(intervalMs = 300000) {
    // Auto-sync every 5 minutes by default
    return setInterval(() => {
      if (navigator.onLine) {
        this.syncProgress();
      }
    }, intervalMs);
  }

  stopAutoSync(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
}

export async function setupBackgroundSync() {
  if ('sync' in window.registration) {
    try {
      await window.registration.sync.register('sync-progress');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}

export function listenToOnlineStatus(onOnline, onOffline) {
  window.addEventListener('online', () => {
    console.log('Connection restored');
    if (onOnline) onOnline();
  });

  window.addEventListener('offline', () => {
    console.log('Connection lost');
    if (onOffline) onOffline();
  });
}
