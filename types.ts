
export enum SmokingStatus {
  NEVER = 'Never Smoked',
  FORMER = 'Former Smoker',
  LIGHT = 'Light Smoker (1-10/day)',
  HEAVY = 'Heavy Smoker (10+/day)'
}

export enum RespiratoryDisease {
  ASTHMA = 'Asthma',
  COPD = 'COPD',
  BRONCHITIS = 'Chronic Bronchitis',
  EMPHYSEMA = 'Emphysema',
  SLEEP_APNEA = 'Sleep Apnea',
  FIBROSIS = 'Pulmonary Fibrosis',
  CYSTIC_FIBROSIS = 'Cystic Fibrosis',
  PNEUMONIA_HISTORY = 'Frequent Pneumonia'
}

export interface HealthData {
  age: number;
  systolicBP: number;
  diastolicBP: number;
  sugarLevel: number; // mg/dL
  smokingStatus: SmokingStatus;
  hasRespiratoryProblem: boolean;
  selectedDiseases: RespiratoryDisease[];
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

export interface SavedAnalysis {
  id: string;
  timestamp: string;
  healthData: HealthData;
  analysis: BreathAnalysis;
  aqi: AQIData | null;
}

export interface AppState {
  userInput: HealthData | null;
  aqi: AQIData | null;
  analysis: BreathAnalysis | null;
  isLoading: boolean;
  error: string | null;
  userEmail: string | null;
  history: SavedAnalysis[];
}
