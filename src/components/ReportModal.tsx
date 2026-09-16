import React from 'react';
import { X, Printer, Download, Check, ShieldCheck, FileText, Calendar, Building2 } from 'lucide-react';
import { CalculationResult } from '../types/carbon';
import { REGIONS } from '../utils/emissionFactors';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, result }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `GREENADEL CARBON FOOTPRINT SUMMARY
Generated: ${new Date(result.generatedAt).toLocaleDateString()}
Total Estimated Emissions: ${result.totalTonnesCO2e} tCO₂e (${result.totalKgCO2e.toLocaleString()} kgCO₂e)
Offset Requirement: ${result.offsetRequirementTonnes} tonnes CO₂e

CATEGORY BREAKDOWN:
${result.breakdown.map((b) => `- ${b.label}: ${b.tCO2e} tCO₂e (${b.percentage}%)`).join('\n')}

Notice: Calculations are indicative greenhouse gas estimates based on GHG Protocol and regional emission factors. Does not represent the issuance of carbon credits.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regionName = REGIONS[result.inputsSnapshot.electricityRegion]?.name || 'Global';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        id="report-modal-container"
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 relative"
      >
        {/* Top actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Carbon Assessment Summary
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="pt-6 space-y-6 text-slate-900" id="printable-carbon-report">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl tracking-tight text-slate-950">
                  Greenadel
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Official Assessment
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ref: GDL-CO2-{Math.abs(result.totalKgCO2e % 999999).toString().padStart(6, '0')}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div className="flex items-center gap-1 justify-end font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(result.generatedAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-0.5">Primary Grid: {regionName}</p>
            </div>
          </div>

          {/* Hero metric box */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Total Estimated Carbon Footprint
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-display font-bold text-slate-950">
                  {result.totalTonnesCO2e}
                </span>
                <span className="text-sm font-semibold text-slate-600">tCO₂e / year</span>
              </div>
              <p className="text-xs text-slate-500 font-mono-data mt-0.5">
                = {result.totalKgCO2e.toLocaleString()} kgCO₂e
              </p>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
                Offset Requirement
              </span>
              <p className="text-2xl font-display font-bold text-emerald-900 mt-0.5">
                {result.offsetRequirementTonnes} tonnes
              </p>
              <p className="text-[11px] text-slate-500">To achieve net neutrality</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Emissions Allocation by Source
            </h5>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-100 py-2 px-3 font-semibold text-slate-700">
                <div className="col-span-4">Category</div>
                <div className="col-span-3">Activity Base</div>
                <div className="col-span-3 text-right">tCO₂e</div>
                <div className="col-span-2 text-right">Share</div>
              </div>
              {result.breakdown.map((item, idx) => (
                <div
                  key={item.category}
                  className={`grid grid-cols-12 py-2.5 px-3 border-t border-slate-100 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="col-span-4 font-semibold text-slate-900 flex items-center gap-1.5">
                    {item.label}
                  </div>
                  <div className="col-span-3 text-slate-500 truncate">{item.primaryActivity}</div>
                  <div className="col-span-3 text-right font-mono-data font-semibold text-slate-800">
                    {item.tCO2e}
                  </div>
                  <div className="col-span-2 text-right font-semibold text-slate-900">
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insight */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800">
              <span>💡</span> Priority Reduction Opportunity
            </span>
            <p className="text-emerald-800 leading-relaxed">
              <strong>{result.largestCategory.label}</strong> generates {result.largestCategory.percentage}% of your annual emissions ({result.largestCategory.tCO2e} tCO₂e). Prioritizing clean energy procurement or low-emission transport in this category provides maximum decarbonization leverage.
            </p>
          </div>

          {/* Legal / Regulatory Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Standards & Disclaimer</span>
            </div>
            <p>
              This report is generated by Greenadel’s Carbon Calculation Engine using methodology grounded in the GHG Protocol Corporate Standard, UK DEFRA 2024, and CEA v19 datasets. Offset requirements represent equivalent carbon volume and do not constitute an issuance or transfer of carbon credits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
