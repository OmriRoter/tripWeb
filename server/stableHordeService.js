const axios = require('axios');

// API key for authentication with Stable Horde
const apiKey = "DsLByH8LUfynbYPiJBDOfQ";

// Base URL for Stable Horde API
const baseUrl = "https://stablehorde.net/api/v2";

// Create an instance of axios with predefined configuration
const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'apikey': apiKey,
    'Client-Agent': 'TripWeb:1.0:omri99roter@gmail.com' // Custom client agent identifier
  }
});

/**
 * Function to initiate the image generation process using Stable Horde API.
 * @param {string} prompt - The prompt describing the image to be generated.
 * @returns {string|null} - Returns the image generation ID if successful, otherwise null.
 */
const generateImage = async (prompt) => {
  try {
    // Make a POST request to initiate image generation
    const response = await axiosInstance.post('/generate/async', {
      prompt: prompt,
      params: {
        samples: 1, // Number of images to generate
        steps: 30,  // Number of steps for the generation process
      },
      nsfw: false,           // Mark content as not safe for work (NSFW)
      censor_nsfw: true,     // Enable censoring of NSFW content
      trusted_workers: true  // Use only trusted workers for generation
    });

    // Check if the response contains an image generation ID
    if (response.data && response.data.id) {
      return response.data.id;
    } else {
      console.error("No id in response:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error generating image:", error.message);
    return null;
  }
};

/**
 * Function to check the status of the image generation process.
 * @param {string} id - The ID of the image generation process.
 * @returns {Object} - Returns an object containing the status and relevant information.
 */
const checkImageStatus = async (id) => {
  try {
    // Make a GET request to check the status of the image generation
    const response = await axiosInstance.get(`/generate/check/${id}`);
    console.log("StableHorde: Status response:", response.data);

    // If the image generation is complete
    if (response.data.done) {
      const fullStatus = await axiosInstance.get(`/generate/status/${id}`);
      if (fullStatus.data.generations && fullStatus.data.generations.length > 0) {
        return { status: 'completed', url: fullStatus.data.generations[0].img };
      }
    } else if (response.data.faulted) {
      // If the image generation has failed
      return { status: 'failed', message: 'Image generation failed' };
    } else {
      // If the image generation is still in progress
      return {
        status: 'waiting',
        queuePosition: response.data.queue_position, // Current position in the queue
        waitTime: response.data.wait_time            // Estimated wait time in seconds
      };
    }
  } catch (error) {
    console.error("StableHorde: Error checking image status:", error.message);
    return { status: 'error', message: error.message };
  }
};

// Export the functions for use in other modules
module.exports = { generateImage, checkImageStatus };
