import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TripForm from './TripForm';
import MapComponent from './MapComponent';
import TripInfo from './TripInfo';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGlobe, faCar, faBicycle, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Add FontAwesome icons to the library for use throughout the app
library.add(faGlobe, faCar, faBicycle, faSpinner);

/**
 * BackgroundAnimation component creates an animated background with moving circles.
 */
function BackgroundAnimation() {
  return (
    <div className="background-animation">
      {/* Create an array of 50 elements and map each to a circle container */}
      {[...Array(50)].map((_, i) => (
        <div key={i} className="circle-container">
          <div className="circle"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * The main App component that contains the application structure and routing.
 */
function App() {
  // State to store the route information and selected country
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('');

  /**
   * Handles setting the route information and selected country when a new route is generated.
   *
   * @param {Object} data - The route information data.
   * @param {string} country - The country associated with the route.
   */
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
            {/* Define the main route that displays the TripForm and possibly the MapComponent */}
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
            {/* Define a route for displaying additional trip information */}
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
