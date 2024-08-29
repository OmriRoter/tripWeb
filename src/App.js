import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TripForm from './TripForm';
import MapComponent from './MapComponent';
import TripInfo from './TripInfo';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGlobe, faCar, faBicycle, faSpinner } from '@fortawesome/free-solid-svg-icons';

library.add(faGlobe, faCar, faBicycle, faSpinner);

function BackgroundAnimation() {
  return (
    <div className="background-animation">
      {[...Array(50)].map((_, i) => (
        <div key={i} className="circle-container">
          <div className="circle"></div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('');

  const handleRouteInfo = (data, country) => {
    setRouteInfo(data);
    setSelectedCountry(country);
  };

  return (
    <Router>
      <div className="App">
        <BackgroundAnimation />
        <header>
          <h1>3 Daily Route Trips Around the World</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <TripForm onRouteInfo={handleRouteInfo} />
                {routeInfo && (
                  <div className="result-container">
                    <h2>Your Epic Adventure Awaits</h2>
                    <MapComponent routeInfo={routeInfo} country={selectedCountry} />
                  </div>
                )}
              </>
            } />
            <Route path="/trip-info" element={<TripInfo />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2024 World Trip Planner. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;