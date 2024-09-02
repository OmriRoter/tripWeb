import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// API keys and constants for interacting with Stable Horde API
const API_KEY = "DsLByH8LUfynbYPiJBDOfQ";
const STABLE_HORDE_URL = "https://stablehorde.net/api/v2/generate/async";
const STABLE_HORDE_STATUS_URL = "https://stablehorde.net/api/v2/generate/status/";

// Configuration constants
const MAX_RETRIES = 20;
const INITIAL_CHECK_INTERVAL = 10000; // 30 seconds
const MAX_CHECK_INTERVAL = 120000; // 2 minutes

// Custom Leaflet icon for map markers
const myIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * Component to update the map view based on the provided bounds.
 * @param {Object} bounds - The geographical bounds to fit the map view.
 * @returns {null}
 */
function ChangeView({ bounds }) {
  const map = useMap();
  map.fitBounds(bounds);
  return null;
}

/**
 * ProgressBar component to visually represent the progress of image generation.
 * @param {number} queuePosition - The position in the queue.
 * @param {number} waitTime - Estimated wait time in seconds.
 * @param {number} elapsedTime - Time elapsed since the process started in seconds.
 * @returns {JSX.Element} The progress bar UI.
 */
function ProgressBar({ queuePosition, waitTime, elapsedTime }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (waitTime !== null) {
      const totalEstimatedTime = waitTime + elapsedTime;
      const calculatedProgress = Math.min(100, (elapsedTime / totalEstimatedTime) * 100);
      setProgress(calculatedProgress);
    }
  }, [waitTime, elapsedTime]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '20px auto',
      padding: '10px',
      backgroundColor: '#f0f0f0',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        position: 'relative',
        height: '20px',
        backgroundColor: '#e0e0e0',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            borderRadius: '10px',
            transition: 'width 0.5s ease-in-out',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)',
            backgroundSize: '40px 40px',
            animation: 'moveStripes 1s linear infinite',
          }} />
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '10px',
        fontFamily: 'Arial, sans-serif',
      }}>
        <span style={{ fontWeight: 'bold', color: '#333' }}>
          {progress.toFixed(1)}% Complete
        </span>
        <span style={{ color: '#666' }}>
          Est. Time: {Math.ceil(waitTime / 60)} min
        </span>
      </div>
      <style>
        {`
          @keyframes moveStripes {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 40px 0;
            }
          }
        `}
      </style>
    </div>
  );
}

/**
 * Main TripInfo component responsible for rendering the trip details,
 * including the map, route information, and generated image.
 * @returns {JSX.Element} The UI for trip information.
 */
function TripInfo() {
  const location = useLocation(); // Hook to access the current route's location
  const { routes, prompt } = location.state || { routes: [], prompt: "" }; // Extracting routes and prompt from location state
  const [imageUrl, setImageUrl] = useState(null);
  const [imageStatus, setImageStatus] = useState('idle');
  const [imageGenerationId, setImageGenerationId] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [waitTime, setWaitTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Function to initiate image generation using Stable Horde API.
   * @async
   */
  const generateImage = useCallback(async () => {
    if (imageGenerationId) return;

    try {
      setImageStatus('generating');
      const response = await fetch(STABLE_HORDE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": API_KEY,
        },
        body: JSON.stringify({
          prompt: `A scenic landscape representing a 3-day trip, showcasing the beauty and diversity of the country`,
          params: {
            samples: 1,
            steps: 30,
          },
          nsfw: false,
          censor_nsfw: true,
          trusted_workers: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Image generation started with ID:", data.id);
      setImageGenerationId(data.id);
    } catch (error) {
      console.error("Error generating image:", error);
      setImageStatus('error');
    }
  }, [imageGenerationId]);

  /**
   * Function to check the status of image generation using Stable Horde API.
   * @async
   */
  const checkImageStatus = useCallback(async () => {
    if (!imageGenerationId) return;

    try {
      const response = await fetch(`${STABLE_HORDE_STATUS_URL}${imageGenerationId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Image status:", data);

      if (data.done) {
        if (data.generations && data.generations.length > 0) {
          setImageUrl(data.generations[0].img);
          setImageStatus('completed');
        } else {
          setImageStatus('error');
        }
      } else {
        setQueuePosition(data.queue_position);
        setWaitTime(data.wait_time);
        setImageStatus('waiting');
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error checking image status:", error);
      setImageStatus('error');
    }
  }, [imageGenerationId]);

  /**
   * useEffect hook to start image generation when the component mounts
   * and the imageStatus is 'idle'.
   */
  useEffect(() => {
    if (imageStatus === 'idle') {
      generateImage();
    }
  }, [imageStatus, generateImage]);

  /**
   * useEffect hook to periodically check the image generation status
   * while the status is 'generating' or 'waiting'.
   */
  useEffect(() => {
    let timer;
    if (imageStatus === 'generating' || imageStatus === 'waiting') {
      const interval = Math.min(INITIAL_CHECK_INTERVAL * Math.pow(2, retryCount), MAX_CHECK_INTERVAL);
      timer = setTimeout(() => {
        if (retryCount < MAX_RETRIES) {
          checkImageStatus();
        } else {
          setImageStatus('error');
        }
      }, interval);
    }
    return () => clearTimeout(timer);
  }, [imageStatus, checkImageStatus, retryCount]);

  /**
   * useEffect hook to increment the elapsed time every second.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (routes.length === 0) {
    return <div>No route information available.</div>;
  }

  // Calculate map bounds based on route start and end points
  const bounds = routes.reduce((bounds, route) => {
    bounds.extend([route.start.lat, route.start.lng]);
    bounds.extend([route.end.lat, route.end.lng]);
    return bounds;
  }, new L.LatLngBounds());

  return (
    <div className="trip-info-container">
      <h1 style={{ textAlign: "center" }}>Your 3-Day Trip</h1>
      {prompt && (
        <div style={{display: 'none'}} dangerouslySetInnerHTML={{__html: `<!-- Prompt: ${prompt} -->`}} />
      )}
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
      <div className="trip-image" style={{ marginTop: '20px', textAlign: 'center' }}>
        {imageStatus === 'completed' && imageUrl ? (
          <img src={imageUrl} alt="Trip Overview" style={{ maxWidth: '100%', height: 'auto' }} />
        ) : imageStatus === 'generating' || imageStatus === 'waiting' ? (
          <div>
            <h3 style={{ color: '#333', fontFamily: 'Arial, sans-serif' }}>Generating Your Trip Image</h3>
            {queuePosition !== null && (
              <p style={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>Queue position: {queuePosition}</p>
            )}
            {waitTime !== null && (
              <ProgressBar queuePosition={queuePosition} waitTime={waitTime} elapsedTime={elapsedTime} />
            )}
            <p style={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>
              Time elapsed: {Math.floor(elapsedTime / 60)} minute(s) {elapsedTime % 60} second(s)
            </p>
          </div>
        ) : imageStatus === 'error' ? (
          <div>
            <p style={{ color: '#d32f2f', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Failed to generate image. Please try again.</p>
            <button 
              onClick={() => { setImageStatus('idle'); setRetryCount(0); }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              Retry
            </button>
          </div>
        ) : (
          <div style={{ color: '#333', fontFamily: 'Arial, sans-serif' }}>Preparing to generate image...</div>
        )}
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
        </div>
      ))}
    </div>
  );
}

export default TripInfo;
