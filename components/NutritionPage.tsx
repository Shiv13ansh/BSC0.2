import React, { useState, useEffect } from 'react';
import { SavedAnalysis } from '../types';
import { getAlgorithmicNutrition, NutritionalRequirement } from '../services/nutritionService';

interface NutritionPageProps {
  history: SavedAnalysis[];
}

const NutritionPage: React.FC<NutritionPageProps> = ({ history }) => {
  const [algoNutrition, setAlgoNutrition] = useState<NutritionalRequirement[]>([]);

  useEffect(() => {
    if (history.length > 0) {
      setAlgoNutrition(getAlgorithmicNutrition(history));
    }
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <i className="fa-solid fa-apple-whole text-slate-200 text-4xl"></i>
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Insufficient Health Data</h3>
        <p className="text-slate-400 text-sm max-w-sm">Complete at least one wellness analysis to unlock your algorithmic nutritional blueprint.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <i className="fa-solid fa-carrot text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Dietary Bio-Intervention</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Calculated from {history.length} historical vitals</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            Metabolic Sync Active
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between ml-2">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Expert Algorithmic Requirements</h4>
          <span className="text-[9px] text-slate-400 font-medium">Based on clinical dietary guidelines</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algoNutrition.length > 0 ? (
            algoNutrition.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group border-b-4 border-b-transparent hover:border-b-emerald-500">
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${item.impact === 'High' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-blue-50 text-blue-500 border border-blue-100'}`}>
                    {item.impact} Priority
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                    <i className="fa-solid fa-dna text-sm"></i>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">{item.nutrient}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{item.reason}</p>
                
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Recommended Sources</span>
                  <div className="flex flex-wrap gap-2">
                    {item.sources.map((src, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Your current vitals do not trigger specific algorithmic dietary interventions.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-circle-info text-xl"></i>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-800">Expert System Logic</h4>
            <p className="text-xs text-slate-500 font-medium">How your nutrition plan is generated</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          The PulmoAI Nutritional Engine monitors your historical data for trends in Blood Sugar, Blood Pressure, and Smoking habits. When stressors cross clinical thresholds (e.g., Sugar > 140 mg/dL or AQI > 100), the system automatically triggers specific nutrient mandates designed to lower airway inflammation and protect pulmonary vascular integrity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Trigger</span>
            <span className="text-xs font-bold text-slate-700">Elevated Sugar</span>
            <p className="text-[10px] text-slate-500 mt-1">Triggers Anti-inflammatory mandates.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Trigger</span>
            <span className="text-xs font-bold text-slate-700">Poor AQI History</span>
            <p className="text-[10px] text-slate-500 mt-1">Triggers Antioxidant mandates.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Trigger</span>
            <span className="text-xs font-bold text-slate-700">Hypertension</span>
            <p className="text-[10px] text-slate-500 mt-1">Triggers Vascular Support mandates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;