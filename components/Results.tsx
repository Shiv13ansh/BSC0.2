import React from 'react';
import { AppState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultsProps {
  state: AppState;
}

const Results: React.FC<ResultsProps> = ({ state }) => {
  const { analysis, aqi } = state;

  if (!analysis) return null;

  const chartData = [
    { name: 'Score', value: analysis.score },
    { name: 'Remaining', value: 100 - analysis.score }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={getScoreColor(analysis.score)} />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black" style={{ color: getScoreColor(analysis.score) }}>
                {analysis.score}
              </span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Wellness</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-2">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">Breath Summary</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">Pulmonary Profile Analysis</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              {analysis.summary}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {analysis.riskFactors.map((risk, i) => (
                <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-slate-200 shadow-sm">
                  {risk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center uppercase tracking-widest">
            <i className="fas fa-clipboard-check text-blue-500 mr-2"></i>
            Recommendations
          </h4>
          <ul className="space-y-4">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start text-xs font-medium text-slate-600">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-3 shrink-0"></span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center uppercase tracking-widest">
            <i className="fas fa-satellite text-blue-500 mr-2"></i>
            Environment Live
          </h4>
          {aqi ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">City</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{aqi.city}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">AQI</p>
                  <p className={`text-xs font-black ${aqi.aqi > 100 ? 'text-red-500' : 'text-emerald-500'}`}>{aqi.aqi}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Pollutant</p>
                  <p className="text-xs font-bold text-slate-700">{aqi.dominantPollutant}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{aqi.status}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Source: <span className="text-blue-500">WAQI Project</span>
                </p>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Live Feed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-xs text-slate-400 italic">Syncing environmental data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;