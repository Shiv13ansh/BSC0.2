import React, { useState, useEffect, useCallback } from 'react';
import { AppState, HealthData, SavedAnalysis } from './types';
import { fetchLocationAQI, calculateBreathHealth } from './services/healthService';
import InputForm from './components/InputForm';
import Results from './components/Results';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Insurance from './components/Insurance';
import NutritionPage from './components/NutritionPage';

type ViewMode = 'analyzer' | 'dashboard' | 'insurance' | 'nutrition';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('analyzer');
  const [state, setState] = useState<AppState>(() => {
    const savedEmail = localStorage.getItem('pulmo_user_email');
    let savedHistory: SavedAnalysis[] = [];
    
    if (savedEmail) {
      const historyKey = `pulmo_history_${savedEmail}`;
      try {
        savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    return {
      userInput: null,
      aqi: null,
      analysis: null,
      isLoading: false,
      error: null,
      userEmail: savedEmail,
      history: savedHistory,
    };
  });

  const handleFetchAQI = useCallback(async (lat: number, lon: number) => {
    try {
      const aqiData = await fetchLocationAQI(lat, lon);
      setState(prev => ({ ...prev, aqi: aqiData }));
    } catch (err) {
      console.error("AQI Fetch Error", err);
    }
  }, []);

  useEffect(() => {
    if (state.userEmail && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => handleFetchAQI(p.coords.latitude, p.coords.longitude),
        () => setState(prev => ({ ...prev, error: "Location access denied." }))
      );
    }
  }, [handleFetchAQI, state.userEmail]);

  const handleLogin = (email: string) => {
    localStorage.setItem('pulmo_user_email', email);
    const historyKey = `pulmo_history_${email}`;
    const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setState(prev => ({ 
      ...prev, 
      userEmail: email, 
      history: savedHistory,
      analysis: null,
      userInput: null 
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('pulmo_user_email');
    setState(prev => ({ 
      ...prev, 
      userEmail: null, 
      analysis: null, 
      userInput: null,
      history: []
    }));
    setView('analyzer');
  };

  const handleAnalysis = (healthData: HealthData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, analysis: null }));
    
    setTimeout(() => {
      try {
        const effectiveAQI = state.aqi || { aqi: 45, city: "Sample Station", dominantPollutant: "PM25", status: "Good", source: "Simulation" };
        const analysis = calculateBreathHealth(healthData, effectiveAQI);

        const newRecord: SavedAnalysis = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(), // Use ISO string for reliable sorting/formatting
          healthData: { ...healthData },
          analysis: { ...analysis },
          aqi: { ...effectiveAQI }
        };

        setState(prev => {
          const updatedHistory = [newRecord, ...prev.history].slice(0, 50);
          if (prev.userEmail) {
            localStorage.setItem(`pulmo_history_${prev.userEmail}`, JSON.stringify(updatedHistory));
          }
          return { 
            ...prev, 
            userInput: healthData, 
            analysis, 
            isLoading: false,
            error: null,
            history: updatedHistory
          };
        });
      } catch (err: any) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: err.message === "invalid input" ? "invalid input" : "Analysis failed." 
        }));
      }
    }, 800);
  };

  if (!state.userEmail) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-12 bg-[#f8fafc]">
      <header className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <i className="fas fa-lungs text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">PulmoAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged In</span>
              <span className="text-[12px] font-bold text-slate-700">{state.userEmail}</span>
            </div>
            <button onClick={handleLogout} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all shadow-sm">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
          <button onClick={() => setView('analyzer')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${view === 'analyzer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Analyzer</button>
          <button onClick={() => setView('dashboard')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${view === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>History</button>
          <button onClick={() => setView('nutrition')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${view === 'nutrition' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Nutrition</button>
          <button onClick={() => setView('insurance')} className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${view === 'insurance' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Marketplace</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'analyzer' && (
          <>
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <h2 className="text-4xl font-black text-[#0f172a] mb-2 tracking-tight">Respiratory Intelligence</h2>
              <p className="text-slate-500 text-sm max-w-2xl mx-auto font-medium"> Clinical correlation between metabolic vitals and live environmental toxicity.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <InputForm onSubmit={handleAnalysis} isLoading={state.isLoading} />
              </div>
              <Results state={state} />
            </div>
          </>
        )}
        {view === 'dashboard' && <Dashboard history={state.history} userEmail={state.userEmail} />}
        {view === 'nutrition' && <NutritionPage history={state.history} />}
        {view === 'insurance' && <Insurance state={state} />}
      </main>
    </div>
  );
};

export default App;