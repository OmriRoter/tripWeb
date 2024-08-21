import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip, Polyline } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

const apiKey = "qccj98M9hoCYgTs6gnkRSw";
const stableHordeUrl = "https://stablehorde.net/api/v2/generate/async";
const stablePhotoGenerateURL = "https://stablehorde.net/api/v2/generate/status/";

const myIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [32, 32],
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function TripInfo() {
  const location = useLocation();
  const routes = location.state ? location.state.routes : [];
  const [photoUrls, setPhotoUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (routes.length > 0) {
      fetchPhotoUrls();
    }
  }, [routes]);

  const fetchPhotoUrls = async () => {
    try {
      const urls = [];
      for (const route of routes) {
        const url = await generatePhoto(route.name);
        urls.push(url);
        await delay(5000); // Wait 5 seconds between requests
      }
      setPhotoUrls(urls.filter(url => url !== null));
    } catch (error) {
      console.error("Error fetching photo URLs:", error);
      setError("Failed to load images. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const generatePhoto = async (prompt) => {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(stableHordeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apiKey: apiKey,
          },
          body: JSON.stringify({ prompt }),
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 60;
          console.log(`Rate limited. Waiting for ${retryAfter} seconds before retry.`);
          await delay(retryAfter * 1000);
          retryCount++;
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.id) {
          return await checkPhotoStatus(data.id);
        } else {
          console.error("No id in response:", data);
          return null;
        }
      } catch (error) {
        console.error("Error generating photo:", error);
        retryCount++;
        if (retryCount >= maxRetries) {
          return null;
        }
        await delay(5000); // Wait 5 seconds before retry
      }
    }
    return null;
  };

  const checkPhotoStatus = async (id) => {
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries) {
      try {
        const response = await fetch(stablePhotoGenerateURL + id);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.generations && data.generations.length > 0 && data.generations[0].img) {
          return data.generations[0].img;
        } else {
          await delay(5000); // Wait 5 seconds before checking again
          retries++;
        }
      } catch (error) {
        console.error("Error checking photo status:", error);
        retries++;
        if (retries >= maxRetries) {
          return null;
        }
        await delay(5000);
      }
    }
    return null;
  };

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
          {routes.map((route, index) => (
            <React.Fragment key={index}>
              <Marker position={[route.start.lat, route.start.lng]} icon={myIcon}>
                <Tooltip permanent>Day {index + 1} Start</Tooltip>
              </Marker>
              <Marker position={[route.end.lat, route.end.lng]} icon={myIcon}>
                <Tooltip permanent>Day {index + 1} End</Tooltip>
              </Marker>
              <Polyline positions={[[route.start.lat, route.start.lng], [route.end.lat, route.end.lng]]} />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
      {routes.map((route, index) => (
        <div key={index} className="route-info">
          <h2>{route.name}</h2>
          <p>{route.description}</p>
          <h3>Points of Interest:</h3>
          <ul>
            {route.pointsOfInterest.map((poi, poiIndex) => (
              <li key={poiIndex}>{poi}</li>
            ))}
          </ul>
          <div className="photo-container">
            {loading ? (
              <div className="loading-container">
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#000000" strokeWidth="5" strokeLinecap="round">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      dur="1s"
                      from="0 25 25"
                      to="360 25 25"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <p>Loading...</p>
              </div>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              photoUrls[index] && (
                <div className="photo">
                  <img src={photoUrls[index]} alt={`Day ${index + 1} Route`} />
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TripInfo;