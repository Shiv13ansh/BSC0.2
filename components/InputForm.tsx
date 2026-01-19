
import React, { useState } from 'react';
import { HealthData, SmokingStatus, RespiratoryDisease } from '../types';

interface InputFormProps {
  onSubmit: (data: HealthData) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<HealthData>({
    age: 30,
    systolicBP: 120,
    diastolicBP: 80,
    sugarLevel: 100,
    smokingStatus: SmokingStatus.NEVER,
    hasRespiratoryProblem: false,
    selectedDiseases: []
  });

  const toggleDisease = (disease: RespiratoryDisease) => {
    setFormData(prev => ({
      ...prev,
      selectedDiseases: prev.selectedDiseases.includes(disease)
        ? prev.selectedDiseases.filter(d => d !== disease)
        : [...prev.selectedDiseases, disease]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
          <i className="fa-solid fa-stethoscope text-xl"></i>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight">Biometric Profile</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Analysis Requirements</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Profile Section */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">01. Core Identity</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Age (Years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Smoking Habit</label>
              <select
                value={formData.smokingStatus}
                onChange={(e) => setFormData({ ...formData, smokingStatus: e.target.value as SmokingStatus })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium cursor-pointer"
              >
                {Object.values(SmokingStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Metabolic Vitals Section - SUGAR LEVEL IS PROMINENT HERE */}
        <section className="space-y-4 pt-4 border-t border-slate-50">
          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">02. Metabolic Vitals</h4>
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sugar Level (mg/dL)</label>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">Fasting or Random</span>
            </div>
            <input
              type="number"
              value={formData.sugarLevel}
              onChange={(e) => setFormData({ ...formData, sugarLevel: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-bold text-lg"
              placeholder="e.g. 100"
              required
            />
            <p className="text-[9px] text-slate-400 mt-2 italic font-medium">Glucose levels correlate with systemic inflammation and airway responsiveness.</p>
          </div>
        </section>

        {/* Circulatory Vitals Section */}
        <section className="space-y-4 pt-4 border-t border-slate-50">
          <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4">03. Circulatory Vitals</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Systolic BP</label>
              <input
                type="number"
                value={formData.systolicBP}
                onChange={(e) => setFormData({ ...formData, systolicBP: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Diastolic BP</label>
              <input
                type="number"
                value={formData.diastolicBP}
                onChange={(e) => setFormData({ ...formData, diastolicBP: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 font-medium"
                required
              />
            </div>
          </div>
        </section>

        {/* Respiratory Section */}
        <section className="space-y-4 pt-4 border-t border-slate-50">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">04. Respiratory Conditions</h4>
          <label className="flex items-center justify-between cursor-pointer group p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Chronic Lung Condition?</span>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-slate-200 rounded-full">
              <input
                type="checkbox"
                checked={formData.hasRespiratoryProblem}
                onChange={(e) => setFormData({ ...formData, hasRespiratoryProblem: e.target.checked, selectedDiseases: e.target.checked ? formData.selectedDiseases : [] })}
                className="absolute w-6 h-6 bg-white border-2 rounded-full appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-600 transition-all duration-200"
              />
            </div>
          </label>

          {formData.hasRespiratoryProblem && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-wrap gap-2">
                {Object.values(RespiratoryDisease).map((disease) => (
                  <button
                    key={disease}
                    type="button"
                    onClick={() => toggleDisease(disease)}
                    className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                      formData.selectedDiseases.includes(disease)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                    }`}
                  >
                    {disease}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98] ${
            isLoading ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200'
          }`}
        >
          {isLoading ? 'Processing Factors...' : 'Analyze Wellness'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
