import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onLocationSelect }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  return null;
}

function DraggableMarker({ position, onLocationSelect }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        onLocationSelect(lat, lng);
      }
    },
  };

  if (!position) return null;

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export function MapPicker({ value, onChange, center, zoom = 13 }) {
  const position = value?.lat && value?.lng ? [value.lat, value.lng] : null;
  const defaultCenter = center || [50.8503, 4.3517]; // Brussels, Belgium as default

  const handleLocationSelect = (lat, lng) => {
    if (onChange) {
      onChange({ lat, lng });
    }
  };

  return (
    <div className="map-picker">
      <MapContainer
        center={position || defaultCenter}
        zoom={zoom}
        style={{ height: '400px', width: '100%' }}
        className="map-picker__container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        <DraggableMarker position={position} onLocationSelect={handleLocationSelect} />
      </MapContainer>
      {position && (
        <div className="map-picker__coordinates">
          <span className="map-picker__coordinate">
            <strong>Lat:</strong> {position[0].toFixed(6)}
          </span>
          <span className="map-picker__coordinate">
            <strong>Lng:</strong> {position[1].toFixed(6)}
          </span>
        </div>
      )}
      <p className="map-picker__hint">
        Click on the map or drag the marker to select a location
      </p>
    </div>
  );
}
