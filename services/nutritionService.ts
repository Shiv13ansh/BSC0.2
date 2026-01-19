
import { SavedAnalysis, SmokingStatus } from "../types";

export interface NutritionalRequirement {
  nutrient: string;
  reason: string;
  sources: string[];
  impact: 'High' | 'Medium';
}

export const getAlgorithmicNutrition = (history: SavedAnalysis[]): NutritionalRequirement[] => {
  if (history.length === 0) return [];

  const latest = history[0];
  const avgSugar = history.reduce((acc, h) => acc + h.healthData.sugarLevel, 0) / history.length;
  const avgAQI = history.reduce((acc, h) => acc + (h.aqi?.aqi || 0), 0) / history.length;
  
  const requirements: NutritionalRequirement[] = [];

  // 1. Glycemic Control Logic
  if (avgSugar > 140) {
    requirements.push({
      nutrient: "Magnesium & Fiber",
      reason: "Consistent elevated sugar levels increase bronchial inflammation.",
      sources: ["Spinach", "Pumpkin Seeds", "Quinoa", "Lentils"],
      impact: 'High'
    });
  }

  // 2. Antioxidant Defense (Smoking/AQI)
  if (latest.healthData.smokingStatus !== SmokingStatus.NEVER || avgAQI > 100) {
    requirements.push({
      nutrient: "Vitamin C & E",
      reason: "To neutralize oxidative stress from particulate matter and tobacco toxicity.",
      sources: ["Guava", "Bell Peppers", "Almonds", "Sunflower Seeds"],
      impact: 'High'
    });
  }

  // 3. Pulmonary Vascular Support (BP)
  if (latest.healthData.systolicBP > 130) {
    requirements.push({
      nutrient: "Omega-3 Fatty Acids",
      reason: "Reduces pulmonary arterial pressure and improves oxygen diffusion.",
      sources: ["Walnuts", "Chia Seeds", "Flaxseeds", "Salmon"],
      impact: 'Medium'
    });
  }

  // 4. Lung Repair (Chronic condition)
  if (latest.healthData.hasRespiratoryProblem) {
    requirements.push({
      nutrient: "Beta-Carotene",
      reason: "Supports the integrity of respiratory epithelial lining.",
      sources: ["Carrots", "Sweet Potatoes", "Kale"],
      impact: 'Medium'
    });
  }

  return requirements;
};
