import { useState } from 'react';
import { DownloadManager } from '../utils/download.js';
import { useTripContext } from '../context/TripContext.jsx';

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const { refreshTrips } = useTripContext();

  const downloadTrip = async (tripId) => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress({ completed: 0, total: 0, percentage: 0, message: 'Starting download...', step: 'init' });

    const manager = new DownloadManager();

    manager.onProgress = (progress) => {
      setDownloadProgress(progress);
    };

    manager.onComplete = async () => {
      setIsDownloading(false);
      setDownloadProgress(null);
      await refreshTrips();
    };

    manager.onError = (error) => {
      setIsDownloading(false);
      setDownloadError(error.message || 'Download failed');
      setDownloadProgress(null);
    };

    try {
      await manager.downloadTrip(tripId);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error.message || 'Download failed');
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const cancelDownload = () => {
    // This would require implementing abort controller in DownloadManager
    setIsDownloading(false);
    setDownloadProgress(null);
    setDownloadError(null);
  };

  return {
    downloadTrip,
    isDownloading,
    downloadProgress,
    downloadError,
    cancelDownload
  };
}
