
import React from 'react';
import { AppState, SmokingStatus } from '../types';

interface InsuranceProps {
  state: AppState;
}

const Insurance: React.FC<InsuranceProps> = ({ state }) => {
  const { analysis, aqi, userInput } = state;
  const score = analysis?.score || 100;
  const sugar = userInput?.sugarLevel || 100;

  const insuranceCompanies = [
    {
      id: 1,
      name: "GlobalHealth Assurance",
      plan: "PulmoShield Elite",
      icon: "fa-shield-heart",
      color: "text-blue-600",
      bg: "bg-blue-50",
      benefits: ["No-claim wellness bonus", "Respiratory specialist coverage", "Free annual lung detox"],
      premium: "Starting at $24/mo",
      tag: "Best for Healthy Lungs",
      threshold: 80
    },
    {
      id: 5,
      name: "GlucoShield Medical",
      plan: "Metabolic Harmony",
      icon: "fa-droplet",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      benefits: ["Free glucose monitoring kit", "Insulin cost coverage", "Diabetes-respiratory synergy care"],
      premium: "Starting at $35/mo",
      tag: "Metabolic Support",
      condition: sugar > 140
    },
    {
      id: 2,
      name: "MediLife Vitals",
      plan: "Chronic Care Plus",
      icon: "fa-heart-pulse",
      color: "text-rose-600",
      bg: "bg-rose-50",
      benefits: ["Pre-existing condition waiver", "Oxygen support coverage", "Smoking cessation kits"],
      premium: "Starting at $45/mo",
      tag: "High Risk Support",
      threshold: 0
    },
    {
      id: 3,
      name: "UrbanGuard Insurance",
      plan: "EcoCity Defender",
      icon: "fa-mask-face",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      benefits: ["Pollution-related illness rider", "AQI-triggered benefits", "HEPA filter discounts"],
      premium: "Starting at $19/mo",
      tag: "Environmental Choice",
      condition: (aqi?.aqi || 0) > 100
    },
    {
      id: 4,
      name: "Unity General",
      plan: "Family BreathEasy",
      icon: "fa-people-group",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      benefits: ["Family floating sum", "Pediatric asthma support", "Telehealth 24/7"],
      premium: "Starting at $62/mo",
      tag: "Family Coverage",
      threshold: 50
    }
  ];

  const curatedPlans = insuranceCompanies.sort((a, b) => {
    if (a.condition && !b.condition) return -1;
    if (score >= 80 && a.threshold >= 80) return -1;
    return 0;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fa-solid fa-file-invoice-dollar text-9xl"></i>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            User: {state.userEmail}
          </span>
          <h2 className="text-3xl font-black mb-3">Health Insurance Marketplace</h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Marketplace suggestions adjusted for your wellness score (<span className="text-white font-bold">{score}%</span>) and metabolic markers (<span className="text-white font-bold">{sugar} mg/dL</span>).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {curatedPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all p-8 flex flex-col group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 ${plan.bg} ${plan.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${plan.icon}`}></i>
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                {plan.tag}
              </span>
            </div>
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{plan.name}</h4>
              <h3 className="text-xl font-black text-slate-800">{plan.plan}</h3>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                  <span className="text-xs font-medium text-slate-600">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-tighter">Premium</span>
                <span className="text-sm font-black text-slate-800">{plan.premium}</span>
              </div>
              <button className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Insurance;
