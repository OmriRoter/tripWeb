import React, { useState } from 'react';
import countryList from './countries.json';

function TripForm({ onRouteInfo }) {
  const [country, setCountry] = useState('');
  const [tripType, setTripType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`Submitting request for country: ${country}, tripType: ${tripType}`);
    try {
      const response = await fetch('http://localhost:3001/api/getRoute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ country, tripType })
      });
      const data = await response.json();
      console.log('Data received from server:', data);
      if (data.routes) {
        onRouteInfo(data);
      } else {
        console.error('No routes found in the response:', data);
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="country">Select Country:</label>
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
      <label htmlFor="tripType">Select Trip Type:</label>
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
      <button type="submit">Create Itinerary</button>
    </form>
  );
}

export default TripForm;
