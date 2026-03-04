import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Spinner from '../atoms/Spinner';
import styles from './CheckInMap.module.css';

// Fix for default marker icons in React-Leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom student marker icon (blue)
const studentIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit map bounds to markers
function FitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = positions.map(p => [p.lat, p.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);

  return null;
}

const POLL_INTERVAL = 30000; // 30 seconds

const CheckInMap = ({ tripId }) => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchCheckIns();
    intervalRef.current = setInterval(fetchCheckIns, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [tripId]);

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/trips/${tripId}/current-locations?maxAge=300`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student locations');
      }

      const data = await response.json();
      console.log('📍 Received location data from API:', data);
      if (data && data.length > 0) {
        console.log('📍 First location object:', data[0]);
        console.log('📍 Username field:', data[0].student_username);
      }
      setCheckIns(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching student locations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      console.warn('No timestamp provided');
      return 'Unknown';
    }

    try {
      console.log('Formatting timestamp:', timestamp, 'Type:', typeof timestamp);

      const date = new Date(timestamp * 1000);
      console.log('Converted to date:', date, 'Valid:', !isNaN(date.getTime()));

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid timestamp:', timestamp);
        return `Invalid (${timestamp})`;
      }

      // Manual formatting for maximum compatibility
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return `Error (${timestamp})`;
    }
  };

  // Default center (Brussels, Belgium)
  const defaultCenter = [50.8503, 4.3517];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
        <p>Loading check-ins...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error loading check-ins: {error}</p>
        <button onClick={fetchCheckIns} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (checkIns.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>No students currently viewing this trip.</p>
        <p className={styles.hint}>
          Student locations are tracked automatically when they open the trip in the mobile app.
        </p>
      </div>
    );
  }

  // Get unique positions for markers
  const positions = checkIns.map(location => ({
    lat: location.lat,
    lng: location.lng,
    username: location.studentUsername || 'Unknown',  // camelCase from Turso!
    timestamp: location.lastUpdated,                   // camelCase from Turso!
    accuracy: location.accuracy
  }));

  console.log('CheckInMap - Positions:', positions);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3>
            Current Student Locations ({checkIns.length})
            <span className={styles.liveBadge}>● Live</span>
          </h3>
          {lastRefresh && (
            <p className={styles.lastRefresh}>
              Bijgewerkt: {lastRefresh.getHours().toString().padStart(2,'0')}:{lastRefresh.getMinutes().toString().padStart(2,'0')}:{lastRefresh.getSeconds().toString().padStart(2,'0')}
            </p>
          )}
        </div>
        <button onClick={fetchCheckIns} className={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      <div className={styles.mapContainer}>
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={positions} />

          {positions.map((pos, index) => (
            <Marker
              key={index}
              position={[pos.lat, pos.lng]}
              icon={studentIcon}
            >
              <Popup>
                <div className={styles.popup}>
                  <strong>{pos.username || 'Unknown Student'}</strong>
                  <p className={styles.popupTime}>Last seen: {formatTimestamp(pos.timestamp)}</p>
                  {pos.accuracy && (
                    <p className={styles.popupAccuracy}>
                      Accuracy: ±{Math.round(pos.accuracy)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className={styles.checkInList}>
        <h4>Active Students</h4>
        <div className={styles.list}>
          {checkIns.slice(0, 10).map((location, index) => (
            <div key={index} className={styles.checkInItem}>
              <div className={styles.checkInUser}>
                <strong>{location.studentUsername || 'Unknown Student'}</strong>
              </div>
              <div className={styles.checkInDetails}>
                <span className={styles.checkInTime}>
                  Last seen: {formatTimestamp(location.lastUpdated)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckInMap;
