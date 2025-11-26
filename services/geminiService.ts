import { GoogleGenAI, Type } from "@google/genai";
import { Country, SimPlan } from "../types";

export const getTravelAdvice = async (
  query: string,
  availableCountries: Country[],
  contextData: string
): Promise<string> => {
  
  if (!process.env.API_KEY) {
      return "API Key not configured.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are the AI assistant for "Global SIM Connect Ultimate". 
    Your goal is to recommend the best SIM cards or mobile plans for travelers based on the user's query.
    
    You have access to the following context about countries in the database:
    ${JSON.stringify(availableCountries.map(c => c.name_en).join(', '))}
    
    And specifically this relevant data context from the current view (Operators/Plans):
    ${contextData}

    Keep your answers concise, friendly, and practical. 
    If the user asks about a country we have data for, recommend specific plans from the context.
    If the user asks about a country we don't have, provide general advice for that region.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 500,
      }
    });
    return response.text || "Sorry, I couldn't generate a recommendation at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am currently offline. Please try again later.";
  }
};