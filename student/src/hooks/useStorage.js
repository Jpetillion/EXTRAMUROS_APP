import { useState, useEffect } from 'react';
import { getStorageSize } from '../utils/storage.js';

export function useStorage() {
  const [storageInfo, setStorageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      setIsLoading(true);
      const info = await getStorageSize();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to get storage info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await loadStorageInfo();
  };

  return {
    storageInfo,
    isLoading,
    refresh
  };
}
