import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TripForm from './TripForm';
import MapComponent from './MapComponent';
import TripInfo from './TripInfo';
import './App.css';

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
        <header>
          <h1>3 Daily Route Trips Around the World</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <TripForm onRouteInfo={handleRouteInfo} />
                {routeInfo && <MapComponent routeInfo={routeInfo} country={selectedCountry} />}
              </>
            } />
            <Route path="/trip-info" element={<TripInfo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;