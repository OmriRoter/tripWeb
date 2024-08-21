// App.js

import React, { useState } from 'react';
import TripForm from './TripForm';
import MapComponent from './MapComponent';
import './App.css';

function App() {
  const [routeInfo, setRouteInfo] = useState(null);

  const handleRouteInfo = (data) => {
    setRouteInfo(data);
  };

  return (
    <div className="App">
      <header>
        <h1>3 Daily Route Trips Around the World</h1>
      </header>
      <main>
        <TripForm onRouteInfo={handleRouteInfo} />
        {routeInfo && <MapComponent routeInfo={routeInfo} />}
        <div className="route-info" id="routeInfo">
          {routeInfo &&
            routeInfo.routes.map((route, idx) => (
              <div key={idx} className="card">
                <img
                  src={route.image}
                  alt={`Landscape of ${route.country}`}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5 className="card-title">Day {idx + 1}</h5>
                  <p>Length: {route.length} km</p>
                  <p>Points of Interest: {route.pointsOfInterest.join(', ')}</p>
                  <p>{route.description}</p>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

export default App;
