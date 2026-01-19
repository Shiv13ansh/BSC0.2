import React from 'react';
import { SavedAnalysis } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  history: SavedAnalysis[];
  userEmail: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ history, userEmail }) => {
  const averageScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.analysis.score, 0) / history.length) 
    : 0;

  const averageSugar = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.healthData.sugarLevel, 0) / history.length)
    : 0;

  // Formatting chart data: newest on the right
  const chartData = [...history]
    .reverse()
    .map(h => {
      let dateLabel = "N/A";
      try {
        const dateObj = new Date(h.timestamp);
        dateLabel = isNaN(dateObj.getTime()) 
          ? h.timestamp.split(',')[0] // Fallback if format is legacy locale string
          : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } catch (e) {
        dateLabel = "Err";
      }

      return {
        date: dateLabel,
        score: h.analysis.score,
        sugar: h.healthData.sugarLevel
      };
    });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <i className="fa-solid fa-chart-line text-2xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Wellness</p>
            <h4 className="text-2xl font-black text-slate-800">{averageScore}%</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <i className="fa-solid fa-droplet text-2xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Sugar</p>
            <h4 className="text-2xl font-black text-slate-800">{averageSugar} <span className="text-xs text-slate-400 uppercase">mg/dL</span></h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
            <i className="fa-solid fa-microscope text-2xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tests</p>
            <h4 className="text-2xl font-black text-slate-800">{history.length}</h4>
          </div>
        </div>
      </div>

      {/* Wellness & Metabolic Trend Graph */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800">Longitudinal Trends</h3>
            <p className="text-slate-400 text-xs font-medium tracking-tight">Correlation between wellness and glucose levels</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Score</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Sugar</div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          {history.length >= 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8'}} 
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#3b82f6', fontWeight: 700}} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 'dataMax + 50']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#10b981', fontWeight: 700}} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold'}} 
                  itemStyle={{padding: '2px 0'}}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fill="url(#colorScore)" 
                  animationDuration={1000} 
                  name="Wellness Score"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="sugar" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fill="url(#colorSugar)" 
                  animationDuration={1200} 
                  name="Sugar Level"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
              <i className="fa-solid fa-chart-area text-slate-200 text-5xl mb-4"></i>
              <p className="text-slate-400 font-bold text-sm">Waiting for diagnostic data...</p>
            </div>
          )}
        </div>
      </div>

      {/* Diagnostic Archive */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xl font-black text-slate-800">Diagnostic History</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Records for: {userEmail}</span>
        </div>
        {history.length === 0 ? (
          <div className="p-20 text-center">
            <i className="fa-solid fa-folder-open text-slate-200 text-5xl mb-4"></i>
            <h4 className="text-slate-400 font-bold">No sessions logged yet.</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-slate-50">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="text-sm font-bold text-slate-700">
                        {new Date(record.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Score</div>
                      <span className={`px-4 py-2 rounded-xl font-black text-sm border-2 ${record.analysis.score >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {record.analysis.score}%
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vitals</div>
                      <div className="text-xs font-bold text-slate-600">BP: {record.healthData.systolicBP}/{record.healthData.diastolicBP}</div>
                      <div className="text-xs font-bold text-slate-600">Sugar: {record.healthData.sugarLevel}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;