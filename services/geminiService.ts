import { GoogleGenAI, Type } from "@google/genai";
import { HealthData, AQIData, BreathAnalysis, GroundingSource } from "../types";

/**
 * Utility to extract JSON from a potential markdown code block returned by the model.
 */
const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
};

/**
 * Initializes the AI instance.
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_NOT_FOUND: Gemini API key is missing in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getHealthAnalysis = async (
  health: HealthData, 
  aqi: AQIData
): Promise<BreathAnalysis> => {
  const ai = getAIInstance();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a respiratory health expert. Analyze the following profile and provide a score from 0-100.
        
        USER PROFILE:
        - Age: ${health.age}
        - Blood Pressure: ${health.systolicBP}/${health.diastolicBP} mmHg
        - Smoking Habits: ${health.smokingStatus}
        
        ENVIRONMENTAL CONTEXT:
        - Local AQI: ${aqi.aqi}
        - Air Quality Status: ${aqi.status}
        - City: ${aqi.city}

        Return a JSON object:
        - score: number (0-100)
        - summary: 2-3 sentence overview
        - recommendations: array of 4 health tips
        - riskFactors: array of 2-3 risks
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "summary", "recommendations", "riskFactors"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    return JSON.parse(cleanJsonResponse(text));
  } catch (error: any) {
    console.error("Health Analysis Error:", error);
    throw new Error(error?.message || "Internal AI analysis failure.");
  }
};

const getAQIStatus = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  return "Hazardous";
};

export const fetchLocationAQI = async (lat: number, lon: number, customToken?: string): Promise<AQIData> => {
  const waqiToken = customToken || (process.env as any).WAQI_API_KEY;

  if (waqiToken && waqiToken !== "undefined" && waqiToken.length > 5) {
    try {
      const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiToken}`);
      const result = await response.json();
      if (result.status === 'ok') {
        const aqiVal = result.data.aqi;
        const data: AQIData = {
          aqi: aqiVal,
          city: result.data.city.name,
          dominantPollutant: result.data.dominentpol?.toUpperCase() || "N/A",
          status: getAQIStatus(aqiVal),
          source: "WAQI",
          groundingSources: []
        };
        return data;
      }
    } catch (err) {
      console.warn("WAQI API failed:", err);
    }
  }

  const ai = getAIInstance();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current real-world Air Quality Index (AQI) at latitude ${lat} and longitude ${lon}?`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .map((chunk: any) => ({
        title: String(chunk.web?.title || chunk.web?.uri || "Source"),
        uri: String(chunk.web?.uri || "")
      }))
      .filter((s) => s.uri !== "");

    const text = response.text || "";
    const aqiMatch = text.match(/AQI:?\s*(\d+)/i) || text.match(/(\d+)/);
    const aqiValue = aqiMatch ? parseInt(aqiMatch[1]) : 50;

    const data: AQIData = {
      aqi: aqiValue,
      city: "Detected via Search",
      dominantPollutant: "Check sources",
      status: getAQIStatus(aqiValue),
      source: "Google Search",
      groundingSources: sources
    };
    return data;
  } catch (error) {
    console.error("AQI Search Error:", error);
    return {
      aqi: 50,
      city: "Estimated Location",
      dominantPollutant: "Unknown",
      status: "Moderate",
      source: "System Fallback",
      groundingSources: []
    };
  }
};