const generatePhoto = async (prompt) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Step 1: Initiate the image generation
      const response = await fetch(stableHordeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
        },
        body: JSON.stringify({ 
          prompt: prompt,
          params: {
            samples: 1,
            steps: 30,
          },
        }),
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        console.log(`Rate limited. Waiting for ${retryAfter} seconds before retry.`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        retryCount++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.id) {
        // Step 2: Wait for the image to be generated
        const imageUrl = await checkPhotoStatus(data.id);
        if (imageUrl) {
          return imageUrl;
        }
      } else {
        console.error("No id in response:", data);
      }
    } catch (error) {
      console.error("Error generating photo:", error);
    }
    
    retryCount++;
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
    }
  }

  return null; // Return null if all retries fail
};

const checkPhotoStatus = async (id) => {
  const maxAttempts = 30; // Maximum number of attempts
  const delayBetweenAttempts = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${stablePhotoGenerateURL}${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.done && data.generations && data.generations.length > 0) {
        return data.generations[0].img; // Return the image URL
      } else if (!data.processing && !data.done) {
        throw new Error('Generation failed or was canceled');
      }

      // If not done, wait before trying again
      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
    } catch (error) {
      console.error("Error checking photo status:", error);
      // For network errors, we might want to retry
      if (error.message !== 'Generation failed or was canceled') {
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      } else {
        return null; // Exit early for canceled or failed generations
      }
    }
  }

  console.error("Max attempts reached, couldn't get the image");
  return null;
};