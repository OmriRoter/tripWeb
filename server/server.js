const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { getGroqChatCompletion } = require('./groqService');
const { generateImage, checkImageStatus } = require('./stableHordeService');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

/**
 * Function to geocode a location using Nominatim API.
 * @param {string} place - The place name to geocode.
 * @param {string} country - The country where the place is located.
 * @returns {Object|null} - Returns an object with latitude and longitude or null if not found.
 */
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
      console.log(`Geocoded ${place}, ${country} to:`, response.data[0]);
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    console.warn(`Location not found for: ${place}, ${country}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

/**
 * Function to extract location names from text.
 * @param {string} text - The text containing location names.
 * @returns {Array<string>} - Returns an array of extracted location names.
 */
function extractLocations(text) {
  const cityRegex = /\b([A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g;
  return text.match(cityRegex) || [];
}

/**
 * Function to extract trip details from a day's itinerary.
 * @param {string} day - The itinerary text for a single day.
 * @returns {Object} - Returns an object containing the description, points of interest, length, and duration.
 */
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

/**
 * Function to parse routes from chat completion text.
 * @param {string} chatCompletion - The chat completion text containing itinerary details.
 * @param {string} country - The country for the trip.
 * @param {string} tripType - The type of trip (e.g., 'bicycle', 'car').
 * @returns {Array<Object>} - Returns an array of route objects.
 */
async function parseRoutes(chatCompletion, country, tripType) {
  console.log('Parsing routes from chat completion...');
  const days = chatCompletion.split(/Day \d+:/).slice(1);
  let routes = [];
  let previousEndLocation = null;

  for (let i = 0; i < days.length; i++) {
    console.log(`Processing Day ${i + 1}...`);
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

    console.log(`Day ${i + 1} route: ${startLocation} to ${endLocation}`);

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

    console.log(`Day ${i + 1} route details:`, JSON.stringify(routeEntry, null, 2));

    routes.push(routeEntry);

    previousEndLocation = endLocation;
  }

  return routes;
}

/**
 * API endpoint to generate a travel route based on country and trip type.
 */
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

    console.log('Sending prompt to getGroqChatCompletion...');
    const response = await getGroqChatCompletion(prompt);
    const chatCompletion = response.choices[0]?.message?.content || "";

    console.log('Chat completion received:', chatCompletion);

    const routes = await parseRoutes(chatCompletion, country, tripType);

    console.log('Routes parsed:', JSON.stringify(routes, null, 2));

    // Generate one image for the entire trip
    const imagePrompt = `A scenic landscape representing a 3-day trip in ${country} by ${tripType}, showcasing the beauty and diversity of the country.`;
    console.log('Generating image with prompt:', imagePrompt);
    const imageGenerationId = await generateImage(imagePrompt);

    console.log('Image Generation ID:', imageGenerationId);

    res.json({ routes, imageGenerationId, prompt });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});

/**
 * API endpoint to check the status of an image generation process.
 */
app.get('/api/checkImageStatus', async (req, res) => {
  const { id } = req.query;

  console.log(`[${new Date().toISOString()}] Checking status for image ${id}`);

  try {
    const status = await checkImageStatus(id);
    console.log(`[${new Date().toISOString()}] Image ${id} status:`, JSON.stringify(status, null, 2));
    
    if (status.status === 'completed' && status.url) {
      console.log(`[${new Date().toISOString()}] Image URL is available:`, status.url);
    } else if (status.status === 'waiting') {
      console.log(`[${new Date().toISOString()}] Image is still being generated. Queue position: ${status.queuePosition}, Wait time: ${status.waitTime} seconds`);
    } else {
      console.log(`[${new Date().toISOString()}] Image status: ${status.status}`);
    }

    res.json(status);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error checking image status:`, error);
    res.status(500).json({ status: 'error', message: 'Error checking image status' });
  }
});

/**
 * Start the Express server on the specified port.
 */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
