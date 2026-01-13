import { HealthData, AQIData, BreathAnalysis, SmokingStatus } from "../types";

const getAQIStatus = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  return "Hazardous";
};

export const calculateBreathHealth = (health: HealthData, aqiData: AQIData): BreathAnalysis => {
  let score = 100;

  // 1. Smoking Impact
  const smokingImpacts = {
    [SmokingStatus.NEVER]: 0,
    [SmokingStatus.FORMER]: 15,
    [SmokingStatus.LIGHT]: 35,
    [SmokingStatus.HEAVY]: 55,
  };
  score -= smokingImpacts[health.smokingStatus];

  // 2. Blood Pressure Impact
  if (health.systolicBP >= 140 || health.diastolicBP >= 90) {
    score -= 20; // Stage 2 Hypertension
  } else if (health.systolicBP >= 130 || health.diastolicBP >= 80) {
    score -= 10; // Stage 1 Hypertension
  } else if (health.systolicBP > 120) {
    score -= 5; // Elevated
  }

  // 3. Age Impact (gradual decline factor after 30)
  if (health.age > 30) {
    score -= Math.min(15, (health.age - 30) * 0.3);
  }

  // 4. AQI Impact
  const aqiScore = aqiData.aqi;
  if (aqiScore > 50) {
    score -= Math.min(30, (aqiScore - 50) * 0.2);
  }

  // Final score clamping
  score = Math.max(5, Math.min(100, Math.round(score)));

  // Dynamic Summaries
  let summary = "";
  if (score > 85) summary = "Excellent respiratory resilience. Your vitals and environmental exposure indicate optimal lung capacity and low risk of chronic obstruction.";
  else if (score > 70) summary = "Good respiratory health. While some minor stressors are present, your core pulmonary function appears stable and well-maintained.";
  else if (score > 50) summary = "Moderate respiratory strain detected. Current lifestyle factors or environmental conditions are placing measurable stress on your respiratory system.";
  else summary = "Significant respiratory risk identified. The combination of your physical profile and environmental stressors suggests compromised lung efficiency.";

  // Dynamic Recommendations
  const recommendations: string[] = [];
  if (health.smokingStatus !== SmokingStatus.NEVER) recommendations.push("Consult a specialist regarding smoking cessation and lung recovery protocols.");
  if (aqiData.aqi > 100) recommendations.push("High outdoor pollution detected. Utilize high-efficiency indoor air purifiers and wear an N95 mask outdoors.");
  if (health.systolicBP > 130) recommendations.push("Cardiovascular stress linked to respiratory efficiency. Monitor your BP and reduce sodium intake.");
  if (health.age > 50) recommendations.push("Perform regular cardiovascular exercise (swimming/cycling) to maintain lung elasticity.");
  if (recommendations.length < 3) recommendations.push("Maintain deep breathing exercises daily to maximize alveolar gas exchange.");

  // Risk Factors
  const riskFactors: string[] = [];
  if (health.smokingStatus === SmokingStatus.HEAVY) riskFactors.push("High COPD Risk");
  if (aqiData.aqi > 150) riskFactors.push("Acute Pollutant Exposure");
  if (health.systolicBP > 140) riskFactors.push("Hypertension Stress");
  if (riskFactors.length === 0) riskFactors.push("Minimal Environmental Stress");

  return {
    score,
    summary,
    recommendations,
    riskFactors
  };
};

export const fetchLocationAQI = async (lat: number, lon: number): Promise<AQIData> => {
  const waqiToken = process.env.WAQI_API_KEY?.trim();

  if (!waqiToken || waqiToken === "" || waqiToken === "undefined") {
    throw new Error("WAQI_TOKEN_MISSING");
  }

  try {
    const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiToken}`);
    const result = await response.json();
    
    if (result.status === 'ok') {
      return {
        aqi: result.data.aqi,
        city: result.data.city.name,
        dominantPollutant: result.data.dominentpol?.toUpperCase() || "N/A",
        status: getAQIStatus(result.data.aqi),
        source: "WAQI (Live Feed)",
        groundingSources: []
      };
    } else {
      throw new Error("WAQI_API_ERROR");
    }
  } catch (err) {
    console.error("AQI fetch error:", err);
    return {
      aqi: 0,
      city: "Unknown Location",
      dominantPollutant: "N/A",
      status: "Data Unavailable",
      source: "Error",
      groundingSources: []
    };
  }
};