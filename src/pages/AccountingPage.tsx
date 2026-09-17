import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  Factory,
  Zap,
  Flame,
  Truck,
  Wind,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  Layers,
  Search,
  ChevronRight,
  TrendingDown,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ActivePage } from '../types/carbon';

interface AccountingPageProps {
  onNavigate: (page: ActivePage) => void;
}

interface ActivityEntry {
  id: string;
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  category: string;
  source: string;
  facility: string;
  activityAmount: string;
  emissionFactor: string;
  tCO2e: number;
  period: string;
  status: 'Verified' | 'Pending Audit';
}

const INITIAL_ACTIVITIES: ActivityEntry[] = [
  {
    id: 'ACT-101',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    source: 'Natural Gas Boiler (Bldg A)',
    facility: 'HQ Campus',
    activityAmount: '14,200 m³',
    emissionFactor: '2.03 kgCO₂e/m³ (DEFRA)',
    tCO2e: 28.8,
    period: '2025-Q4',
    status: 'Verified',
  },
  {
    id: 'ACT-102',
    scope: 'Scope 1',
    category: 'Mobile Fleet',
    source: 'Executive Diesel Transport',
    facility: 'Logistics Hub',
    activityAmount: '42,000 km',
    emissionFactor: '0.171 kgCO₂e/km',
    tCO2e: 7.2,
    period: '2025-Q4',
    status: 'Verified',
  },
  {
    id: 'ACT-103',
    scope: 'Scope 1',
    category: 'Fugitive Emissions',
    source: 'HVAC Chiller R410a Top-up',
    facility: 'Data Center 1',
    activityAmount: '8.4 kg',
    emissionFactor: '2,088 GWP (IPCC AR6)',
    tCO2e: 17.5,
    period: '2025-Q4',
    status: 'Verified',
  },
  {
    id: 'ACT-201',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    source: 'Grid Power (Location-based)',
    facility: 'HQ Campus',
    activityAmount: '124,500 kWh',
    emissionFactor: '0.716 kgCO₂e/kWh (CEA)',
    tCO2e: 89.1,
    period: '2025-Q4',
    status: 'Verified',
  },
  {
    id: 'ACT-202',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    source: 'Clean Solar PPA (Market-based)',
    facility: 'Mfg Facility North',
    activityAmount: '86,000 kWh',
    emissionFactor: '0.015 kgCO₂e/kWh (EAC retired)',
    tCO2e: 1.3,
    period: '2025-Q4',
    status: 'Verified',
  },
  {
    id: 'ACT-301',
    scope: 'Scope 3',
    category: 'Cat 1: Purchased Goods',
    source: 'Aluminum & Steel Raw Inflow',
    facility: 'Global Supply',
    activityAmount: '$340,000 spend',
    emissionFactor: '0.41 kgCO₂e/$ (EEIO)',
    tCO2e: 139.4,
    period: '2025-Q4',
    status: 'Verified',
  },
  {
    id: 'ACT-302',
    scope: 'Scope 3',
    category: 'Cat 6: Business Travel',
    source: 'International & Domestic Flights',
    facility: 'Corporate',
    activityAmount: '112 Flight legs',
    emissionFactor: 'DEFRA with RF multiplier',
    tCO2e: 34.2,
    period: '2025-Q4',
    status: 'Verified',
  },
  {
    id: 'ACT-303',
    scope: 'Scope 3',
    category: 'Cat 7: Employee Commuting',
    source: 'Hybrid Workforce Commute Survey',
    facility: 'HQ Campus',
    activityAmount: '240 Employees',
    emissionFactor: 'Regional transit mix',
    tCO2e: 19.8,
    period: '2025-Q4',
    status: 'Pending Audit',
  },
];

export const AccountingPage: React.FC<AccountingPageProps> = ({ onNavigate }) => {
  const [selectedScope, setSelectedScope] = useState<'All' | 'Scope 1' | 'Scope 2' | 'Scope 3'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [activities, setActivities] = useState<ActivityEntry[]>(INITIAL_ACTIVITIES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New activity state
  const [newSource, setNewSource] = useState('');
  const [newScope, setNewScope] = useState<'Scope 1' | 'Scope 2' | 'Scope 3'>('Scope 1');
  const [newCategory, setNewCategory] = useState('Stationary Combustion');
  const [newFacility, setNewFacility] = useState('HQ Campus');
  const [newAmount, setNewAmount] = useState('');
  const [newTCO2e, setNewTCO2e] = useState('');

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource || !newTCO2e) return;

    const entry: ActivityEntry = {
      id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
      scope: newScope,
      category: newCategory,
      source: newSource,
      facility: newFacility,
      activityAmount: newAmount || 'Custom quantity',
      emissionFactor: 'GHG Protocol Standard',
      tCO2e: parseFloat(newTCO2e) || 0,
      period: '2026-Q1',
      status: 'Pending Audit',
    };

    setActivities([entry, ...activities]);
    setIsAddModalOpen(false);
    setNewSource('');
    setNewAmount('');
    setNewTCO2e('');
  };

  const filteredActivities = activities.filter((act) => {
    const matchesScope = selectedScope === 'All' || act.scope === selectedScope;
    const matchesFacility = facilityFilter === 'All' || act.facility === facilityFilter;
    const matchesSearch =
      act.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.facility.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScope && matchesFacility && matchesSearch;
  });

  const scope1Total = activities
    .filter((a) => a.scope === 'Scope 1')
    .reduce((sum, a) => sum + a.tCO2e, 0);

  const scope2Total = activities
    .filter((a) => a.scope === 'Scope 2')
    .reduce((sum, a) => sum + a.tCO2e, 0);

  const scope3Total = activities
    .filter((a) => a.scope === 'Scope 3')
    .reduce((sum, a) => sum + a.tCO2e, 0);

  const grandTotal = scope1Total + scope2Total + scope3Total;

  return (
    <div id="accounting-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Enterprise Product
            </span>
            <span className="text-xs font-mono text-slate-500">GHG Protocol Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-950 tracking-tight">
            Carbon Accounting
          </h1>
          <p className="text-sm text-slate-600">
            Real-time organizational greenhouse gas inventory ledger across Scope 1, Scope 2, and upstream Scope 3.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('reporting')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Generate ESG Disclosure</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Activity Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Corporate Footprint
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">CY 2025</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              {grandTotal.toFixed(1)}
            </span>
            <span className="text-base text-slate-400 font-medium">tCO₂e</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-8.4% vs. previous baseline</span>
          </div>
        </div>

        {/* Scope 1 */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Scope 1 Direct
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {((scope1Total / grandTotal) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
              {scope1Total.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">tCO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Stationary fuels, vehicle fleet, and fugitive refrigerants.
          </p>
        </div>

        {/* Scope 2 */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Scope 2 Indirect
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {((scope2Total / grandTotal) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
              {scope2Total.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">tCO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Purchased electricity, steam, and chilled water.
          </p>
        </div>

        {/* Scope 3 */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Scope 3 Value Chain
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {((scope3Total / grandTotal) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
              {scope3Total.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">tCO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Supply chain, flights, commute, and waste streams.
          </p>
        </div>
      </div>

      {/* Scope Filter Buttons & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Scope Segmented Control */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            {(['All', 'Scope 1', 'Scope 2', 'Scope 3'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedScope(sc)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedScope === sc
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sc === 'All' ? 'All Scopes' : sc}
              </button>
            ))}
          </div>

          {/* Facility & Search */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activity source or category..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 w-56 sm:w-64"
              />
            </div>

            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden"
            >
              <option value="All">All Facilities</option>
              <option value="HQ Campus">HQ Campus</option>
              <option value="Logistics Hub">Logistics Hub</option>
              <option value="Data Center 1">Data Center 1</option>
              <option value="Mfg Facility North">Mfg Facility North</option>
              <option value="Global Supply">Global Supply</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
        </div>

        {/* Activity Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Entry ID</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Activity Source</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Activity Data</th>
                <th className="py-3 px-4">Emission Factor</th>
                <th className="py-3 px-4 text-right">tCO₂e</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-600">{act.id}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        act.scope === 'Scope 1'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : act.scope === 'Scope 2'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {act.scope}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{act.source}</p>
                    <p className="text-[11px] text-slate-400">{act.category}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{act.facility}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{act.activityAmount}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{act.emissionFactor}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {act.tCO2e.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        act.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {act.status === 'Verified' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
                      <span>{act.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Science-Based Targets (SBTi) Trajectory Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
              Decarbonization Pathway
            </span>
            <h3 className="text-lg font-display font-bold text-slate-950 mt-1">
              SBTi 1.5°C Aligned Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Annual 4.2% linear reduction target required to reach net-zero by 2030 across operational boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <span>Offset Residual Baseline</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500">2023 Baseline</span>
            <p className="text-xl font-display font-bold text-slate-800">380.0 tCO₂e</p>
            <span className="text-[10px] text-slate-400">Pre-intervention level</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-bold">2025 Current</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 rounded font-mono font-bold">
                Active
              </span>
            </div>
            <p className="text-xl font-display font-bold text-emerald-950">{grandTotal.toFixed(1)} tCO₂e</p>
            <span className="text-[10px] text-emerald-700 font-medium">On track for 2025 milestone</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500">2027 Interim Target</span>
            <p className="text-xl font-display font-bold text-slate-800">210.0 tCO₂e</p>
            <span className="text-[10px] text-slate-400">Requires Scope 2 Solar PPA</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500">2030 Net-Zero Target</span>
            <p className="text-xl font-display font-bold text-slate-800">38.0 tCO₂e</p>
            <span className="text-[10px] text-slate-400">Residual neutralizing buffer</span>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-display font-bold text-slate-950">
                Add Carbon Accounting Entry
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scope Category</label>
                <select
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                >
                  <option value="Scope 1">Scope 1 (Direct Combustion / Fleet / Refrigerant)</option>
                  <option value="Scope 2">Scope 2 (Purchased Electricity / Steam)</option>
                  <option value="Scope 3">Scope 3 (Value Chain / Travel / Commute)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source / Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diesel Generator Backup #2 or Cloud Compute Servers"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility</label>
                  <select
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                  >
                    <option value="HQ Campus">HQ Campus</option>
                    <option value="Logistics Hub">Logistics Hub</option>
                    <option value="Data Center 1">Data Center 1</option>
                    <option value="Mfg Facility North">Mfg Facility North</option>
                    <option value="Global Supply">Global Supply</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Volume</label>
                  <input
                    type="text"
                    placeholder="e.g. 15,000 Litres"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Calculated Emissions (tCO₂e)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 12.4"
                  value={newTCO2e}
                  onChange={(e) => setNewTCO2e(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
