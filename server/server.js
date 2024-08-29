const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { getGroqChatCompletion } = require('./groqService');
const { generateImage } = require('./stableHordeService');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

async function geocode(place, country) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: `${place}, ${country}`,
        format: 'json',
        limit: 1,
        addressdetails: 1
      }
    });
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

function extractLocations(text) {
  const cityRegex = /\b([A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g;
  return text.match(cityRegex) || [];
}

function extractTripDetails(day) {
  const lines = day.split('\n').filter(line => line.trim() !== '');
  const description = lines[0]?.trim() || '';
  
  const routeDetails = lines.find(line => line.toLowerCase().includes('km') || line.toLowerCase().includes('miles'));
  let length = routeDetails ? parseInt(routeDetails.match(/\d+/)[0]) : 0;
  
  const durationDetails = lines.find(line => line.toLowerCase().includes('duration'));
  const duration = durationDetails ? durationDetails.split(':')[1]?.trim() : null;

  const pointsOfInterest = lines
    .filter(line => !line.startsWith(description) && !line.startsWith(routeDetails) && !line.startsWith(durationDetails))
    .map(line => line.trim());

  return { description, pointsOfInterest, length, duration };
}

async function parseRoutes(chatCompletion, country, tripType) {
  const days = chatCompletion.split(/Day \d+:/).slice(1);
  let routes = [];
  let previousEndLocation = null;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const { description, pointsOfInterest, length, duration } = extractTripDetails(day);
    
    const adjustedLength = tripType === 'bicycle' 
      ? Math.min(length, 80)
      : Math.max(80, Math.min(length, 300));

    const locations = extractLocations(description);
    let startLocation = previousEndLocation || locations[0] || country;  
    let endLocation = locations[locations.length - 1] || country;

    if (startLocation === endLocation && locations.length > 1) {
      endLocation = locations[1];
    }

    let startCoords = await geocode(startLocation, country);
    let endCoords = await geocode(endLocation, country);  

    if (!startCoords) startCoords = { lat: 0, lng: 0 };
    if (!endCoords) endCoords = { lat: 0, lng: 0 };

    const routeEntry = {
      name: `${country} - Day ${i + 1} Route`,
      full_description: `Day ${i + 1} of the journey in ${country}`, 
      start: startCoords,
      end: endCoords,
      length: adjustedLength,
      duration,
      pointsOfInterest,
      position: startCoords ? [startCoords.lat, startCoords.lng] : [0, 0],
      description
    };

    routes.push(routeEntry);

    previousEndLocation = endLocation;
  }

  return routes;
}

app.post('/api/getRoute', async (req, res) => {
  const { country, tripType } = req.body;

  console.log(`Received request for country: ${country}, tripType: ${tripType}`);

  try {
    const prompt = `Create a continuous 3-day travel itinerary for ${country} by ${tripType}. The itinerary must be exactly 3 days, no more and no less. 
    Ensure that each day's end location is the start location for the next day.
    For bicycle trips, each day's route should not exceed 80 km.
    For car trips, each day's route should be between 80 km and 300 km.
    Include specific city names, points of interest, total distance, and estimated trip duration for each day.
    Format the response with 'Day 1:', 'Day 2:', and 'Day 3:' headings. 
    Start each day's description with the route, e.g., "From [Start City] to [End City]".
    On a new line after the route, include the text "Total Distance: X km" where X is the total distance in km for that day's route.
    On another new line, include the text "Estimated Duration: Y" where Y is the estimated trip duration for that day's route.
    After the duration, list 3-4 points of interest. Do not use any special characters, numbers or bullet points. Just put each point of interest on its own line.`;

    const response = await getGroqChatCompletion(prompt);
    const chatCompletion = response.choices[0]?.message?.content || "";

    console.log('Chat completion:', chatCompletion);

    const routes = await parseRoutes(chatCompletion, country, tripType);

    console.log('Routes received:', routes);

    // Generate images for each route
    const imageUrls = await Promise.all(routes.map(async (route) => {
      try {
        return await generateImage(`${country} ${route.description}`);
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        return null;
      }
    }));

    res.json({ routes, imageUrls });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});