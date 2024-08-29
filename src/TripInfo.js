import React from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// Define a custom icon for the map markers
const myIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", // URL for the marker icon
  iconSize: [25, 41], // Size of the icon
  iconAnchor: [12, 41], // Anchor point of the icon
  popupAnchor: [1, -34], // Popup anchor point
  shadowSize: [41, 41] // Size of the shadow
});

/**
 * ChangeView component adjusts the map view to fit the provided bounds.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.bounds - The bounds to fit the map view to.
 */
function ChangeView({ bounds }) {
  const map = useMap(); // Get the map instance from the context
  map.fitBounds(bounds); // Fit the map view to the specified bounds
  return null; // This component doesn't render anything itself
}

/**
 * TripInfo component displays detailed information about the routes generated for the trip.
 */
function TripInfo() {
  const location = useLocation(); // Get the current location state from the router
  const { routes, imageUrls, prompt } = location.state || { routes: [], imageUrls: [], prompt: "" };

  // If there are no routes, display a message
  if (routes.length === 0) {
    return <div>No route information available.</div>;
  }

  // Calculate the bounds to fit all routes within the map view
  const bounds = routes.reduce((bounds, route) => {
    bounds.extend([route.start.lat, route.start.lng]);
    bounds.extend([route.end.lat, route.end.lng]);
    return bounds;
  }, new L.LatLngBounds());

  return (
    <div className="trip-info-container">
      <h1 style={{ textAlign: "center" }}>Your 3-Day Trip</h1>
      {/* Add the prompt as an HTML comment (hidden from view) */}
      {prompt && (
        <div style={{display: 'none'}} dangerouslySetInnerHTML={{__html: `<!-- Prompt: ${prompt} -->`}} />
      )}
      <div className="map-container">
        <MapContainer bounds={bounds} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView bounds={bounds} /> {/* Adjust map view to the calculated bounds */}
          {routes.map((route, index) => (
            <React.Fragment key={index}>
              {/* Marker for the start of the day */}
              <Marker position={[route.start.lat, route.start.lng]} icon={myIcon}>
                <Tooltip permanent>Day {index + 1} Start</Tooltip>
              </Marker>
              {/* Marker for the end of the day */}
              <Marker position={[route.end.lat, route.end.lng]} icon={myIcon}>
                <Tooltip permanent>Day {index + 1} End</Tooltip>
              </Marker>
              {/* Polyline connecting the start and end locations */}
              <Polyline positions={[
                [route.start.lat, route.start.lng],
                [route.end.lat, route.end.lng]
              ]} color="blue" />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
      {routes.map((route, index) => (
        <div key={index} className="route-info">
          <h2>{route.name}</h2>
          <p><strong>Route:</strong> {route.description}</p>
          <p><strong>Distance:</strong> {route.length} km</p>
          <p><strong>Estimated Duration:</strong> {route.duration}</p>
          <h3>Points of Interest:</h3>
          <ul>
            {route.pointsOfInterest.map((poi, poiIndex) => (
              <li key={poiIndex}>{poi}</li>
            ))}
          </ul>
          {/* Display the image for the route day if available */}
          {imageUrls && imageUrls[index] ? (
            <div className="trip-image">
              <img src={imageUrls[index]} alt={`Trip Day ${index + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          ) : (
            <div>Image not available</div> // Fallback text if no image is available
          )}
        </div>
      ))}
    </div>
  );
}

export default TripInfo;
