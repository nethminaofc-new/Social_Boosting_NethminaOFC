import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// NOTE: process.env.API_KEY is handled by the build environment. 
// We create the client only when needed to ensure we have the key if it's set dynamically.

export const generateSocialTips = async (platform: string, goal: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found in environment variables.");
    return "AI features are currently unavailable. Please contact support.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using a lightweight model for quick tips
    const modelId = 'gemini-3-flash-preview'; 

    const prompt = `
      You are a social media expert for NethminaOFC Boosting Service.
      The user wants to grow on ${platform} and their main goal is: "${goal}".
      Provide 3 short, punchy, and actionable tips to help them achieve this organically alongside their boosted stats.
      Keep it under 100 words total. Format as a bulleted list.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Could not generate tips at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Our AI assistant is currently taking a break. Please try again later.";
  }
};
