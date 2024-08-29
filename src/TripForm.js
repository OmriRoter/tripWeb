import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import countryList from './countries.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faCar, faBicycle } from '@fortawesome/free-solid-svg-icons';

function TripForm({ onRouteInfo }) {
  const [country, setCountry] = useState('');
  const [tripType, setTripType] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/getRoute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ country, tripType })
      });
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        onRouteInfo(data);
        navigate('/trip-info', { state: { routes: data.routes, imageUrls: data.imageUrls } });
      } else {
        setError('No routes found. Please try again.');
      }
    } catch (error) {
      setError('Error fetching route data. Please try again.');
      console.error('Error fetching route data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-group">
          <label htmlFor="country">
            <FontAwesomeIcon icon={faGlobe} /> Select Country
          </label>
          <select
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            <option value="">Choose country</option>
            {countryList.map((countryItem) => (
              <option key={countryItem.country} value={countryItem.country}>{countryItem.country}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="tripType">
            <FontAwesomeIcon icon={tripType === 'car' ? faCar : faBicycle} /> Select Trip Type
          </label>
          <select
            id="tripType"
            name="tripType"
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            required
          >
            <option value="">Choose type</option>
            <option value="car">Car</option>
            <option value="bicycle">Bicycle</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
          Create Itinerary
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </>
  );
}

export default TripForm;