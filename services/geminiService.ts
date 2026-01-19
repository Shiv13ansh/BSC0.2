import { HealthData, AQIData, BreathAnalysis, SavedAnalysis } from "../types";

/**
 * Gemini AI Integration has been removed.
 * These stubs are kept to prevent import errors during the transition.
 */

export const getAIPersonalizedAdvice = async (
  _health: HealthData,
  _aqi: AQIData,
  _analysis: BreathAnalysis
): Promise<string> => {
  return Promise.resolve("AI Consultation is currently disabled.");
};

export const getAIPersonalizedNutrition = async (
  _history: SavedAnalysis[]
): Promise<any> => {
  return Promise.resolve(null);
};