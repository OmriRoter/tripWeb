import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define a custom icon for the map markers
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', // URL for the marker icon
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png', // URL for the retina version of the marker icon
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', // URL for the marker shadow
  iconSize: [25, 41], // Size of the marker icon
  iconAnchor: [12, 41], // Anchor point of the marker icon
  popupAnchor: [1, -34], // Anchor point for popups
  shadowSize: [41, 41] // Size of the shadow
});

/**
 * Component to change the view of the map when the center or zoom level changes.
 */
function ChangeView({ center, zoom }) {
  const map = useMap(); // Get the map instance from the context
  map.setView(center, zoom); // Set the map view to the new center and zoom level
  return null; // This component doesn't render anything itself
}

/**
 * MapComponent is responsible for rendering the map and displaying the route information as markers.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.routeInfo - The route information to display on the map.
 * @param {string} props.country - The selected country for the trip.
 */
function MapComponent({ routeInfo, country }) {
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default center of the map (London)
  const [mapZoom, setMapZoom] = useState(5); // Default zoom level of the map

  useEffect(() => {
    /**
     * Fetches the coordinates of the selected country and updates the map center.
     */
    const fetchCountryCoordinates = async () => {
      if (!country) return;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?country=${country}&format=json`);
        const data = await response.json();
        if (data && data.length > 0) {
          setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]); // Update map center with country coordinates
          setMapZoom(5);  // Adjust zoom level if necessary
        }
      } catch (error) {
        console.error('Error fetching country coordinates:', error); // Log any errors in fetching data
      }
    };

    fetchCountryCoordinates(); // Fetch coordinates whenever the country prop changes
  }, [country]);

  return (
    <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "400px", width: "100%" }}>
      {/* Update map view when center or zoom changes */}
      <ChangeView center={mapCenter} zoom={mapZoom} />
      {/* Add the OpenStreetMap tile layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Render markers for each route in the routeInfo */}
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
