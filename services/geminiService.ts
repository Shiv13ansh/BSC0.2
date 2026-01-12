
import { GoogleGenAI, Type } from "@google/genai";
import { HealthData, AQIData, BreathAnalysis } from "../types";

// These will be replaced by Vite during build
const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getHealthAnalysis = async (
  health: HealthData, 
  aqi: AQIData
): Promise<BreathAnalysis> => {
  const prompt = `
    Analyze respiratory health (Breath Score 0-100) based on:
    - Age: ${health.age}
    - Blood Pressure: ${health.systolicBP}/${health.diastolicBP}
    - Smoking Status: ${health.smokingStatus}
    - Current Local AQI: ${aqi.aqi} (${aqi.status}) in ${aqi.city}

    Provide a structured analysis: score (0-100), clinical summary, 3-4 recommendations, and risk factors.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
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

  return JSON.parse(response.text);
};

const getAQIStatus = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  return "Hazardous";
};

export const fetchLocationAQI = async (lat: number, lon: number): Promise<AQIData> => {
  const waqiToken = process.env.WAQI_API_KEY;

  if (waqiToken && waqiToken !== "undefined") {
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
      console.warn("WAQI failed, falling back to Gemini Search.");
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Current AQI at lat ${lat}, lon ${lon}? Return JSON: {aqi: number, city: string, dominantPollutant: string, status: string}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          aqi: { type: Type.NUMBER },
          city: { type: Type.STRING },
          dominantPollutant: { type: Type.STRING },
          status: { type: Type.STRING }
        }
      }
    }
  });

  const parsed = JSON.parse(response.text);
  return { ...parsed, source: "Google Search" };
};
