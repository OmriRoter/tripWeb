const Groq = require("groq-sdk");

const apiKey = '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'; 
const groq = new Groq({ apiKey });

async function getGroqChatCompletion(country, tripType) {
  const prompt = `Create a 3-day itinerary for a ${tripType} trip in ${country}`;
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-8b-8192",
  });
}

module.exports = { getGroqChatCompletion };
