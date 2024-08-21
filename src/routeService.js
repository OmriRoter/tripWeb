const { getGroqChatCompletion } = require('../server/groqService');

const BICYCLE_MAX_DISTANCE = 80;
const CAR_MIN_DISTANCE = 80;
const CAR_MAX_DISTANCE = 300;

async function generateRoutes(country, tripType) {
  const groqResponse = await getGroqChatCompletion(country, tripType);
  const initialRoutes = parseGroqResponse(groqResponse);
  const validatedRoutes = validateRoutes(initialRoutes, tripType);
  return validatedRoutes;
}

function parseGroqResponse(response) {
  try {
    const parsedResponse = JSON.parse(response);
    return parsedResponse.map(day => ({
      startLocation: day.startLocation,
      endLocation: day.endLocation,
      distance: day.distance,
      pointsOfInterest: day.pointsOfInterest,
      description: day.description
    }));
  } catch (error) {
    console.error('Error parsing Groq response:', error);
    return [];
  }
}

function validateRoutes(routes, tripType) {
  return routes.map(route => {
    let distance = route.distance;
    if (tripType === 'bicycle') {
      distance = Math.min(distance, BICYCLE_MAX_DISTANCE);
    } else if (tripType === 'car') {
      distance = Math.max(CAR_MIN_DISTANCE, Math.min(distance, CAR_MAX_DISTANCE));
    }
    return { ...route, distance };
  });
}

module.exports = { generateRoutes };
