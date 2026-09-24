import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Zap,
  Car,
  Plane,
  Layers,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  CalculatorState,
  CalculationResult,
  VehicleEntry,
  FlightEntry,
  OtherEmissionEntry,
  VehicleType,
  CabinClass,
  RegionCode,
  ActivePage
} from '../types/carbon';
import {
  REGIONS,
  VEHICLE_FACTORS,
  CABIN_MULTIPLIERS,
  POPULAR_FLIGHT_ROUTES,
  OTHER_EMISSION_FACTORS
} from '../utils/emissionFactors';
import {
  calculateCarbonFootprint,
  INITIAL_CALCULATOR_STATE
} from '../utils/calculationEngine';
import { DonutChart, HorizontalBarChart } from '../components/Charts';
import { ReportModal } from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';
import { saveUserCalculation } from '../lib/userDataService';

interface CalculatorPageProps {
  onNavigate: (page: ActivePage) => void;
  onSetModeledTonnes?: (tonnes: number) => void;
  loadedState?: CalculatorState | null;
  onOpenLogin?: () => void;
}

// Sub-component for smooth number count-up animation
const AnimatedCounter: React.FC<{ target: number; duration?: number }> = ({ target, duration = 1200 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo curve
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = target * easeProgress;
      setCurrent(Number(val.toFixed(1)));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return <span>{current.toFixed(1)}</span>;
};

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  onNavigate,
  onSetModeledTonnes,
  loadedState,
  onOpenLogin,
}) => {
  const { user } = useAuth();

  // Mode: 'intro' | 'form' | 'results'
  const [viewMode, setViewMode] = useState<'intro' | 'form' | 'results'>('intro');
  const [step, setStep] = useState<number>(1);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Form State
  const [calcState, setCalcState] = useState<CalculatorState>(INITIAL_CALCULATOR_STATE);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isSavingToDashboard, setIsSavingToDashboard] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // Populate loadedState if passed from Dashboard
  useEffect(() => {
    if (loadedState) {
      setCalcState(loadedState);
      const computed = calculateCarbonFootprint(loadedState);
      setResults(computed);
      setViewMode('results');
    }
  }, [loadedState]);

  // Update offset in parent if results change
  useEffect(() => {
    if (results && onSetModeledTonnes) {
      onSetModeledTonnes(results.offsetRequirementTonnes);
    }
  }, [results, onSetModeledTonnes]);

  const handleSaveToDashboard = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    if (!results) return;

    setIsSavingToDashboard(true);
    try {
      await saveUserCalculation(user.uid, results);
      setSavedSuccessMsg(true);
      setTimeout(() => setSavedSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save calculation to dashboard:', err);
    } finally {
      setIsSavingToDashboard(false);
    }
  };

  // Step 1 Handlers
  const handleElectricityChange = (kwh: number) => {
    setCalcState((prev) => ({ ...prev, electricityMonthlyKwh: Math.max(0, kwh) }));
  };

  const handleRegionChange = (region: RegionCode) => {
    setCalcState((prev) => ({ ...prev, electricityRegion: region }));
  };

  // Step 2 Handlers (Vehicles)
  const addVehicle = () => {
    const newVehicle: VehicleEntry = {
      id: `veh-${Date.now()}`,
      type: 'petrol_car',
      monthlyDistanceKm: 800,
    };
    setCalcState((prev) => ({ ...prev, vehicles: [...prev.vehicles, newVehicle] }));
  };

  const removeVehicle = (id: string) => {
    setCalcState((prev) => ({ ...prev, vehicles: prev.vehicles.filter((v) => v.id !== id) }));
  };

  const updateVehicle = (id: string, updates: Partial<VehicleEntry>) => {
    setCalcState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  };

  // Step 3 Handlers (Flights)
  const addFlight = () => {
    const newFlight: FlightEntry = {
      id: `fl-${Date.now()}`,
      from: 'Delhi (DEL)',
      to: 'Mumbai (BOM)',
      estimatedKmPerTrip: 1150,
      tripsPerYear: 2,
      cabin: 'economy',
    };
    setCalcState((prev) => ({ ...prev, flights: [...prev.flights, newFlight] }));
  };

  const removeFlight = (id: string) => {
    setCalcState((prev) => ({ ...prev, flights: prev.flights.filter((f) => f.id !== id) }));
  };

  const updateFlight = (id: string, updates: Partial<FlightEntry>) => {
    setCalcState((prev) => ({
      ...prev,
      flights: prev.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const applyFlightRoutePreset = (id: string, route: (typeof POPULAR_FLIGHT_ROUTES)[0]) => {
    updateFlight(id, {
      from: route.from,
      to: route.to,
      estimatedKmPerTrip: route.distanceKm,
    });
  };

  // Step 4 Handlers (Other)
  const addOtherActivity = () => {
    const newOther: OtherEmissionEntry = {
      id: `oth-${Date.now()}`,
      activityType: 'natural_gas',
      label: 'Natural Gas Heating',
      amount: 100,
      unit: 'm³',
    };
    setCalcState((prev) => ({ ...prev, otherEmissions: [...prev.otherEmissions, newOther] }));
  };

  const removeOtherActivity = (id: string) => {
    setCalcState((prev) => ({
      ...prev,
      otherEmissions: prev.otherEmissions.filter((o) => o.id !== id),
    }));
  };

  const updateOtherActivity = (id: string, updates: Partial<OtherEmissionEntry>) => {
    setCalcState((prev) => ({
      ...prev,
      otherEmissions: prev.otherEmissions.map((o) => {
        if (o.id !== id) return o;
        const updated = { ...o, ...updates };
        if (updates.activityType) {
          const cfg = OTHER_EMISSION_FACTORS[updates.activityType] || OTHER_EMISSION_FACTORS.other;
          updated.label = cfg.label;
          updated.unit = cfg.defaultUnit;
        }
        return updated;
      }),
    }));
  };

  // Execution
  const handlePerformCalculation = () => {
    const res = calculateCarbonFootprint(calcState);
    setResults(res);
    setViewMode('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecalculate = () => {
    setViewMode('form');
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper summaries for Step 5 Review
  const totalAnnualKwh = (calcState.electricityMonthlyKwh || 0) * 12;
  const totalAnnualKm = calcState.vehicles.reduce((acc, v) => acc + (v.monthlyDistanceKm || 0) * 12, 0);
  const totalFlightTrips = calcState.flights.reduce((acc, f) => acc + (f.tripsPerYear || 0), 0);

  // -------------------------------------------------------------
  // VIEW 1: INTRODUCTION SCREEN (Prompt Section 4 requirement)
  // -------------------------------------------------------------
  if (viewMode === 'intro') {
    return (
      <div id="calculator-intro-view" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
        <div className="text-center space-y-5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide">
            <span>🌱 MVP Product • Carbon Calculator</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-950 tracking-tight leading-[1.15]">
            Calculate Your Carbon Footprint
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed">
            Understand where your emissions come from and estimate your annual CO₂e footprint.
          </p>

          <div className="pt-4">
            <button
              id="calculator-start-btn"
              onClick={() => {
                setViewMode('form');
                setStep(1);
              }}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <span>Start Calculating</span>
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Value Prop & Scientific Guardrails */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h4 className="font-semibold text-slate-900 text-base">Activity-Based Engine</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Converts real monthly kilowatt-hours, vehicle kilometers, and flight legs into kilograms of CO₂ equivalent.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h4 className="font-semibold text-slate-900 text-base">Regional Factor Config</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Electricity factors calibrated to Indian Central Electricity Authority (CEA v19), UK DEFRA, and US EPA grids.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h4 className="font-semibold text-slate-900 text-base">Honest Compensation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides an indicative offset requirement in tonnes of CO₂e without falsely claiming credit issuance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: MULTI-STEP CALCULATOR FORM (Step 1 to 5)
  // -------------------------------------------------------------
  if (viewMode === 'form') {
    return (
      <div id="calculator-step-container" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Top Step Header & Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-display font-bold text-base text-slate-900">
                Carbon Calculator
              </span>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              Step {step} of 5
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="grid grid-cols-5 text-[11px] font-medium text-slate-400 text-center pt-1">
            <span className={step === 1 ? 'text-slate-900 font-bold' : ''}>1. Power</span>
            <span className={step === 2 ? 'text-slate-900 font-bold' : ''}>2. Travel</span>
            <span className={step === 3 ? 'text-slate-900 font-bold' : ''}>3. Flights</span>
            <span className={step === 4 ? 'text-slate-900 font-bold' : ''}>4. Other</span>
            <span className={step === 5 ? 'text-slate-900 font-bold' : ''}>5. Review</span>
          </div>
        </div>

        {/* Step Body Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
          {/* ------------------ STEP 1: ELECTRICITY ------------------ */}
          {step === 1 && (
            <div className="space-y-6" id="step-1-electricity">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                  Step 1 • Scope 2 Purchased Electricity
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                  How much electricity do you use?
                </h2>
                <p className="text-sm text-slate-500">
                  Grid electricity represents the power consumed in your home, facility, or office space.
                </p>
              </div>

              {/* Monthly Consumption Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Average monthly electricity consumption
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-transparent overflow-hidden shadow-2xs">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={calcState.electricityMonthlyKwh || ''}
                    onChange={(e) => handleElectricityChange(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 500"
                    className="flex-1 px-4 py-3 text-base text-slate-900 focus:outline-hidden font-mono"
                  />
                  <span className="bg-slate-100 border-l border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 flex items-center">
                    kWh / month
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Tip: Check your recent monthly utility bill. Average urban domestic is ~300–600 kWh/mo.
                </p>
              </div>

              {/* Country / Region */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Country / Region
                  </label>
                  <span className="text-xs text-emerald-700 font-medium">
                    Grid Factor: {REGIONS[calcState.electricityRegion]?.gridFactor} kgCO₂e/kWh
                  </span>
                </div>
                <select
                  value={calcState.electricityRegion}
                  onChange={(e) => handleRegionChange(e.target.value as RegionCode)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                >
                  {Object.values(REGIONS).map((reg) => (
                    <option key={reg.code} value={reg.code}>
                      {reg.name} ({reg.gridFactor} kgCO₂e/kWh)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Factor Source: {REGIONS[calcState.electricityRegion]?.gridSource}</span>
                </p>
              </div>

              {/* Calculation Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                <span>Estimated Annual Electricity Consumption:</span>
                <span className="font-mono-data font-bold text-slate-900 text-sm">
                  {totalAnnualKwh.toLocaleString()} kWh/year
                </span>
              </div>
            </div>
          )}

          {/* ------------------ STEP 2: TRANSPORTATION ------------------ */}
          {step === 2 && (
            <div className="space-y-6" id="step-2-transportation">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-teal-700">
                  Step 2 • Ground Transportation
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                  How do you travel?
                </h2>
                <p className="text-sm text-slate-500">
                  Add the vehicles or public transit modes you use regularly for commuting or operations.
                </p>
              </div>

              {/* Vehicle list */}
              <div className="space-y-4">
                {calcState.vehicles.map((v, index) => (
                  <div
                    key={v.id}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Vehicle #{index + 1}
                      </span>
                      {calcState.vehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVehicle(v.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Vehicle Type */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Vehicle Type
                        </label>
                        <select
                          value={v.type}
                          onChange={(e) => updateVehicle(v.id, { type: e.target.value as VehicleType })}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        >
                          <option value="petrol_car">Petrol car</option>
                          <option value="diesel_car">Diesel car</option>
                          <option value="cng_car">CNG car</option>
                          <option value="motorcycle">Motorcycle / Scooter</option>
                          <option value="bus">Bus (Public Transit)</option>
                          <option value="metro_rail">Metro / Rail</option>
                        </select>
                      </div>

                      {/* Distance */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Distance travelled per month
                        </label>
                        <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={v.monthlyDistanceKm || ''}
                            onChange={(e) =>
                              updateVehicle(v.id, {
                                monthlyDistanceKm: Math.max(0, parseFloat(e.target.value) || 0),
                              })
                            }
                            placeholder="e.g. 1000"
                            className="flex-1 px-3 py-2.5 text-sm font-mono text-slate-900 focus:outline-hidden bg-white"
                          />
                          <span className="bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 border-l border-slate-200">
                            km
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-2">
                      <span>Factor: {VEHICLE_FACTORS[v.type]?.factor} kgCO₂e/km</span>
                      <span className="font-mono">
                        ~{((v.monthlyDistanceKm * 12 * VEHICLE_FACTORS[v.type]?.factor) / 1000).toFixed(2)} tCO₂e/yr
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Vehicle Button */}
              <button
                type="button"
                onClick={addVehicle}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>+ Add another vehicle</span>
              </button>
            </div>
          )}

          {/* ------------------ STEP 3: FLIGHTS ------------------ */}
          {step === 3 && (
            <div className="space-y-6" id="step-3-flights">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-sky-700">
                  Step 3 • Aviation & Air Travel
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                  How much do you fly?
                </h2>
                <p className="text-sm text-slate-500">
                  Aviation emissions include radiative forcing altitude multipliers and cabin space allocation.
                </p>
              </div>

              {/* Flights List */}
              <div className="space-y-4">
                {calcState.flights.map((f, index) => (
                  <div
                    key={f.id}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Flight Route #{index + 1}
                      </span>
                      {calcState.flights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFlight(f.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Quick route selector preset */}
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-500">
                        Select Preset Airport Pair (Optional)
                      </label>
                      <select
                        onChange={(e) => {
                          const route = POPULAR_FLIGHT_ROUTES.find(
                            (r) => `${r.from} to ${r.to}` === e.target.value
                          );
                          if (route) applyFlightRoutePreset(f.id, route);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-hidden"
                      >
                        <option value="">-- Choose preset or type custom route below --</option>
                        {POPULAR_FLIGHT_ROUTES.map((r) => (
                          <option key={`${r.from}-${r.to}`} value={`${r.from} to ${r.to}`}>
                            {r.from} ➔ {r.to} ({r.distanceKm} km)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* From */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">From</label>
                        <input
                          type="text"
                          value={f.from}
                          onChange={(e) => updateFlight(f.id, { from: e.target.value })}
                          placeholder="e.g. Delhi (DEL)"
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      {/* To */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">To</label>
                        <input
                          type="text"
                          value={f.to}
                          onChange={(e) => updateFlight(f.id, { to: e.target.value })}
                          placeholder="e.g. Mumbai (BOM)"
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      {/* Trips per year */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Number of trips per year
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={f.tripsPerYear || ''}
                          onChange={(e) =>
                            updateFlight(f.id, { tripsPerYear: Math.max(0, parseInt(e.target.value) || 0) })
                          }
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-mono bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      {/* Cabin Class */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Cabin Class</label>
                        <select
                          value={f.cabin}
                          onChange={(e) => updateFlight(f.id, { cabin: e.target.value as CabinClass })}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        >
                          <option value="economy">Economy (1.0x)</option>
                          <option value="premium_economy">Premium Economy (1.5x)</option>
                          <option value="business">Business (2.8x)</option>
                          <option value="first">First Class (4.0x)</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-2">
                      <span>Distance: {f.estimatedKmPerTrip} km / flight leg</span>
                      <span className="font-mono">
                        ~
                        {(
                          (f.tripsPerYear *
                            f.estimatedKmPerTrip *
                            0.158 *
                            CABIN_MULTIPLIERS[f.cabin]) /
                          1000
                        ).toFixed(2)}{' '}
                        tCO₂e/yr
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Flight Button */}
              <button
                type="button"
                onClick={addFlight}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>+ Add another flight</span>
              </button>

              <p className="text-xs text-slate-400 italic">
                Note: Uses standardized DEFRA and ICAO reference datasets with radiative forcing.
              </p>
            </div>
          )}

          {/* ------------------ STEP 4: OTHER EMISSIONS (OPTIONAL) ------------------ */}
          {step === 4 && (
            <div className="space-y-6" id="step-4-other">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                    Step 4 • Optional Activities
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Optional Step
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                  Tell us about other activities
                </h2>
                <p className="text-sm text-slate-500">
                  Include heating fuels, cooking gas, waste generation, or business hotel per diems. Skip if not applicable.
                </p>
              </div>

              {/* Other Items List */}
              <div className="space-y-4">
                {calcState.otherEmissions.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <p className="text-sm text-slate-600">
                      No other activity sources added yet.
                    </p>
                    <button
                      type="button"
                      onClick={addOtherActivity}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      + Add an Activity (Natural Gas, LPG, Waste...)
                    </button>
                  </div>
                ) : (
                  calcState.otherEmissions.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          {item.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeOtherActivity(item.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Activity Type
                          </label>
                          <select
                            value={item.activityType}
                            onChange={(e) =>
                              updateOtherActivity(item.id, {
                                activityType: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                          >
                            <option value="natural_gas">Natural Gas</option>
                            <option value="lpg">LPG</option>
                            <option value="waste">Waste</option>
                            <option value="business_travel">Business Travel</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Amount (Annual)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.amount || ''}
                            onChange={(e) =>
                              updateOtherActivity(item.id, {
                                amount: Math.max(0, parseFloat(e.target.value) || 0),
                              })
                            }
                            placeholder="Amount"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateOtherActivity(item.id, { unit: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {calcState.otherEmissions.length > 0 && (
                <button
                  type="button"
                  onClick={addOtherActivity}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>+ Add another activity</span>
                </button>
              )}
            </div>
          )}

          {/* ------------------ STEP 5: REVIEW ------------------ */}
          {step === 5 && (
            <div className="space-y-6" id="step-5-review">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                  Step 5 • Pre-Flight Audit
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                  Your Inputs Summary
                </h2>
                <p className="text-sm text-slate-500">
                  Review your configured activities before running the greenhouse gas conversion engine.
                </p>
              </div>

              {/* Review Cards */}
              <div className="space-y-3">
                {/* 1. Electricity */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Electricity</h4>
                      <p className="text-xs text-slate-500 font-mono-data">
                        {totalAnnualKwh.toLocaleString()} kWh/year ({calcState.electricityMonthlyKwh} kWh/mo)
                      </p>
                      <span className="text-[11px] text-slate-400">
                        Region: {REGIONS[calcState.electricityRegion]?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 p-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 2. Transportation */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Transportation</h4>
                      <p className="text-xs text-slate-500 font-mono-data">
                        {totalAnnualKm.toLocaleString()} km/year across {calcState.vehicles.length} vehicle(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 p-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 3. Flights */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Flights</h4>
                      <p className="text-xs text-slate-500 font-mono-data">
                        {totalFlightTrips} trip(s)/year configured
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 p-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 4. Other */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Other Activities</h4>
                      <p className="text-xs text-slate-500">
                        {calcState.otherEmissions.length > 0
                          ? `${calcState.otherEmissions.length} source(s) included`
                          : 'None added'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(4)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 p-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Step Actions Navigation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode('intro')}
                className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                id={`step-${step}-continue-btn`}
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-xs"
              >
                <span>{step === 4 ? 'Calculate My Footprint' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            ) : (
              <button
                type="button"
                id="calculate-footprint-final-btn"
                onClick={handlePerformCalculation}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all flex items-center gap-2.5 shadow-md hover:shadow-lg"
              >
                <span>Calculate Carbon Footprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: RESULTS DASHBOARD (Section 6, 7, 8, 9)
  // -------------------------------------------------------------
  if (viewMode === 'results' && results) {
    return (
      <div id="calculator-results-dashboard" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 animate-in fade-in duration-300">
        {/* Top Back / Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Results Analytics
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
              Carbon Footprint Assessment
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSaveToDashboard}
              disabled={isSavingToDashboard}
              id="results-save-dashboard-btn"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-60"
            >
              {isSavingToDashboard ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span>{savedSuccessMsg ? 'Saved to Dashboard!' : 'Save to Dashboard'}</span>
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              id="results-download-report-btn"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Report</span>
            </button>
            <button
              onClick={handleRecalculate}
              id="results-recalculate-btn"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Recalculate</span>
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              id="results-explore-credits-top-btn"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>Explore Carbon Credits</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {savedSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Assessment snapshot successfully stored in your personal carbon dashboard.</span>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="font-bold underline text-emerald-950 hover:text-black"
            >
              View Dashboard →
            </button>
          </div>
        )}

        {/* 6. MAIN RESULT HERO CARD (Prompt Section 6) */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your Estimated Carbon Footprint
            </span>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl sm:text-6xl font-display font-bold text-slate-950 tracking-tight">
                <AnimatedCounter target={results.totalTonnesCO2e} />
              </h2>
              <span className="text-2xl sm:text-3xl font-display font-semibold text-slate-600">
                tCO₂e
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600">
              Estimated annual emissions ({results.totalKgCO2e.toLocaleString()} kgCO₂e)
            </p>
          </div>

          {/* Small methodology note (Prompt required) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              This result is an estimate based on the activity data entered and verified emission factors from regional power grids (e.g. CEA / EPA / DEFRA) and standard transport fuel benchmarks. It serves as an indicative baseline for decarbonization planning.
            </p>
          </div>

          {/* Emissions Breakdown Section: Donut + Bar */}
          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-slate-900">
                Emissions Breakdown by Activity
              </h3>
              <span className="text-xs text-slate-400">Hover slices or legend for details</span>
            </div>

            {/* Donut Chart */}
            <DonutChart breakdown={results.breakdown} totalTonnes={results.totalTonnesCO2e} />

            {/* Horizontal Bar Chart */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                Relative Category Volume
              </h4>
              <HorizontalBarChart breakdown={results.breakdown} totalTonnes={results.totalTonnesCO2e} />
            </div>
          </div>
        </div>

        {/* 7. CARBON CREDIT SECTION (Prompt Section 7 requirement) */}
        <div
          id="carbon-credit-offset-card"
          className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-10 border border-emerald-800 shadow-xl space-y-6 relative overflow-hidden"
        >
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                Estimated Offset Requirement
              </span>
              <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded bg-emerald-800/80 text-emerald-200 border border-emerald-700/60">
                1:1 Neutralization Baseline
              </span>
            </div>

            {/* Display: 24.6 tonnes CO2e */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-display font-bold text-emerald-300 tracking-tight">
                {results.offsetRequirementTonnes}
              </span>
              <span className="text-2xl font-display font-semibold text-emerald-200/80">
                tonnes CO₂e
              </span>
            </div>

            {/* Text verbatim specification */}
            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
              Based on your estimated emissions, approximately{' '}
              <strong className="text-white font-semibold">{results.offsetRequirementTonnes} tonnes of CO₂e</strong>{' '}
              would need to be compensated for to offset an equivalent quantity of emissions.
            </p>

            {/* Critical compliance callout */}
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300/90 leading-relaxed">
              <strong className="text-white">Notice:</strong> The CSTACK Carbon Calculator quantifies emission impact and required compensation volume. It does not create, generate, certify, verify, or award carbon credits.
            </div>

            {/* CTA: Explore Carbon Credits → */}
            <div className="pt-2">
              <button
                id="explore-carbon-credits-cta-btn"
                onClick={() => onNavigate('marketplace')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-emerald-50 font-semibold text-sm transition-all shadow-md active:scale-[0.99]"
              >
                <span>Explore Carbon Credits</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>

        {/* 8. INSIGHTS SECTION (Prompt Section 8 requirement) */}
        <div id="insights-section" className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-slate-950">
              Where Your Emissions Come From
            </h3>
            <p className="text-xs text-slate-500">
              Granular source breakdown identifying where mitigation will yield highest reduction leverage.
            </p>
          </div>

          {/* Cards for each category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.breakdown.map((cat) => {
              const isLargest = cat.category === results.largestCategory.category;
              return (
                <div
                  key={cat.category}
                  className={`p-5 rounded-2xl border transition-all ${
                    isLargest
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {cat.label}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {cat.percentage}%
                    </span>
                  </div>

                  <p className="text-2xl font-display font-bold text-slate-950">
                    {cat.tCO2e} <span className="text-sm font-normal text-slate-500">tCO₂e</span>
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    {isLargest ? 'Your largest estimated emission source.' : `Scope: ${cat.primaryActivity}`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Simple insight highlight: "Biggest opportunity" */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base shrink-0 mt-0.5 border border-amber-200">
                ⚡
              </div>
              <div className="space-y-0.5">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-800">
                  Biggest Opportunity
                </span>
                <p className="text-sm text-slate-700 font-medium">
                  <strong>{results.largestCategory.label}</strong> accounts for the largest share ({results.largestCategory.percentage}%) of your estimated footprint ({results.largestCategory.tCO2e} tCO₂e).
                </p>
                <p className="text-xs text-slate-500">
                  Transitioning this activity to clean renewable alternatives offers your fastest decarbonization vector.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
            >
              Export Summary
            </button>
          </div>
        </div>

        {/* 9. RESULTS ACTIONS (Prompt Section 9 requirement) */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="action-download-report"
            onClick={() => setIsReportOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download Report</span>
          </button>

          <button
            id="action-recalculate"
            onClick={handleRecalculate}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>Recalculate</span>
          </button>

          <button
            id="action-explore-credits"
            onClick={() => onNavigate('marketplace')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>Explore Carbon Credits</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Report Modal */}
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          result={results}
        />
      </div>
    );
  }

  return null;
};
