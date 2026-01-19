
import { HealthData, AQIData, BreathAnalysis, SmokingStatus, RespiratoryDisease } from "../types";

const getAQIStatus = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  return "Hazardous";
};

/**
 * SCORING LOGIC EXPLANATION:
 * 1. Base Score: 100
 * 2. Smoking: -15 (Former), -35 (Light), -55 (Heavy). Smoking reduces lung elasticity and cilia function.
 * 3. Blood Pressure: -5 (120-129 SBP), -10 (130-139 SBP or 80-89 DBP), -20 (140+ SBP or 90+ DBP). Hypertension increases pulmonary arterial pressure.
 * 4. Blood Sugar: -15 (141-200 or 60-69), -25 (>200 or <60). High glucose is a systemic inflammatory marker that narrows bronchial paths.
 * 5. Respiratory History: -20 base if any disease exists. -10 for each specific disease selected (capped at -30 extra).
 * 6. Environment (AQI): Starts deducting after AQI 50. Deduction = (AQI - 50) * 0.2. High AQI indicates particulate matter that triggers bronchospasm.
 */
export const calculateBreathHealth = (health: HealthData, aqiData: AQIData): BreathAnalysis => {
  // Validation
  if (
    health.age <= 0 || health.age > 125 ||
    health.systolicBP < 40 || health.systolicBP > 300 ||
    health.diastolicBP < 20 || health.diastolicBP > 200 ||
    health.systolicBP <= health.diastolicBP ||
    health.sugarLevel <= 0 || health.sugarLevel > 1000
  ) {
    throw new Error("invalid input");
  }

  let score = 100;
  const riskFactors: string[] = [];
  const recommendations: string[] = ["Perform deep breathing exercises (4-7-8 technique) daily."];

  // 1. Smoking Impact (Max -55)
  const smokingImpacts = {
    [SmokingStatus.NEVER]: 0,
    [SmokingStatus.FORMER]: 15,
    [SmokingStatus.LIGHT]: 35,
    [SmokingStatus.HEAVY]: 55,
  };
  score -= smokingImpacts[health.smokingStatus];
  if (health.smokingStatus === SmokingStatus.HEAVY) riskFactors.push("High Smoking Toxicity");

  // 2. Blood Pressure Impact (Max -20)
  if (health.systolicBP >= 140 || health.diastolicBP >= 90) {
    score -= 20;
    recommendations.push("Hypertension detected; consult a doctor to reduce pulmonary strain.");
    riskFactors.push("Pulmonary Vascular Stress");
  } else if (health.systolicBP >= 130 || health.diastolicBP >= 80) {
    score -= 10;
  } else if (health.systolicBP >= 120) {
    score -= 5;
  }

  // 3. Sugar Level Factor (Max -25)
  if (health.sugarLevel > 200 || health.sugarLevel < 60) {
    score -= 25;
    riskFactors.push("Critical Metabolic Dysfunction");
    recommendations.push("High/Low sugar: Glycemic control is vital for reducing airway inflammation.");
  } else if (health.sugarLevel > 140 || health.sugarLevel < 70) {
    score -= 15;
    riskFactors.push("Mild Glycemic Stress");
  }

  // 4. Respiratory Condition Impact (Max -50)
  if (health.hasRespiratoryProblem) {
    score -= 20; // Base
    const extraPenalty = Math.min(30, health.selectedDiseases.length * 10);
    score -= extraPenalty;
    recommendations.push("Stay consistent with prescribed respiratory maintenance therapy.");
    if (health.selectedDiseases.length > 0) {
      riskFactors.push(`Active ${health.selectedDiseases[0]} Management`);
    }
  }

  // 5. Environmental Factor (Max -30)
  if (aqiData.aqi > 50) {
    const aqiPenalty = Math.min(30, (aqiData.aqi - 50) * 0.2);
    score -= aqiPenalty;
    if (aqiData.aqi > 100) {
      riskFactors.push("High Particulate Matter Exposure");
      recommendations.push("Current local air quality is poor; use air filtration indoors.");
    }
  }

  score = Math.max(5, Math.min(100, Math.round(score)));

  let summary = "";
  if (score > 85) summary = "Optimal. Your vitals and metabolic markers indicate high respiratory efficiency.";
  else if (score > 70) summary = "Sub-optimal. Noticeable stressors from habits or environment are present.";
  else if (score > 50) summary = "Compromised. High inflammation markers (Sugar/BP) are affecting oxygen exchange.";
  else summary = "High Risk. Multiple critical physiological and environmental stressors detected.";

  return { score, summary, recommendations, riskFactors };
};

export const fetchLocationAQI = async (lat: number, lon: number): Promise<AQIData> => {
  const waqiToken = process.env.WAQI_API_KEY;
  
  if (!waqiToken || waqiToken === "" || waqiToken === "undefined") {
    console.warn("WAQI API Key missing. Using simulated data.");
    return { aqi: 45, city: "Virtual Node (Simulated)", status: "Good", dominantPollutant: "PM2.5", source: "Simulation" };
  }

  try {
    const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiToken}`);
    const result = await response.json();
    if (result.status === 'ok') {
      return {
        aqi: result.data.aqi,
        city: result.data.city.name,
        dominantPollutant: result.data.dominentpol?.toUpperCase() || "PM2.5",
        status: getAQIStatus(result.data.aqi),
        source: "Live WAQI Feed"
      };
    }
    throw new Error(result.data || "API Error");
  } catch (err) {
    console.error("AQI Fetch Error:", err);
    return { aqi: 50, city: "Fallback Station", status: "Moderate", dominantPollutant: "N/A", source: "Fallback" };
  }
};
