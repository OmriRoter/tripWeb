const axios = require('axios');

const apiKey = "JfpazSBYdwnojXfdSMeWVg";
const stableHordeUrl = "https://stablehorde.net/api/v2/generate/async";
const stablePhotoGenerateURL = "https://stablehorde.net/api/v2/generate/status/";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateImage = async (prompt) => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.post(stableHordeUrl, {
        prompt: prompt,
        params: {
          samples: 1,
          steps: 30,
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        }
      });

      if (response.data && response.data.id) {
        return await checkPhotoStatus(response.data.id);
      } else {
        console.error("No id in response:", response.data);
      }
    } catch (error) {
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

const checkPhotoStatus = async (id) => {
  const maxAttempts = 30;
  const delayBetweenAttempts = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(`${stablePhotoGenerateURL}${id}`);
      
      if (response.data.done && response.data.generations && response.data.generations.length > 0) {
        return response.data.generations[0].img;
      } else if (!response.data.processing && !response.data.done) {
        console.log("Generation is not processing and not done, moving to next attempt");
      }

      await delay(delayBetweenAttempts);
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

module.exports = { generateImage };