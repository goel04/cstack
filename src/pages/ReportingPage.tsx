import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  FileCheck,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building,
  Shield,
  Clock,
  Printer,
  Copy,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ActivePage } from '../types/carbon';

interface ReportingPageProps {
  onNavigate: (page: ActivePage) => void;
}

type FrameworkId = 'csrd' | 'brsr' | 'sec' | 'tcfd';

interface DisclosureItem {
  id: string;
  metric: string;
  category: string;
  value: string;
  unit: string;
  assurance: 'Reasonable' | 'Limited' | 'Self-Certified';
  status: 'Complete' | 'In Review';
}

const FRAMEWORK_DATA: Record<
  FrameworkId,
  {
    name: string;
    badge: string;
    authority: string;
    description: string;
    mandatoryFor: string;
    readinessScore: number;
    metrics: DisclosureItem[];
  }
> = {
  csrd: {
    name: 'CSRD — ESRS E1 Climate Change',
    badge: 'EU Directive 2022/2464',
    authority: 'European Financial Reporting Advisory Group (EFRAG)',
    description:
      'Standardized double-materiality disclosure covering gross Scope 1, 2 (market & location based), significant Scope 3 categories, and carbon removal credits.',
    mandatoryFor: 'EU-domiciled and large non-EU enterprises with >€150M EU turnover',
    readinessScore: 94,
    metrics: [
      {
        id: 'E1-1',
        metric: 'Gross Scope 1 GHG Emissions',
        category: 'Direct Operations',
        value: '53.5',
        unit: 'tCO₂e',
        assurance: 'Limited',
        status: 'Complete',
      },
      {
        id: 'E1-2',
        metric: 'Gross Scope 2 (Location-Based)',
        category: 'Purchased Electricity',
        value: '89.1',
        unit: 'tCO₂e',
        assurance: 'Limited',
        status: 'Complete',
      },
      {
        id: 'E1-3',
        metric: 'Gross Scope 2 (Market-Based)',
        category: 'Purchased Electricity (RECs)',
        value: '1.3',
        unit: 'tCO₂e',
        assurance: 'Reasonable',
        status: 'Complete',
      },
      {
        id: 'E1-4',
        metric: 'Gross Scope 3 Significant Categories',
        category: 'Value Chain Supply & Flights',
        value: '193.4',
        unit: 'tCO₂e',
        assurance: 'Limited',
        status: 'Complete',
      },
      {
        id: 'E1-5',
        metric: 'GHG Intensity per Net Turnover',
        category: 'Financial Intensity',
        value: '14.2',
        unit: 'tCO₂e / €M',
        assurance: 'Limited',
        status: 'Complete',
      },
      {
        id: 'E1-6',
        metric: 'Carbon Removals & Mitigation Financing',
        category: 'Permanent Offsets',
        value: '24.6',
        unit: 'tCO₂e retired',
        assurance: 'Reasonable',
        status: 'Complete',
      },
    ],
  },
  brsr: {
    name: 'SEBI BRSR Core',
    badge: 'SEBI Circular 2023 / Annexure I',
    authority: 'Securities and Exchange Board of India (SEBI)',
    description:
      'Mandatory ESG reporting for top 1,000 listed entities in India covering Principle 6: Environmental Stewardship and Value Chain emissions.',
    mandatoryFor: 'Top 1000 listed Indian corporations by market capitalization',
    readinessScore: 91,
    metrics: [
      {
        id: 'P6-1',
        metric: 'Total Electricity Consumption (Grid)',
        category: 'Energy Intensity',
        value: '124,500',
        unit: 'kWh',
        assurance: 'Reasonable',
        status: 'Complete',
      },
      {
        id: 'P6-2',
        metric: 'Scope 1 Absolute Emissions',
        category: 'Direct Operations',
        value: '53.5',
        unit: 'tCO₂e',
        assurance: 'Limited',
        status: 'Complete',
      },
      {
        id: 'P6-3',
        metric: 'Scope 2 Absolute Emissions (CEA v19)',
        category: 'Grid Electricity',
        value: '89.1',
        unit: 'tCO₂e',
        assurance: 'Limited',
        status: 'Complete',
      },
      {
        id: 'P6-4',
        metric: 'Renewable Energy Percentage',
        category: 'Clean Power Ratio',
        value: '40.8',
        unit: '% of total energy',
        assurance: 'Reasonable',
        status: 'Complete',
      },
      {
        id: 'P6-5',
        metric: 'GHG Intensity per Crore Turnover',
        category: 'Turnover Ratio',
        value: '1.24',
        unit: 'tCO₂e / ₹ Cr',
        assurance: 'Limited',
        status: 'Complete',
      },
    ],
  },
  sec: {
    name: 'SEC Climate-Related Disclosures',
    badge: 'Regulation S-K / S-X Final Rule',
    authority: 'U.S. Securities and Exchange Commission',
    description:
      'Disclosures of material climate risks, Scope 1 and Scope 2 emissions for Large Accelerated Filers and Accelerated Filers with third-party attestation.',
    mandatoryFor: 'US public registrants with material Scope 1 & 2 operational exposures',
    readinessScore: 88,
    metrics: [
      {
        id: 'SEC-1',
        metric: 'Scope 1 Direct Stationary & Fleet',
        category: 'Material GHG Emissions',
        value: '53.5',
        unit: 'tCO₂e',
        assurance: 'Reasonable',
        status: 'Complete',
      },
      {
        id: 'SEC-2',
        metric: 'Scope 2 Purchased Electricity',
        category: 'Material GHG Emissions',
        value: '89.1',
        unit: 'tCO₂e',
        assurance: 'Reasonable',
        status: 'Complete',
      },
      {
        id: 'SEC-3',
        metric: 'Climate Governance & Risk Oversight',
        category: 'Board Oversight',
        value: 'Audit Committee Tier 1',
        unit: 'Documented Policy',
        assurance: 'Reasonable',
        status: 'Complete',
      },
    ],
  },
  tcfd: {
    name: 'TCFD / ISSB S2 Climate Standard',
    badge: 'IFRS S2 Aligned',
    authority: 'International Sustainability Standards Board (ISSB)',
    description:
      'Comprehensive reporting across the four core pillars: Governance, Strategy, Risk Management, and Metrics & Targets.',
    mandatoryFor: 'Global institutional investors, banks, and voluntary climate leaders',
    readinessScore: 96,
    metrics: [
      {
        id: 'TCFD-G1',
        metric: 'Board Oversight of Climate Risks',
        category: 'Governance Pillar',
        value: 'Quarterly review',
        unit: 'Cadence',
        assurance: 'Reasonable',
        status: 'Complete',
      },
      {
        id: 'TCFD-M1',
        metric: 'Scope 1, 2, 3 Emissions Inventory',
        category: 'Metrics Pillar',
        value: '336.0',
        unit: 'tCO₂e total',
        assurance: 'Limited',
        status: 'Complete',
      },
      {
        id: 'TCFD-T1',
        metric: 'Science-Based 2030 Target',
        category: 'Targets Pillar',
        value: '-42% vs 2023',
        unit: 'SBTi 1.5°C validated',
        assurance: 'Reasonable',
        status: 'Complete',
      },
    ],
  },
};

export const ReportingPage: React.FC<ReportingPageProps> = ({ onNavigate }) => {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkId>('csrd');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const active = FRAMEWORK_DATA[selectedFramework];

  const handleExport = (format: string) => {
    setDownloadToast(`Preparing ${format} export for ${active.name}...`);
    setTimeout(() => {
      setDownloadToast(`${format} package successfully compiled and verified for audit handoff.`);
      setTimeout(() => setDownloadToast(null), 4000);
    }, 1000);
  };

  return (
    <div id="reporting-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Enterprise Product
            </span>
            <span className="text-xs font-mono text-slate-500">Audit-Ready Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-950 tracking-tight">
            Carbon Reporting & Disclosures
          </h1>
          <p className="text-sm text-slate-600">
            Generate compliant, auditable ESG filings matching global regulatory mandates with cryptographic data provenance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('accounting')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>View Accounting Ledger</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            onClick={() => handleExport('Audit-Ready PDF')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Report Package</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {downloadToast && (
        <div className="p-3.5 rounded-xl bg-emerald-900 text-emerald-100 text-xs font-medium flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadToast}</span>
          </div>
          <button onClick={() => setDownloadToast(null)} className="text-emerald-300 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Framework Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(FRAMEWORK_DATA) as FrameworkId[]).map((key) => {
          const item = FRAMEWORK_DATA[key];
          const isSelected = selectedFramework === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedFramework(key)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/10'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Framework
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {item.readinessScore}% Ready
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.authority}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Framework Details & Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {active.badge}
              </span>
              <span className="text-xs text-slate-500">• {active.authority}</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-950">{active.name}</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              {active.description}
            </p>
            <p className="text-xs text-slate-400 pt-1">
              <strong className="text-slate-600">Applicability:</strong> {active.mandatoryFor}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 min-w-56 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Compliance Readiness</span>
              <span className="font-mono font-bold text-emerald-700">{active.readinessScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${active.readinessScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">All required primary quantitative disclosures satisfied.</p>
          </div>
        </div>

        {/* Quantitative Disclosure Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Required Quantitative Disclosure Items
            </h3>
            <span className="text-xs text-slate-400">Aligned with GHG Protocol Corporate Standard</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Disclosure Metric</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Reported Value</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-center">Assurance Level</th>
                  <th className="py-3 px-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.metrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{m.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{m.metric}</td>
                    <td className="py-3 px-4 text-slate-500">{m.category}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-950 text-sm">
                      {m.value}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{m.unit}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {m.assurance}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{m.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor Sign-off Trail */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="font-bold text-slate-900">Pre-Audit Verification Pass (SHA-256 Validated)</p>
              <p className="text-slate-500">
                Inventory data tied to verifiable billing telemetry, utility logs, and certified emission factor registries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExport('XBRL / iXBRL')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs transition-colors"
            >
              Export iXBRL
            </button>
            <button
              onClick={() => handleExport('CSV Data Ledger')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('Official Audit PDF')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <Printer className="w-3 h-3" />
              <span>Print Filing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
