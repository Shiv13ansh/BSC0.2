import React, { useState, useEffect, useCallback } from 'react';
import { AppState, HealthData, AQIData } from './types';
import { fetchLocationAQI, getHealthAnalysis } from './services/geminiService';
import InputForm from './components/InputForm';
import Results from './components/Results';

const App: React.FC = () => {
  const [waqiToken, setWaqiToken] = useState<string>(localStorage.getItem('WAQI_TOKEN') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [state, setState] = useState<AppState>({
    userInput: null,
    aqi: null,
    analysis: null,
    isLoading: false,
    error: null,
  });

  const checkPersonalKey = async () => {
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setHasPersonalKey(hasKey);
      return hasKey;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    checkPersonalKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      setHasPersonalKey(true);
      setState(prev => ({ ...prev, error: null }));
    } catch (err) {
      console.error("Failed to open key selector:", err);
    }
  };

  const checkKeys = () => {
    const gemini = !!process.env.API_KEY;
    return { gemini, personal: hasPersonalKey };
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
          console.warn("Geolocation denied. Using default fallback.");
          setState(prev => ({ ...prev, error: "Location access denied. AQI will be estimated." }));
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
      
      if (err?.message?.includes('Requested entity was not found.')) {
        setHasPersonalKey(false);
        handleOpenKeyDialog();
        return;
      }

      let errorMessage = "Failed to generate health analysis. ";
      
      if (err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "Daily API limit reached. Please use your personal API key or try again later.";
      } else if (err?.message?.includes('API_KEY_NOT_FOUND')) {
        errorMessage += "System API key missing. Please contact administrator.";
      } else {
        errorMessage += err?.message || "An unexpected error occurred.";
      }

      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Security & Keys</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              <section className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <i className="fas fa-shield-halved mr-2"></i>
                  <strong>Privacy Note:</strong> This app uses Google Search grounding by default to fetch AQI data. Your private keys are handled on the server and never exposed to other users.
                </p>
              </section>

              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center">
                  <i className="fas fa-robot mr-2"></i> AI Quota Management
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-slate-600">Personal API Key</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasPersonalKey ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {hasPersonalKey ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <button
                    onClick={handleOpenKeyDialog}
                    className="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-key text-blue-500"></i>
                    {hasPersonalKey ? 'Switch Personal Key' : 'Add Personal Key'}
                  </button>
                </div>
              </section>

              <div className="h-px bg-slate-100"></div>

              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center">
                  <i className="fas fa-wind mr-2"></i> High-Precision AQI (Optional)
                </h4>
                <form onSubmit={saveWaqiToken} className="space-y-4">
                  <div className="relative">
                    <i className="fas fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input
                      type="password"
                      value={waqiToken}
                      onChange={(e) => setWaqiToken(e.target.value)}
                      placeholder="Enter local WAQI token..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    Apply Precision Token
                  </button>
                </form>
              </section>
            </div>
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
            <span className={`hidden sm:inline text-[10px] font-bold px-2 py-1 rounded-full border ${checkKeys().personal ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              {checkKeys().personal ? 'PRIVATE MODE' : 'STANDARD MODE'}
            </span>
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all"
            >
              <i className="fas fa-shield-alt"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Secure Respiratory Analysis</h2>
          <p className="text-slate-500 text-sm">
            Analysis powered by Gemini Google Search grounding. Your data stays between you and the AI.
          </p>
        </div>

        {state.error && (
          <div className="mb-6 p-5 bg-white border-l-4 border-amber-500 rounded-xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-info-circle text-amber-500"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm">System Update</h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{state.error}</p>
              {state.error.includes('limit') && (
                <button onClick={handleOpenKeyDialog} className="mt-2 text-xs font-bold text-blue-600 underline">
                  Activate Personal Key for Unlimited Access
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <InputForm onSubmit={handleAnalysis} isLoading={state.isLoading} />
          </div>

          <div className="lg:col-span-7">
            {state.isLoading ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-[400px]">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Generating Secure Insights...</h3>
                <p className="text-slate-500 max-w-sm">Cross-referencing your vitals with current environmental search data.</p>
              </div>
            ) : state.analysis ? (
              <Results state={state} />
            ) : (
              <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center opacity-60 min-h-[400px]">
                <i className="fas fa-user-shield text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400">Secure Analysis Ready</h3>
                <p className="text-slate-400 max-w-sm">Enter your details to generate a private health report.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;