const { getGroqChatCompletion } = require('../server/groqService');

// Constants for maximum and minimum distances for bicycle and car trips
const BICYCLE_MAX_DISTANCE = 80;
const CAR_MIN_DISTANCE = 80;
const CAR_MAX_DISTANCE = 300;

/**
 * Generates and validates routes for a given country and trip type.
 *
 * @param {string} country - The country where the trip will take place.
 * @param {string} tripType - The type of trip (e.g., 'bicycle', 'car').
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of validated routes.
 */
async function generateRoutes(country, tripType) {
  // Get the initial routes from the Groq API
  const groqResponse = await getGroqChatCompletion(country, tripType);
  // Parse the Groq API response into a usable format
  const initialRoutes = parseGroqResponse(groqResponse);
  // Validate and adjust the routes based on the trip type
  const validatedRoutes = validateRoutes(initialRoutes, tripType);
  return validatedRoutes; // Return the validated routes
}

/**
 * Parses the response from the Groq API into a structured format.
 *
 * @param {string} response - The raw response from the Groq API.
 * @returns {Array<Object>} - An array of route objects parsed from the response.
 */
function parseGroqResponse(response) {
  try {
    // Attempt to parse the JSON response from Groq
    const parsedResponse = JSON.parse(response);
    // Map each day in the parsed response to a route object
    return parsedResponse.map(day => ({
      startLocation: day.startLocation,
      endLocation: day.endLocation,
      distance: day.distance,
      pointsOfInterest: day.pointsOfInterest,
      description: day.description
    }));
  } catch (error) {
    console.error('Error parsing Groq response:', error); // Log any parsing errors
    return []; // Return an empty array in case of an error
  }
}

/**
 * Validates and adjusts the distance of routes based on the trip type.
 *
 * @param {Array<Object>} routes - An array of route objects to validate.
 * @param {string} tripType - The type of trip (e.g., 'bicycle', 'car').
 * @returns {Array<Object>} - An array of validated and adjusted route objects.
 */
function validateRoutes(routes, tripType) {
  return routes.map(route => {
    let distance = route.distance;
    // Adjust the distance based on the trip type
    if (tripType === 'bicycle') {
      distance = Math.min(distance, BICYCLE_MAX_DISTANCE); // Cap distance at maximum for bicycles
    } else if (tripType === 'car') {
      distance = Math.max(CAR_MIN_DISTANCE, Math.min(distance, CAR_MAX_DISTANCE)); // Ensure distance is within car limits
    }
    // Return the route with the adjusted distance
    return { ...route, distance };
  });
}

module.exports = { generateRoutes };
