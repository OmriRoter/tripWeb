import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function MapComponent({ routeInfo, country }) {
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(5);

  useEffect(() => {
    const fetchCountryCoordinates = async () => {
      if (!country) return;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?country=${country}&format=json`);
        const data = await response.json();
        if (data && data.length > 0) {
          setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setMapZoom(5);  // Adjust zoom level as needed
        }
      } catch (error) {
        console.error('Error fetching country coordinates:', error);
      }
    };

    fetchCountryCoordinates();
  }, [country]);

  return (
    <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "400px", width: "100%" }}>
      <ChangeView center={mapCenter} zoom={mapZoom} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {routeInfo && routeInfo.routes && routeInfo.routes.map((route, idx) => (
        <Marker key={idx} position={[route.start.lat, route.start.lng]} icon={icon}>
          <Tooltip permanent>
            <b>Day {idx + 1}</b><br />
            {route.description}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;