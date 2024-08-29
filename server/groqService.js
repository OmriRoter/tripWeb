// Import the Groq SDK
const Groq = require("groq-sdk");

// API key for authenticating with the Groq service
const apiKey = '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'; 
// Initialize the Groq instance with the API key
const groq = new Groq({ apiKey });

/**
 * Generates a 3-day itinerary for a specific trip type in a given country using the Groq API.
 *
 * @param {string} country - The country where the trip will take place.
 * @param {string} tripType - The type of trip (e.g., adventure, relaxation).
 * @returns {Promise<Object>} - A promise that resolves with the chat completion response from Groq.
 */
async function getGroqChatCompletion(country, tripType) {
  // Construct the prompt to generate the itinerary
  const prompt = `Create a 3-day itinerary for a ${tripType} trip in ${country}`;
  
  // Send the prompt to the Groq API and return the generated itinerary
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-8b-8192", // Specify the model to be used for generating the completion
  });
}

// Export the getGroqChatCompletion function for use in other modules
module.exports = { getGroqChatCompletion };
