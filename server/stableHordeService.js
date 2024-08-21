const axios = require('axios');

async function generateImage(description) {
  const url = 'https://stablehorde.net/api/v2/generate/async';
  const payload = {
    prompt: description,
    params: {
      n: 1, 
      width: 512,
      height: 512,
      seed: Math.floor(Math.random() * 10000)
    },
    api_key: 'pX2fuJlwqqHwvQ4hx4VGrg' 
  };

  try {
    const response = await axios.post(url, payload);
    console.log('StableHorde response:', response.data);

    const jobId = response.data.id;

    
    let waitTimeResponse;
    let waitTime;

    do {
      waitTimeResponse = await axios.get(`https://stablehorde.net/api/v2/status/${jobId}`);
      waitTime = waitTimeResponse.data.wait_time;

      console.log(`Estimated wait time: ${waitTime} seconds`);
      await new Promise(resolve => setTimeout(resolve, 5000)); 
    } while (waitTimeResponse.data.status !== 'completed');

    const imageUrl = waitTimeResponse.data.generations[0].image_url;
    return imageUrl;

  } catch (error) {
    console.error('Error generating image:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { generateImage };
