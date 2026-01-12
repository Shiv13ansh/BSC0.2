
import React, { useState } from 'react';
import { HealthData, SmokingStatus } from '../types';

interface InputFormProps {
  onSubmit: (data: HealthData) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<HealthData>({
    age: 30,
    systolicBP: 120,
    diastolicBP: 80,
    smokingStatus: SmokingStatus.NEVER
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <i className="fas fa-stethoscope text-blue-500 mr-2"></i>
        Respiratory Health Profile
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            min="0"
            max="120"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Systolic BP (mmHg)</label>
            <input
              type="number"
              value={formData.systolicBP}
              onChange={(e) => setFormData({ ...formData, systolicBP: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Diastolic BP (mmHg)</label>
            <input
              type="number"
              value={formData.diastolicBP}
              onChange={(e) => setFormData({ ...formData, diastolicBP: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Smoking Status</label>
          <select
            value={formData.smokingStatus}
            onChange={(e) => setFormData({ ...formData, smokingStatus: e.target.value as SmokingStatus })}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
            {Object.values(SmokingStatus).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${
            isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin mr-2"></i> Analyzing...
            </span>
          ) : 'Calculate Breath Score'}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
