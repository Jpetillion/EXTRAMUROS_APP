import { useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function useLocationTracking(tripId, username, enabled = true) {
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!enabled || !tripId || !username) {
      return;
    }

    let currentPosition = null;

    // Function to send location to server
    const sendLocation = async (position) => {
      try {
        const { latitude, longitude, accuracy } = position.coords;

        await fetch(`${API_URL}/trips/${tripId}/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            lat: latitude,
            lng: longitude,
            accuracy
          })
        });

        console.log('Location updated:', { lat: latitude, lng: longitude });
      } catch (error) {
        console.error('Failed to send location:', error);
      }
    };

    // Get initial position and set up continuous tracking
    if (navigator.geolocation) {
      // Watch position changes (for when user moves)
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          currentPosition = position;
          sendLocation(position);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: false, // Use false to save battery
          maximumAge: 30000, // Accept cached position up to 30 seconds old
          timeout: 27000
        }
      );

      // Also send location every 60 seconds even if position hasn't changed
      intervalRef.current = setInterval(() => {
        if (currentPosition) {
          sendLocation(currentPosition);
        } else {
          // Try to get position if we don't have one
          navigator.geolocation.getCurrentPosition(
            (position) => {
              currentPosition = position;
              sendLocation(position);
            },
            (error) => {
              console.error('Failed to get position:', error);
            },
            {
              enableHighAccuracy: false,
              maximumAge: 30000,
              timeout: 27000
            }
          );
        }
      }, 60000); // Every 60 seconds
    }

    // Cleanup function
    return () => {
      // Stop watching position
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Remove location from server when unmounting
      if (tripId && username) {
        fetch(`${API_URL}/trips/${tripId}/location/${encodeURIComponent(username)}`, {
          method: 'DELETE'
        }).catch(error => {
          console.error('Failed to remove location:', error);
        });
      }
    };
  }, [tripId, username, enabled]);
}
