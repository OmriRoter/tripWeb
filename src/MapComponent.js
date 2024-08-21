import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapComponent({ routeInfo }) {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} id="map">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {routeInfo.routes.map((route, idx) => (
        <Marker key={idx} position={route.position}>
          <Popup>
            <b>Day {idx + 1}</b><br />
            {route.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;
