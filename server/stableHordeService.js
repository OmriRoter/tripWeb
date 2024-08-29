// Import the axios library for making HTTP requests
const axios = require('axios');

// API key for authenticating with the StableHorde service
const apiKey = "FhPGLkkQ2cEARdcKQ2uVGw";

// URLs for the StableHorde service to generate images and check the status
const stableHordeUrl = "https://stablehorde.net/api/v2/generate/async";
const stablePhotoGenerateURL = "https://stablehorde.net/api/v2/generate/status/";

// Function to introduce a delay for a specified amount of time
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates an image based on the provided prompt by interacting with the StableHorde API.
 *
 * @param {string} prompt - The text prompt to generate the image from.
 * @returns {Promise<string|null>} - The URL of the generated image or null if the process fails.
 */
const generateImage = async (prompt) => {
  const maxRetries = 3; // Maximum number of retry attempts
  let retries = 0;

  // Loop to attempt the image generation up to the maximum number of retries
  while (retries < maxRetries) {
    try {
      // Send a POST request to initiate image generation
      const response = await axios.post(stableHordeUrl, {
        prompt: prompt,
        params: {
          samples: 1, // Number of images to generate
          steps: 30,  // Number of steps for the generation process
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey, // API key for authorization
        }
      });

      // If the response contains an ID, check the status of the image generation
      if (response.data && response.data.id) {
        return await checkPhotoStatus(response.data.id);
      } else {
        console.error("No id in response:", response.data);
      }
    } catch (error) {
      // Handle rate limiting by waiting before retrying
      if (error.response && error.response.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '1');
        console.log(`Rate limited. Waiting for ${retryAfter} seconds before retry.`);
        await delay(retryAfter * 1000);
        retries++;
      } else {
        console.error("Error generating photo:", error.message);
        return null;
      }
    }
  }

  console.error("Max retries reached for image generation");
  return null;
};

/**
 * Checks the status of the image generation process until it completes or fails.
 *
 * @param {string} id - The ID of the image generation task.
 * @returns {Promise<string|null>} - The URL of the generated image or null if the process fails.
 */
const checkPhotoStatus = async (id) => {
  const maxAttempts = 30; // Maximum number of attempts to check the status
  const delayBetweenAttempts = 2000; // Delay between attempts in milliseconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Send a GET request to check the status of the image generation
      const response = await axios.get(`${stablePhotoGenerateURL}${id}`);
      
      // If the generation is done and there are results, return the image URL
      if (response.data.done && response.data.generations && response.data.generations.length > 0) {
        return response.data.generations[0].img;
      } else if (!response.data.processing && !response.data.done) {
        console.log("Generation is not processing and not done, moving to next attempt");
      }

      await delay(delayBetweenAttempts); // Wait before checking the status again
    } catch (error) {
      console.error("Error checking photo status:", error.message);
      if (error.response && error.response.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '1');
        console.log(`Rate limited. Waiting for ${retryAfter} seconds before retry.`);
        await delay(retryAfter * 1000);
      } else {
        await delay(delayBetweenAttempts);
      }
    }
  }

  console.error("Max attempts reached, couldn't get the image");
  return null;
};

// Export the generateImage function for use in other modules
module.exports = { generateImage };
