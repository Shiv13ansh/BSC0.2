import React from 'react';
import { AppState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultsProps {
  state: AppState;
}

const Results: React.FC<ResultsProps> = ({ state }) => {
  const { analysis, aqi, isLoading, error, userInput } = state;

  if (isLoading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-800 font-bold uppercase tracking-widest text-[10px]">Biometric Analysis in Progress...</p>
      </div>
    );
  }

  if (error === "invalid input") {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-red-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl"></i>
        </div>
        <h4 className="text-red-500 font-black text-2xl mb-2 uppercase tracking-tight">Invalid Input</h4>
        <p className="text-slate-500 text-sm font-medium">Please review your vitals for physiological accuracy.</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-transparent rounded-[2rem] border-2 border-dashed border-slate-200/60 p-12 text-center group">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-lungs text-slate-300 text-3xl group-hover:text-blue-400 transition-colors"></i>
        </div>
        <h4 className="text-slate-400 font-bold text-xl mb-2">Engine Ready</h4>
        <p className="text-slate-400 text-sm font-medium">Input your profile to generate a clinical respiratory report.</p>
      </div>
    );
  }

  const chartData = [{ value: analysis.score }, { value: 100 - analysis.score }];
  const scoreColor = analysis.score >= 80 ? '#10b981' : analysis.score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
        <div className="w-44 h-44 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={75} dataKey="value" startAngle={210} endAngle={-30} stroke="none">
                <Cell fill={scoreColor} /><Cell fill="#f1f5f9" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-slate-800">{analysis.score}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Wellness</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.1em]">Clinical Assessment</span>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">Pulmonary Wellness Report</h3>
          <p className="text-slate-500 text-[13px] font-medium leading-relaxed">{analysis.summary}</p>
          <div className="pt-2 flex flex-wrap gap-2">
            {analysis.riskFactors.map((risk, i) => (
              <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-full border border-rose-100">{risk}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <i className="fa-solid fa-notes-medical text-blue-600"></i>
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Standard Recommendations</h4>
          </div>
          <ul className="space-y-4">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                <p className="text-[12px] font-medium text-slate-600 leading-relaxed">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <i className="fa-solid fa-microscope text-blue-600"></i>
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Biometric Markers</h4>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Sugar</span>
              <p className="text-[14px] font-black text-slate-800 mt-1">{userInput?.sugarLevel} mg/dL</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Env AQI</span>
              <p className="text-[14px] font-black text-rose-500 mt-1">{aqi?.aqi || "--"}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase">BP Profile</span>
              <p className="text-[14px] font-black text-slate-800 mt-1">{userInput?.systolicBP}/{userInput?.diastolicBP}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Source</span>
              <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-tighter truncate">{aqi?.source}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;