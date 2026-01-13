import { GoogleGenAI, Type } from "@google/genai";
import { HealthData, AQIData, BreathAnalysis } from "../types";

/**
 * Utility to extract JSON from a potential markdown code block returned by the model.
 */
const cleanJsonResponse = (text: string): string => {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
};

/**
 * Initializes the AI instance.
 * Note: process.env.API_KEY is assumed to be provided by the environment.
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_NOT_FOUND: The Gemini API key is not configured in the environment.");
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

        Return a JSON object containing:
        - score: a number from 0 to 100 (100 is perfect health)
        - summary: a 2-3 sentence clinical overview
        - recommendations: an array of 4 actionable health tips
        - riskFactors: an array of 2-3 identified risks
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
    if (!text) {
      throw new Error("EMPTY_RESPONSE: The model returned an empty response.");
    }

    const cleanedText = cleanJsonResponse(text);
    return JSON.parse(cleanedText);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(error?.message || "Failed to generate health analysis due to an internal AI error.");
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

  // Try WAQI API first if token is available
  if (waqiToken && waqiToken !== "undefined" && waqiToken.length > 5) {
    try {
      const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiToken}`);
      const result = await response.json();
      if (result.status === 'ok') {
        return {
          aqi: result.data.aqi,
          city: result.data.city.name,
          dominantPollutant: result.data.dominentpol?.toUpperCase() || "N/A",
          status: getAQIStatus(result.data.aqi),
          source: "WAQI"
        };
      }
    } catch (err) {
      console.warn("WAQI API call failed:", err);
    }
  }

  // Fallback to Google Search grounding via Gemini
  const ai = getAIInstance();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current real-world Air Quality Index (AQI) at latitude ${lat} and longitude ${lon}? Provide the current AQI number and city name.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || chunk.web?.uri,
        uri: chunk.web?.uri
      }))
      .filter((s: any) => s.uri);

    const text = response.text || "";
    const aqiMatch = text.match(/AQI:?\s*(\d+)/i) || text.match(/(\d+)/);
    const aqiValue = aqiMatch ? parseInt(aqiMatch[1]) : 50;

    return {
      aqi: aqiValue,
      city: "Detected via Search",
      dominantPollutant: "Consult sources",
      status: getAQIStatus(aqiValue),
      source: "Google Search",
      groundingSources: groundingSources
    };
  } catch (error) {
    console.error("AQI Fallback Error:", error);
    return {
      aqi: 50,
      city: "Estimated Location",
      dominantPollutant: "Unknown",
      status: "Moderate",
      source: "System Fallback"
    };
  }
};