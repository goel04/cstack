import React from 'react';
import { ShieldCheck, Target, Award, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { ActivePage } from '../types/carbon';

interface AboutPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div id="about-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Intro */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          About CSTACK
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-950 tracking-tight">
          Climate intelligence built on verifiable scientific rigor.
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed pt-2">
          CSTACK was founded to replace superficial carbon claims with transparent, auditable carbon accounting infrastructure. We empower individuals and enterprises to accurately measure their carbon footprint and understand verified compensation pathways.
        </p>
      </div>

      {/* Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900">
            1. Zero Greenwashing
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We never conflate footprint estimation with carbon credit generation. Accurate decarbonization starts with honest, uninflated metrics.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900">
            2. Configurable Methodologies
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Emission factors vary significantly across power grids, vehicular fleets, and logistics routes. Our engine decouples factors from presentation logic.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg border border-sky-100">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900">
            3. High-Durability Offsets
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            When compensation is required, our upcoming Marketplace focuses on measurable, long-duration carbon removal (Biochar, DAC, Enhanced Weathering).
          </p>
        </div>
      </div>

      {/* Accounting Standards Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <h2 className="text-2xl font-display font-bold text-slate-950">
          Standards & Scientific Reference Frameworks
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          The CSTACK calculation model is calibrated to international GHG accounting guidelines, incorporating peer-reviewed databases:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">GHG Protocol Corporate Standard</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardizes emissions across Scope 1 (Direct), Scope 2 (Purchased Electricity), and Scope 3 (Value chain travel).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Central Electricity Authority (CEA) v19</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                National weighted average CO₂ baseline database for Indian grid power consumption (0.716 kgCO₂e/kWh).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">UK DEFRA / DESNZ Standards (2024)</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive passenger transit, vehicle powertrain fuel types, and aviation radiative forcing multipliers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">ISO 14064 Compliance Readiness</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Structured for organizational boundary quantification, audit traceability, and third-party verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-display font-bold">Start with your footprint estimation</h3>
          <p className="text-sm text-slate-400 mt-1">
            Explore your emission breakdown across electricity, commute, flights, and activities.
          </p>
        </div>
        <button
          onClick={() => onNavigate('calculator')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shrink-0"
        >
          <span>Calculate Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
