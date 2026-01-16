import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapViewer.css';

// Fix for default marker icon issue with webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export function MapViewer({ lat, lng, title, address, zoom = 15 }) {
  // Validate coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return (
      <div className="map-viewer map-viewer--error">
        <p>Location coordinates not available</p>
      </div>
    );
  }

  const position = [parseFloat(lat), parseFloat(lng)];

  return (
    <div className="map-viewer">
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        className="map-viewer__container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          {(title || address) && (
            <Popup>
              {title && <strong>{title}</strong>}
              {title && address && <br />}
              {address}
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}
