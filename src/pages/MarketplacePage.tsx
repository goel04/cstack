import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Filter,
  DollarSign,
  Clock,
  Award,
  Layers,
  FileCheck,
  Info
} from 'lucide-react';
import { ActivePage } from '../types/carbon';

interface MarketplacePageProps {
  onNavigate: (page: ActivePage) => void;
  suggestedOffsetTonnes?: number;
}

interface CarbonProject {
  id: string;
  name: string;
  type: 'Durable CDR' | 'Nature-Based' | 'Engineered';
  methodology: string;
  location: string;
  standard: 'Puro.earth' | 'Isometric' | 'Gold Standard' | 'Verra VCS';
  permanence: string;
  pricePerTonne: number;
  availableTonnes: number;
  vintage: string;
  rating: string;
  description: string;
  coBenefits: string[];
}

const PROJECTS: CarbonProject[] = [
  {
    id: 'PRJ-BCR-01',
    name: 'Nordic Agro-Biomass Biochar',
    type: 'Durable CDR',
    methodology: 'High-Temperature Biomass Pyrolysis',
    location: 'Helsinki, Finland',
    standard: 'Puro.earth',
    permanence: '100+ Years',
    pricePerTonne: 145,
    availableTonnes: 4200,
    vintage: '2024/2025',
    rating: 'BeZero AAA',
    description:
      'Transforms residual agricultural chaff into highly stable recalcitrant solid carbon, permanently sequestering carbon into regional agricultural soils.',
    coBenefits: ['Soil Water Retention', 'Nutrient Runoff Mitigation', 'Zero Fossil Fuel Used'],
  },
  {
    id: 'PRJ-DAC-02',
    name: 'Basalt Mineralization DACCS',
    type: 'Durable CDR',
    methodology: 'Direct Air Capture with Subsurface Basalt Storage',
    location: 'Hellisheidi, Iceland',
    standard: 'Isometric',
    permanence: '1000+ Years',
    pricePerTonne: 550,
    availableTonnes: 1800,
    vintage: '2025',
    rating: 'Sylvera Top Tier',
    description:
      'Captures atmospheric CO₂ via low-temperature geothermal sorbents and dissolves it in water, injecting it deep into basaltic bedrock where it turns to stone in <2 years.',
    coBenefits: ['Zero Land Footprint', 'Unlimited Scalability', 'Geothermal Powered'],
  },
  {
    id: 'PRJ-ERW-03',
    name: 'Silicate Basalt Rock Weathering',
    type: 'Durable CDR',
    methodology: 'Enhanced Silicate Rock Weathering on Farmland',
    location: 'Ayrshire, Scotland',
    standard: 'Isometric',
    permanence: '1000+ Years',
    pricePerTonne: 210,
    availableTonnes: 3100,
    vintage: '2024',
    rating: 'BeZero AA+',
    description:
      'Spreads crushed volcanic basalt over working croplands to react with rainwater and atmospheric carbon, washing bicarbonate ions into stable ocean alkalinity storage.',
    coBenefits: ['De-acidifies Arable Soil', 'Replaces Chemical Lime', 'Ocean Buffer Protection'],
  },
  {
    id: 'PRJ-BLU-04',
    name: 'Sundarbans Coastal Mangrove Restoration',
    type: 'Nature-Based',
    methodology: 'Tidal Wetland & Blue Carbon Sequestration',
    location: 'West Bengal, India',
    standard: 'Verra VCS',
    permanence: '80+ Years',
    pricePerTonne: 38,
    availableTonnes: 8500,
    vintage: '2024',
    rating: 'Sylvera Tier 1',
    description:
      'Community-led ecological restoration of degraded estuarine mangrove forests with deep anaerobic sediment organic carbon burial.',
    coBenefits: ['Cyclone Storm Protection', 'Fish Breeding Nurseries', 'Local Tribal Employment'],
  },
  {
    id: 'PRJ-FOR-05',
    name: 'Andean Native Cloud Forest Conservation',
    type: 'Nature-Based',
    methodology: 'Improved Forest Management & Native Afforestation',
    location: 'Cusco Highlands, Peru',
    standard: 'Gold Standard',
    permanence: '60+ Years',
    pricePerTonne: 29,
    availableTonnes: 12000,
    vintage: '2024/2025',
    rating: 'BeZero AA',
    description:
      'Preserves ancient Polylepis high-altitude forests and replants native tree species, locking up carbon and preserving endemic wildlife corridors.',
    coBenefits: ['Watershed Security', 'Endemic Species Habitat', 'Indigenous Land Rights'],
  },
];

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate, suggestedOffsetTonnes = 24.6 }) => {
  const [selectedType, setSelectedType] = useState<'All' | 'Durable CDR' | 'Nature-Based'>('All');
  const [quantityTonnes, setQuantityTonnes] = useState<number>(suggestedOffsetTonnes);
  const [selectedProject, setSelectedProject] = useState<CarbonProject>(PROJECTS[0]);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('Enterprise Climate Account');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const filteredProjects = PROJECTS.filter((p) => {
    return selectedType === 'All' || p.type === selectedType;
  });

  const totalCost = (quantityTonnes * selectedProject.pricePerTonne).toFixed(2);

  const handleSimulateRetirement = () => {
    setCheckoutSuccess(true);
    setIsCertificateModalOpen(true);
  };

  return (
    <div id="marketplace-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 animate-in fade-in duration-200">
      {/* Top Breadcrumb / Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Live Product
            </span>
            <span className="text-xs font-mono text-slate-500">Registry Verified (Puro • Isometric • Verra)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-950 tracking-tight">
            Carbon Marketplace
          </h1>
          <p className="text-sm text-slate-600">
            Procure verified high-permanence carbon removals and independently audited nature-based avoidance credits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('calculator')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Calculator</span>
          </button>
          <button
            onClick={() => onNavigate('reporting')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>View ESG Disclosures</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Modeled Requirement & Regulatory Notice Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-900 text-white shadow-md space-y-2 md:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Calculated Offset Target
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white tracking-tight">
              {suggestedOffsetTonnes}
            </span>
            <span className="text-sm text-emerald-200">tCO₂e</span>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Target volume modeled from your recent carbon footprint assessment session.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs text-slate-600 leading-relaxed md:col-span-2 flex flex-col justify-center space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>CSTACK Mitigation Hierarchy Commitment</span>
          </div>
          <p>
            CSTACK enforces the core Oxford Offsetting Principles: internal emission reduction comes first. Carbon credits available on this exchange are independently audited with serial certificates on public registries (Puro.earth, Isometric, Verra, and Gold Standard) to guarantee zero double-counting.
          </p>
        </div>
      </div>

      {/* Main Procurement Area: Projects Grid + Interactive Allocation Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Filter and Project Catalog (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              {(['All', 'Durable CDR', 'Nature-Based'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedType === t
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t === 'All' ? 'All Portfolios' : t}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredProjects.length} vetted projects
            </span>
          </div>

          {/* Projects Cards */}
          <div className="space-y-4">
            {filteredProjects.map((prj) => {
              const isSelected = selectedProject.id === prj.id;
              return (
                <div
                  key={prj.id}
                  onClick={() => setSelectedProject(prj)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer text-left space-y-4 ${
                    isSelected
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/10 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{prj.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            prj.type === 'Durable CDR'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-sky-50 text-sky-800 border border-sky-200'
                          }`}
                        >
                          {prj.type}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {prj.standard}
                        </span>
                      </div>
                      <h3 className="text-lg font-display font-bold text-slate-950 mt-1">
                        {prj.name}
                      </h3>
                      <p className="text-xs text-slate-500">{prj.location} • {prj.methodology}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="flex sm:justify-end items-baseline gap-1">
                        <span className="text-2xl font-display font-bold text-slate-950 font-mono">
                          ${prj.pricePerTonne}
                        </span>
                        <span className="text-xs text-slate-500">/ tCO₂e</span>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700">
                        {prj.permanence} Permanence
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {prj.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {prj.coBenefits.map((b, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600"
                        >
                          ✓ {b}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">
                        Vintage: {prj.vintage}
                      </span>
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {prj.rating}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Order / Retirement Allocation Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 sticky top-24">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
              Procurement & Retirement Engine
            </span>
            <h3 className="text-lg font-display font-bold text-slate-950">
              Neutralization Order Summary
            </h3>
            <p className="text-xs text-slate-500">
              Direct registry retirement with verifiable serial issuance.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Selected Project
              </label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">{selectedProject.name}</p>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Standard: {selectedProject.standard}</span>
                  <span className="font-mono font-bold text-slate-900">${selectedProject.pricePerTonne} / t</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Volume to Neutralize</label>
                <button
                  type="button"
                  onClick={() => setQuantityTonnes(suggestedOffsetTonnes)}
                  className="text-[11px] text-emerald-700 font-semibold hover:underline"
                >
                  Use Calculated ({suggestedOffsetTonnes} t)
                </button>
              </div>
              <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={quantityTonnes}
                  onChange={(e) => setQuantityTonnes(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="flex-1 px-3 py-2.5 font-mono text-sm text-slate-900 focus:outline-hidden"
                />
                <span className="bg-slate-100 px-3 py-2.5 font-semibold text-slate-600 border-l border-slate-200">
                  tCO₂e
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Retirement Beneficiary
              </label>
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="Company or Individual Name"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                This legal name is permanently written to the public registry serial.
              </span>
            </div>

            {/* Financial Ledger Calculation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Credit Volume:</span>
                <span className="font-mono font-medium">{quantityTonnes.toFixed(1)} tonnes</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Unit Price:</span>
                <span className="font-mono font-medium">${selectedProject.pricePerTonne}.00 / t</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Registry Issuance Fee:</span>
                <span className="font-mono font-medium text-emerald-700">$0.00 (Waived)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-950 text-base">
                <span>Total Procurement:</span>
                <span className="font-mono text-xl">${Number(totalCost).toLocaleString()} USD</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateRetirement}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Generate Retirement Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Retirement Certificate Modal */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsCertificateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                ✓
              </div>
              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                Official Retirement Attestation
              </span>
              <h3 className="text-2xl font-display font-bold text-slate-950">
                Carbon Neutralization Certificate
              </h3>
              <p className="text-xs font-mono text-slate-400">
                SERIAL: CSTK-RET-{Math.floor(100000 + Math.random() * 900000)}-{selectedProject.standard.replace('.', '')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold text-slate-900">{beneficiaryName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Volume Permanently Retired:</span>
                <span className="font-bold font-mono text-emerald-800 text-sm">
                  {quantityTonnes.toFixed(1)} tonnes CO₂e
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Project Name:</span>
                <span className="font-semibold text-slate-900">{selectedProject.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Registry & Methodology:</span>
                <span className="text-slate-700">{selectedProject.standard} ({selectedProject.methodology})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Permanence Commitment:</span>
                <span className="font-semibold text-emerald-700">{selectedProject.permanence}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed p-3 rounded-xl bg-slate-100/70 border border-slate-200/60">
              This certificate affirms that the specified carbon credits have been permanently retired from circulation and cannot be resold or reallocated, fulfilling ESG disclosure requirements.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <span>Print Certificate</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
