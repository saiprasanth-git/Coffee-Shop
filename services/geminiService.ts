import { askBarista } from './apiService';

// NOTE: AI calls are now routed through the backend (server/index.js) to keep the
// Gemini API key server-side and out of the client bundle.

export interface AIRecommendation {
  drinkName: string;
  reasoning: string;
  suggestedCustomization: string;
}

export const getCoffeeRecommendation = async (
  userMood: string,
  weather: string,
  timeOfDay: string
): Promise<string> => {
  try {
    const prompt = `
      Act as a world-class barista at a high-end coffee shop called "Brew & Byte".

      The user says: "${userMood}".
      Context: It is ${timeOfDay} and the weather is ${weather}.

      Recommend ONE specific drink from a typical coffee shop menu (e.g., Latte, Cold Brew, Cappuccino, Matcha).
      Provide a short, friendly, and inviting response (max 50 words) explaining why this drink is perfect for right now.
      Do not use markdown. Just plain text.
    `;

    const { reply } = await askBarista(prompt);
    return reply || "How about a classic Latte? It's always a good choice.";
  } catch (error) {
    console.error('AI Barista Error:', error);
    return "I'm having a little trouble connecting to the coffee beans right now. Try a Vanilla Latte!";
  }
};
