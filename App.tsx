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
    } catch (err: any) {
      console.error("AQI fetch failed:", err);
      if (err?.message === "API_KEY_NOT_FOUND") {
        setState(prev => ({ ...prev, error: "Application Configuration Error: VITE_GEMINI_API_KEY is missing." }));
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
          handleFetchAQI(0, 0); // Fallback coordinates
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
      
      if (err?.message === 'API_KEY_NOT_FOUND') {
        errorMessage = "Configuration Error: Check your VITE_GEMINI_API_KEY in Vercel settings.";
      } else if (err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "Rate Limit Reached: The AI service is currently busy. Please try again in a few minutes.";
      } else {
        errorMessage += "Verify your connection and environment settings.";
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
            <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              AUTOMATED SECURE MODE
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Respiratory Wellness Engine</h2>
          <p className="text-slate-500 text-sm">
            Integrated analysis of vitals and live environmental stressors. Data is processed securely via your dedicated Vercel environment keys.
          </p>
        </div>

        {state.error && (
          <div className="mb-6 p-4 bg-white border-l-4 border-red-500 rounded-xl shadow-sm flex items-center gap-3 text-red-600">
            <i className="fas fa-exclamation-triangle text-lg"></i>
            <div className="flex-1 text-sm font-semibold">{state.error}</div>
            <button onClick={() => window.location.reload()} className="text-xs font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors uppercase">
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <InputForm onSubmit={handleAnalysis} isLoading={state.isLoading} />
            <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Connectivity Status</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-xs text-blue-600">
                  <i className="fas fa-check-circle mr-2 opacity-70"></i>
                  Direct Environment Key Injection
                </li>
                <li className="flex items-center text-xs text-blue-600">
                  <i className="fas fa-check-circle mr-2 opacity-70"></i>
                  Google Search Grounding Fallback
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            {state.isLoading ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-[400px]">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Processing Clinical Data...</h3>
                <p className="text-slate-400 text-sm mt-2">Connecting to your secure Vercel API instance.</p>
              </div>
            ) : state.analysis ? (
              <Results state={state} />
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center opacity-60 min-h-[400px] shadow-inner">
                <i className="fas fa-shield-heart text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400">Secure Link Established</h3>
                <p className="text-slate-400 max-w-sm">Provide your vitals to begin the cross-referenced environmental respiratory analysis.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 pt-8 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
        <p>&copy; {new Date().getFullYear()} PULMOAI SECURE MEDICAL INSIGHTS</p>
      </footer>
    </div>
  );
};

export default App;