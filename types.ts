
export enum SmokingStatus {
  NEVER = 'Never Smoked',
  FORMER = 'Former Smoker',
  LIGHT = 'Light Smoker (1-10/day)',
  HEAVY = 'Heavy Smoker (10+/day)'
}

export interface HealthData {
  age: number;
  systolicBP: number;
  diastolicBP: number;
  smokingStatus: SmokingStatus;
}

export interface AQIData {
  aqi: number;
  city: string;
  dominantPollutant: string;
  status: string;
  source?: string;
}

export interface BreathAnalysis {
  score: number;
  summary: string;
  recommendations: string[];
  riskFactors: string[];
}

export interface AppState {
  userInput: HealthData | null;
  aqi: AQIData | null;
  analysis: BreathAnalysis | null;
  isLoading: boolean;
  error: string | null;
}
