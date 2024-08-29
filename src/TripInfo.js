import React from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

const myIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ChangeView({ bounds }) {
  const map = useMap();
  map.fitBounds(bounds);
  return null;
}

function TripInfo() {
  const location = useLocation();
  const { routes, imageUrls } = location.state || { routes: [], imageUrls: [] };

  if (routes.length === 0) {
    return <div>No route information available.</div>;
  }

  const bounds = routes.reduce((bounds, route) => {
    bounds.extend([route.start.lat, route.start.lng]);
    bounds.extend([route.end.lat, route.end.lng]);
    return bounds;
  }, new L.LatLngBounds());

  return (
    <div className="trip-info-container">
      <h1 style={{ textAlign: "center" }}>Your 3-Day Trip</h1>
      <div className="map-container">
        <MapContainer bounds={bounds} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView bounds={bounds} />
          {routes.map((route, index) => (
            <React.Fragment key={index}>
              <Marker position={[route.start.lat, route.start.lng]} icon={myIcon}>
                <Tooltip permanent>Day {index + 1} Start</Tooltip>
              </Marker>
              <Marker position={[route.end.lat, route.end.lng]} icon={myIcon}>
                <Tooltip permanent>Day {index + 1} End</Tooltip>
              </Marker>
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
          {imageUrls && imageUrls[index] ? (
            <div className="trip-image">
              <img src={imageUrls[index]} alt={`Trip Day ${index + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          ) : (
            <div>Image not available</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TripInfo;