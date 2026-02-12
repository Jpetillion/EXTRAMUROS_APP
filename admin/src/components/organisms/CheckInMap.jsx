import { useState, useEffect } from 'react';
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

const CheckInMap = ({ tripId }) => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCheckIns();
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

      const response = await fetch(`/api/trips/${tripId}/check-ins`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch check-ins');
      }

      const data = await response.json();
      setCheckIns(data);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('nl-NL', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
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
        <p>No check-ins yet for this trip.</p>
        <p className={styles.hint}>
          Students can check in via the mobile app when they're at event locations.
        </p>
      </div>
    );
  }

  // Get unique positions for markers
  const positions = checkIns.map(checkIn => ({
    lat: checkIn.check_in_lat || checkIn.checkInLat,
    lng: checkIn.check_in_lng || checkIn.checkInLng,
    username: checkIn.username || checkIn.student_username,
    eventTitle: checkIn.event_title || checkIn.eventTitle,
    timestamp: checkIn.check_in_timestamp || checkIn.checkInTimestamp,
    accuracy: checkIn.check_in_accuracy || checkIn.checkInAccuracy
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Student Check-Ins ({checkIns.length})</h3>
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
                  <strong>{pos.username}</strong>
                  <p className={styles.popupEvent}>{pos.eventTitle}</p>
                  <p className={styles.popupTime}>{formatTimestamp(pos.timestamp)}</p>
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
        <h4>Recent Check-Ins</h4>
        <div className={styles.list}>
          {checkIns.slice(0, 10).map((checkIn, index) => (
            <div key={index} className={styles.checkInItem}>
              <div className={styles.checkInUser}>
                <strong>{checkIn.username || checkIn.student_username}</strong>
              </div>
              <div className={styles.checkInDetails}>
                <span className={styles.checkInEvent}>
                  {checkIn.event_title || checkIn.eventTitle}
                </span>
                <span className={styles.checkInTime}>
                  {formatTimestamp(checkIn.check_in_timestamp || checkIn.checkInTimestamp)}
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
