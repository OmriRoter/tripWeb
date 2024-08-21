const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./groqService');
const { generateImage } = require('./stableHordeService');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/getRoute', async (req, res) => {
  const { country, tripType } = req.body;

  console.log(`Received request for country: ${country}, tripType: ${tripType}`);

  try {
    const response = await getGroqChatCompletion(country, tripType);
    const chatCompletion = response.choices[0]?.message?.content || "";

    console.log('Chat completion:', chatCompletion);

    const routes = parseRoutes(chatCompletion, country);

    console.log('Routes received:', routes);

    // Generate image for the first route
    let imageUrl;
    try {
      imageUrl = await generateImage(routes[0].description);
    } catch (imageError) {
      console.error('Error generating image:', imageError);
      imageUrl = null;  // Set to null if image generation fails
    }

    res.json({ routes, imageUrl });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});

function parseRoutes(chatCompletion, country) {
  // This is a placeholder. You should implement proper parsing based on the chat completion
  const routes = [
    {
      name: `${country} - Day 1 Route`,
      full_description: `First day of the journey in ${country}`,
      start: { lat: 51.505, lng: -0.09 },
      end: { lat: 51.51, lng: -0.1 },
      length: 80,
      pointsOfInterest: [
        'Visit the main city square',
        'Explore local markets',
        'Try traditional cuisine at a local restaurant'
      ],
      position: [51.505, -0.09],
      description: `Start your journey in ${country}'s capital city. Explore the vibrant city center, visit historical landmarks, and immerse yourself in the local culture.`
    },
    {
      name: `${country} - Day 2 Route`,
      full_description: `Second day of the journey in ${country}`,
      start: { lat: 51.51, lng: -0.1 },
      end: { lat: 51.52, lng: -0.11 },
      length: 75,
      pointsOfInterest: [
        'Visit a famous museum or art gallery',
        'Relax in a scenic park',
        'Attend a cultural event or performance'
      ],
      position: [51.51, -0.1],
      description: `Continue your exploration of ${country}. Today's route takes you through cultural hotspots and natural beauty spots.`
    },
    {
      name: `${country} - Day 3 Route`,
      full_description: `Third day of the journey in ${country}`,
      start: { lat: 51.52, lng: -0.11 },
      end: { lat: 51.53, lng: -0.12 },
      length: 70,
      pointsOfInterest: [
        'Take a day trip to a nearby attraction',
        'Experience local entertainment',
        'Shop for souvenirs and local crafts'
      ],
      position: [51.52, -0.11],
      description: `Conclude your trip in ${country} with a mix of adventure and relaxation. This route offers a perfect blend of natural wonders and urban experiences.`
    }
  ];

  return routes;
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});