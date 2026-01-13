import React, { useState, useEffect, useCallback } from 'react';
import { AppState, HealthData, AQIData } from './types';
import { fetchLocationAQI, getHealthAnalysis } from './services/geminiService';
import InputForm from './components/InputForm';
import Results from './components/Results';

const App: React.FC = () => {
  const [waqiToken, setWaqiToken] = useState<string>(localStorage.getItem('WAQI_TOKEN') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [state, setState] = useState<AppState>({
    userInput: null,
    aqi: null,
    analysis: null,
    isLoading: false,
    error: null,
  });

  const checkKeys = () => {
    // Note: We check process.env.API_KEY directly as it should be provided by the host.
    const gemini = !!process.env.API_KEY;
    const waqi = !!waqiToken || !!(process.env as any).WAQI_API_KEY;
    return { gemini, waqi };
  };

  const handleFetchAQI = useCallback(async (lat: number, lon: number, token?: string) => {
    try {
      const aqiData = await fetchLocationAQI(lat, lon, token);
      setState(prev => ({ ...prev, aqi: aqiData }));
    } catch (err) {
      console.error("AQI fetch failed:", err);
    }
  }, []);

  const refreshLocationData = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleFetchAQI(position.coords.latitude, position.coords.longitude, waqiToken);
        },
        (error) => {
          console.warn("Geolocation denied.");
          setState(prev => ({ ...prev, error: "Location access was denied. Analysis will use general environmental data." }));
        }
      );
    }
  }, [handleFetchAQI, waqiToken]);

  useEffect(() => {
    refreshLocationData();
  }, [refreshLocationData]);

  const saveWaqiToken = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('WAQI_TOKEN', waqiToken);
    setShowSettings(false);
    refreshLocationData();
  };

  const handleAnalysis = async (healthData: HealthData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
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
      console.error("ANALYSIS_ERROR:", err);
      
      let errorMessage = "Failed to generate health analysis. ";
      
      if (err?.message?.includes('API_KEY_NOT_FOUND')) {
        errorMessage += "Gemini API key is missing. Please check your environment variables.";
      } else if (err?.message?.includes('401') || err?.message?.includes('invalid')) {
        errorMessage += "The provided API key is invalid or unauthorized.";
      } else if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
        errorMessage += "Please check your internet connection and try again.";
      } else {
        errorMessage += err?.message || "An unexpected error occurred.";
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">API Configuration</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              To get hyper-local real-time AQI data, provide a World Air Quality Index (WAQI) token.
            </p>
            <form onSubmit={saveWaqiToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">WAQI API Token</label>
                <div className="relative">
                  <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input
                    type="password"
                    value={waqiToken}
                    onChange={(e) => setWaqiToken(e.target.value)}
                    placeholder="Enter your WAQI token..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Don't have one? Get it free at <a href="https://aqicn.org/data-platform/token/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">aqicn.org/data-platform/token</a>
              </p>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Save & Update Data
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <i className="fas fa-lungs text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Pulmo<span className="text-blue-600">AI</span></h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${checkKeys().gemini ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                GEMINI: {checkKeys().gemini ? 'OK' : 'ERR'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${checkKeys().waqi ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                WAQI: {checkKeys().waqi ? 'LIVE' : 'SEARCH'}
              </span>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all"
              title="API Settings"
            >
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Understand Your Breathing</h2>
          <p className="text-slate-500 text-sm">
            Combine your personal health metrics with real-time environmental data for a comprehensive respiratory wellness score.
          </p>
        </div>

        {state.error && (
          <div className="mb-6 p-5 bg-white border-l-4 border-red-500 rounded-xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-circle-exclamation text-red-500"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm">System Notification</h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{state.error}</p>
            </div>
            {!checkKeys().waqi && (
              <button onClick={() => setShowSettings(true)} className="text-xs font-bold text-blue-600 hover:underline">
                Add WAQI Key
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <InputForm onSubmit={handleAnalysis} isLoading={state.isLoading} />
            <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                <i className="fas fa-calculator mr-2 text-blue-600"></i> Logic & AI Insights
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                PulmoAI uses advanced generative reasoning to correlate your physiological data (Age, BP, Habits) with current environmental stressors (AQI) to assess potential respiratory strain.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {state.isLoading ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-[400px]">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI Analyzing Breath Profile...</h3>
                <p className="text-slate-500 max-w-sm">Correlating vitals with local environmental patterns to generate your insights.</p>
              </div>
            ) : state.analysis ? (
              <Results state={state} />
            ) : (
              <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center opacity-60 min-h-[400px]">
                <i className="fas fa-chart-line text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400">Awaiting Calculation</h3>
                <p className="text-slate-400 max-w-sm">Complete the health profile on the left to see your personalized analysis and score.</p>
                {!checkKeys().waqi && (
                  <button onClick={() => setShowSettings(true)} className="mt-4 text-xs font-bold text-blue-500 hover:text-blue-700">
                    <i className="fas fa-plus-circle mr-1"></i> Add WAQI Key for Live AQI
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} PulmoAI Health. For informational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;