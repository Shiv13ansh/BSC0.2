
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
    <div className="space-y-6">
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
              <span className="text-4xl font-bold" style={{ color: getScoreColor(analysis.score) }}>
                {analysis.score}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase">Breath Score</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Analysis Summary</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              {analysis.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.riskFactors.map((risk, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-100">
                  {risk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
            Recommendations
          </h4>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start text-sm text-slate-600">
                <i className="fas fa-check-circle text-emerald-500 mt-1 mr-3"></i>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <i className="fas fa-wind text-blue-500 mr-2"></i>
            Local Environment
          </h4>
          {aqi ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Current Location</p>
                  <p className="font-semibold text-slate-700">{aqi.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase">AQI Index</p>
                  <p className={`font-bold ${aqi.aqi > 100 ? 'text-red-500' : 'text-emerald-500'}`}>{aqi.aqi}</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Dominant Pollutant</p>
                  <p className="font-semibold text-slate-700">{aqi.dominantPollutant}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase">Status</p>
                  <p className="font-semibold text-slate-700">{aqi.status}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 italic">
                  Data source: <span className="font-bold text-blue-500">{aqi.source || "External"}</span>
                </p>
                {aqi.source === "WAQI" && (
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold uppercase tracking-tighter">Live API</span>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex space-y-4 flex-col">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
