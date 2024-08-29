import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import countryList from './countries.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faCar, faBicycle } from '@fortawesome/free-solid-svg-icons';

/**
 * TripForm component allows users to select a country and trip type to generate a travel itinerary.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onRouteInfo - Callback function to handle the generated route information.
 */
function TripForm({ onRouteInfo }) {
  const [country, setCountry] = useState(''); // State to store the selected country
  const [tripType, setTripType] = useState(''); // State to store the selected trip type
  const [error, setError] = useState(''); // State to store any error messages
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const navigate = useNavigate(); // React Router hook to navigate between routes

  /**
   * Handles the form submission to generate the itinerary.
   *
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset any previous errors
    setIsLoading(true); // Set loading state to true

    try {
      // Make a POST request to the backend API to generate the route
      const response = await fetch('http://localhost:3001/api/getRoute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ country, tripType }) // Send selected country and trip type as JSON
      });
      const data = await response.json();

      // Check if valid routes were returned
      if (data.routes && data.routes.length > 0) {
        onRouteInfo(data); // Pass the route data to the parent component
        navigate('/trip-info', { state: { routes: data.routes, imageUrls: data.imageUrls, prompt: data.prompt } }); // Navigate to the trip info page with route data
      } else {
        setError('No routes found. Please try again.'); // Set an error if no routes are found
      }
    } catch (error) {
      setError('Error fetching route data. Please try again.'); // Set an error if the request fails
      console.error('Error fetching route data:', error); // Log the error
    } finally {
      setIsLoading(false); // Set loading state to false after the request completes
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
        {error && <p className="error-message">{error}</p>} {/* Display any error messages */}
      </form>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div> {/* Display loading spinner when loading */}
        </div>
      )}
    </>
  );
}

export default TripForm;
