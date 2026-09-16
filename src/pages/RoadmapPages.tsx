import React from 'react';
import { ArrowLeft, ArrowRight, FileSpreadsheet, BarChart3, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ActivePage } from '../types/carbon';

interface RoadmapPageProps {
  pageType: 'accounting' | 'reporting';
  onNavigate: (page: ActivePage) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ pageType, onNavigate }) => {
  const isAccounting = pageType === 'accounting';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      <div>
        <button
          onClick={() => onNavigate('calculator')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Carbon Calculator</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <span>🔜 Product Roadmap • Q3/Q4</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-slate-950 tracking-tight">
          {isAccounting ? 'Carbon Accounting' : 'Carbon Reporting'}
          <span className="text-slate-400 font-normal ml-3 text-2xl sm:text-4xl">(Coming Soon)</span>
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
          {isAccounting
            ? "Automated organizational greenhouse gas inventory management across Scope 1, Scope 2, and upstream Scope 3 supply chain operations."
            : "Generate audit-ready climate disclosures, stakeholder sustainability summaries, and regulatory filings matching CSRD, BRSR, and SEC standards."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {isAccounting ? (
          <>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-bold text-slate-900">ERP & Utility Integrations</h3>
              <p className="text-xs text-slate-500">
                Direct API ingestion from SAP, NetSuite, and utility smart meters.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-2xl">🔍</span>
              <h3 className="font-bold text-slate-900">Continuous Scope 3 Auditing</h3>
              <p className="text-xs text-slate-500">
                Spend-based and activity-based supplier emission factor modeling.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-2xl">🛡️</span>
              <h3 className="font-bold text-slate-900">Assurance-Ready Data Room</h3>
              <p className="text-xs text-slate-500">
                Full cryptographic traceability for Big Four sustainability audits.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-2xl">🇪🇺</span>
              <h3 className="font-bold text-slate-900">CSRD & ESRS Compliance</h3>
              <p className="text-xs text-slate-500">
                European Sustainability Reporting Standards double materiality mapping.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-2xl">🇮🇳</span>
              <h3 className="font-bold text-slate-900">SEBI BRSR Framework</h3>
              <p className="text-xs text-slate-500">
                Business Responsibility and Sustainability Reporting Core indicators.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-2xl">📄</span>
              <h3 className="font-bold text-slate-900">One-Click PDF/XBRL Exports</h3>
              <p className="text-xs text-slate-500">
                Ready-to-file regulatory formats with digital signatures.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">Try our live Carbon Calculator now</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Model your individual or enterprise activity emissions right away.
          </p>
        </div>
        <button
          onClick={() => onNavigate('calculator')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>Open Calculator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
