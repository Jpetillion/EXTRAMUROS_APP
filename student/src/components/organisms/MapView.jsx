import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function MapView({
  latitude,
  longitude,
  title,
  description,
  zoom = 15,
  height = 400
}) {
  const position = [latitude, longitude];

  useEffect(() => {
    // Force Leaflet to recalculate map size
    window.dispatchEvent(new Event('resize'));
  }, []);

  return (
    <div className="map-view" style={{ height: `${height}px` }}>
      <MapContainer
        center={position}
        zoom={zoom}
        className="map-view__container"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="map-view__popup">
              {title && <strong>{title}</strong>}
              {description && <p>{description}</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
