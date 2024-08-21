// server.js

const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./groqService');

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

    // Parse the response if necessary to get the routes
    const routes = parseRoutes(chatCompletion);

    console.log('Routes received:', routes);
    res.json({ routes });
  } catch (error) {
    console.error('Error fetching data from Groq:', error);
    res.status(500).json({ error: 'Error fetching data from Groq' });
  }
});

function parseRoutes(chatCompletion) {
  const routes = [
    {
      length: 80,
      pointsOfInterest: ['Point A', 'Point B', 'Point C'],
      position: [51.505, -0.09],
      description: chatCompletion
    },
    {
      length: 70,
      pointsOfInterest: ['Point D', 'Point E', 'Point F'],
      position: [51.515, -0.1],
      description: chatCompletion
    },
    {
      length: 60,
      pointsOfInterest: ['Point G', 'Point H', 'Point I'],
      position: [51.525, -0.11],
      description: chatCompletion
    }
  ];

  return routes;
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
