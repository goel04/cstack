import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, Sparkles, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { ActivePage } from '../types/carbon';

interface MarketplacePageProps {
  onNavigate: (page: ActivePage) => void;
  suggestedOffsetTonnes?: number;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate, suggestedOffsetTonnes }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div id="marketplace-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('calculator')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Calculator & Results</span>
        </button>
      </div>

      {/* Hero Badge */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <span>🔜 Product Stage: Curated Marketplace Alpha</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-slate-950 tracking-tight">
          Carbon Marketplace <span className="text-slate-400 font-normal">(Coming Soon)</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          High-durability carbon removal and verified avoidance credits for voluntary climate action.
        </p>

        {suggestedOffsetTonnes ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 inline-block text-sm text-emerald-900 font-medium">
            Your modeled compensation requirement: <strong>{suggestedOffsetTonnes} tonnes CO₂e</strong>
          </div>
        ) : null}
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
        <strong className="text-slate-800 font-semibold">Regulatory Notice:</strong> CSTACK operates on the principle that emissions should be avoided and reduced first. Compensation credits featured in our upcoming marketplace are independently audited by standards such as Puro.earth, Gold Standard, and Verra VCS. Calculating your footprint does not grant or certify carbon credits.
      </div>

      {/* Preview of Project Types */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-slate-900">
          Preview of Vetted Carbon Removal Portfolios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Biochar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🪵</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                100+ Years
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Biochar Carbon Removal (BCR)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pyrolyzed agricultural biomass converting volatile carbon into durable solid biochar for soil sequestration.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex justify-between">
              <span>Standard: Puro.earth</span>
              <span>Permanence: High</span>
            </div>
          </div>

          {/* Direct Air Capture */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">💨</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                1000+ Years
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Air Capture & Storage (DACCS)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Engineered atmospheric CO₂ extraction with deep geological basalt mineralization.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex justify-between">
              <span>Standard: Isometric</span>
              <span>Permanence: Ultra</span>
            </div>
          </div>

          {/* Afforestation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🌲</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                40–80 Years
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">High-Biodiversity Reforestation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native species ecological restoration with satellite-monitored biomass growth tracking.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex justify-between">
              <span>Standard: Verra VCS</span>
              <span>Permanence: Medium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Early Access Form */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl max-w-2xl mx-auto text-center space-y-5">
        <h3 className="text-2xl font-display font-bold">
          Get notified when the Marketplace opens
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          We are currently onboarding tier-one carbon removal developers and setting up transparent pricing feeds.
        </p>

        {subscribed ? (
          <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-700 text-emerald-200 text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Thank you! We've added you to the priority access list.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shrink-0"
            >
              Request Access
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
