import React, { useState, useEffect, useCallback } from 'react';
import { AppState, HealthData, AQIData } from './types';
import { fetchLocationAQI, calculateBreathHealth } from './services/healthService';
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
      if (err?.message === "WAQI_TOKEN_MISSING") {
        setState(prev => ({ ...prev, error: "Setup Required: Please add VITE_WAQI_API_KEY to your Vercel Environment Variables." }));
      } else {
        setState(prev => ({ ...prev, error: "Could not retrieve local air quality data. Please check your network." }));
      }
    }
  }, []);

  const refreshLocationData = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleFetchAQI(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setState(prev => ({ ...prev, error: "Location access denied. Please enable GPS for real-time environment data." }));
        }
      );
    }
  }, [handleFetchAQI]);

  useEffect(() => {
    refreshLocationData();
  }, [refreshLocationData]);

  const handleAnalysis = (healthData: HealthData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Simulate a brief calculation delay for UX feedback
    setTimeout(() => {
      const effectiveAQI: AQIData = state.aqi || {
        aqi: 50,
        city: "Default Location",
        dominantPollutant: "N/A",
        status: "Moderate"
      };

      try {
        const analysis = calculateBreathHealth(healthData, effectiveAQI);
        setState(prev => ({ 
          ...prev, 
          userInput: healthData, 
          analysis, 
          isLoading: false 
        }));
      } catch (err) {
        setState(prev => ({ ...prev, isLoading: false, error: "Internal processing error. Please check inputs." }));
      }
    }, 800);
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
              SECURE LOCAL ENGINE
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Respiratory Vitals Analyzer</h2>
          <p className="text-slate-500 text-sm">
            Clinical analysis of breath quality based on age, BP, and smoking status correlated with WAQI live environmental data.
          </p>
        </div>

        {state.error && (
          <div className="mb-6 p-4 bg-white border-l-4 border-amber-500 rounded-xl shadow-sm flex items-center gap-3 text-amber-700">
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
            <div className="mt-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Live Integration</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">WAQI API Status</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${state.aqi ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {state.aqi ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
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
                <h3 className="text-lg font-bold text-slate-800">Calculating Respiratory Score...</h3>
                <p className="text-slate-400 text-sm mt-2">Correlating clinical data with local pollutants.</p>
              </div>
            ) : state.analysis ? (
              <Results state={state} />
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center opacity-60 min-h-[400px]">
                <i className="fas fa-heart-pulse text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400">Analysis Engine Ready</h3>
                <p className="text-slate-400 max-w-sm">Enter your vitals to generate a personalized breath wellness report.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 pt-8 text-center text-slate-400 text-[9px] uppercase tracking-[0.2em] font-black">
        <p>&copy; {new Date().getFullYear()} PULMOAI // WAQI INTEGRATED</p>
      </footer>
    </div>
  );
};

export default App;