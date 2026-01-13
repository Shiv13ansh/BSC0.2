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
      setState(prev => ({ ...prev, aqi: aqiData, error: null }));
    } catch (err: any) {
      console.error("AQI fetch failed:", err);
      if (err?.message === "API_KEY_NOT_FOUND") {
        setState(prev => ({ ...prev, error: "Setup Required: Please add VITE_GEMINI_API_KEY to your Vercel Environment Variables." }));
      }
    }
  }, []);

  const refreshLocationData = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleFetchAQI(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setState(prev => ({ ...prev, error: "Location access denied. Using estimated environmental data." }));
          handleFetchAQI(0, 0); // Fallback
        }
      );
    }
  }, [handleFetchAQI]);

  useEffect(() => {
    refreshLocationData();
  }, [refreshLocationData]);

  const handleAnalysis = async (healthData: HealthData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const effectiveAQI: AQIData = state.aqi || {
        aqi: 50,
        city: "Default",
        dominantPollutant: "N/A",
        status: "Moderate"
      };

      const analysis = await getHealthAnalysis(healthData, effectiveAQI);
      setState(prev => ({ 
        ...prev, 
        userInput: healthData, 
        analysis, 
        isLoading: false 
      }));
    } catch (err: any) {
      console.error("ANALYSIS_ERROR:", err);
      let errorMessage = "Analysis Failed: ";
      
      const msg = err?.message?.toLowerCase() || "";
      
      if (msg === 'api_key_not_found') {
        errorMessage = "Configuration Error: VITE_GEMINI_API_KEY is not set in Vercel.";
      } else if (msg.includes('429') || msg.includes('resource_exhausted')) {
        errorMessage = "Google Gemini is currently busy (Rate Limit Reached). Please wait 60 seconds and try again.";
      } else if (msg.includes('api key not valid')) {
        errorMessage = "Invalid API Key: The Gemini key in your environment variables is not recognized by Google.";
      } else {
        errorMessage += "Unable to reach Google's AI. Check your connection.";
      }

      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <i className="fas fa-lungs text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Pulmo<span className="text-blue-600">AI</span></h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              VERCEL SECURE SYNC
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Respiratory Wellness Engine</h2>
          <p className="text-slate-500 text-sm">
            AI-driven analysis of vitals and live environmental factors. Powered by your private Vercel keys.
          </p>
        </div>

        {state.error && (
          <div className="mb-6 p-4 bg-white border-l-4 border-amber-500 rounded-xl shadow-sm flex items-center gap-3 text-amber-700">
            <i className="fas fa-exclamation-circle text-lg"></i>
            <div className="flex-1 text-sm font-semibold">{state.error}</div>
            <button onClick={() => window.location.reload()} className="text-xs font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors uppercase">
              Refresh
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <InputForm onSubmit={handleAnalysis} isLoading={state.isLoading} />
            <div className="mt-6 p-4 bg-slate-100 border border-slate-200 rounded-2xl">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Checks</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Gemini API Connection</span>
                  <i className={`fas fa-circle text-[8px] ${state.error?.includes('Configuration') ? 'text-red-400' : 'text-emerald-400'}`}></i>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">WAQI Service</span>
                  <i className={`fas fa-circle text-[8px] ${state.aqi?.source?.includes('WAQI') ? 'text-emerald-400' : 'text-slate-300'}`}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {state.isLoading ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-[400px]">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Analyzing Your Breath Profile...</h3>
                <p className="text-slate-400 text-sm mt-2">Checking Google's environmental dataset.</p>
              </div>
            ) : state.analysis ? (
              <Results state={state} />
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center opacity-60 min-h-[400px]">
                <i className="fas fa-microchip text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400">Ready for Analysis</h3>
                <p className="text-slate-400 max-w-sm">Enter your clinical data to generate a real-time health score.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 pt-8 text-center text-slate-400 text-[9px] uppercase tracking-[0.2em] font-black">
        <p>&copy; {new Date().getFullYear()} PULMOAI // SECURE DATA PROTOCOL</p>
      </footer>
    </div>
  );
};

export default App;