
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, HealthData, AQIData } from './types';
import { fetchLocationAQI, getHealthAnalysis } from './services/geminiService';
import InputForm from './components/InputForm';
import Results from './components/Results';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    userInput: null,
    aqi: null,
    analysis: null,
    isLoading: false,
    error: null,
  });

  const handleFetchAQI = useCallback(async (lat: number, lon: number) => {
    try {
      const aqiData = await fetchLocationAQI(lat, lon);
      setState(prev => ({ ...prev, aqi: aqiData }));
    } catch (err) {
      console.error("AQI fetch failed:", err);
      // Fallback or silent fail
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleFetchAQI(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied, using global default context.");
          setState(prev => ({ ...prev, error: "Location access denied. AQI results might be generalized." }));
        }
      );
    }
  }, [handleFetchAQI]);

  const handleAnalysis = async (healthData: HealthData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Use placeholder AQI if real AQI not yet loaded
      const effectiveAQI: AQIData = state.aqi || {
        aqi: 50,
        city: "Unknown",
        dominantPollutant: "N/A",
        status: "Moderate (Estimated)"
      };

      const analysis = await getHealthAnalysis(healthData, effectiveAQI);
      setState(prev => ({ 
        ...prev, 
        userInput: healthData, 
        analysis, 
        isLoading: false 
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to generate health analysis. Please check your network or API key." 
      }));
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <i className="fas fa-lungs text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Pulmo<span className="text-blue-600">AI</span></h1>
          </div>
          <div className="hidden sm:flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest space-x-4">
            <span>Clinical Insights</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Real-time AQI</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Powered by Gemini</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Understand Your Breathing</h2>
          <p className="text-slate-500">
            Combine your personal health metrics with real-time environmental data for a comprehensive respiratory wellness score.
          </p>
        </div>

        {state.error && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl flex items-center">
            <i className="fas fa-exclamation-triangle mr-3"></i>
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <InputForm onSubmit={handleAnalysis} isLoading={state.isLoading} />
            
            <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                <i className="fas fa-info-circle mr-2"></i> How it works
              </h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                PulmoAI calculates your score using a weighted algorithm considering Age-related lung capacity, 
                Cardiovascular strain from Blood Pressure, and direct toxin impact from Smoking and AQI levels.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {state.isLoading ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI Analyzing Breath Profile...</h3>
                <p className="text-slate-500 max-w-sm">
                  We're correlating your vitals with local environmental patterns to generate your insights.
                </p>
              </div>
            ) : state.analysis ? (
              <Results state={state} />
            ) : (
              <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center opacity-60">
                <i className="fas fa-chart-line text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400">Awaiting Calculation</h3>
                <p className="text-slate-400 max-w-sm">
                  Complete the health profile on the left to see your personalized analysis and score.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} PulmoAI Health. For informational purposes only. Consult a doctor for medical advice.</p>
      </footer>
    </div>
  );
};

export default App;
