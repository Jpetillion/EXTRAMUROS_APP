import { createContext, useContext, useState, useEffect } from 'react';
import { getAllTrips, deleteTrip as deleteStoredTrip } from '../utils/storage.js';

const TripContext = createContext();

export function TripProvider({ children }) {
  const [downloadedTrips, setDownloadedTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDownloadedTrips();
  }, []);

  const loadDownloadedTrips = async () => {
    try {
      setIsLoading(true);
      const trips = await getAllTrips();
      setDownloadedTrips(trips);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTrips = async () => {
    await loadDownloadedTrips();
  };

  const deleteTrip = async (tripId) => {
    try {
      await deleteStoredTrip(tripId);
      await refreshTrips();
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    }
  };

  const getTripById = (tripId) => {
    return downloadedTrips.find(trip => trip.id === tripId);
  };

  const isTripDownloaded = (tripId) => {
    return downloadedTrips.some(trip => trip.id === tripId);
  };

  const value = {
    downloadedTrips,
    isLoading,
    refreshTrips,
    deleteTrip,
    getTripById,
    isTripDownloaded
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within TripProvider');
  }
  return context;
}
