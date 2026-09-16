import { CalculatorState, CalculationResult, CategoryBreakdown } from '../types/carbon';
import { REGIONS, VEHICLE_FACTORS, CABIN_MULTIPLIERS, FLIGHT_BASE_FACTOR_PER_KM, OTHER_EMISSION_FACTORS } from './emissionFactors';

/**
 * Carbon Calculation Engine
 * 
 * Formula: Activity Data × Emission Factor = Estimated kgCO₂e
 * Total tCO₂e = kgCO₂e / 1000
 * 
 * Decoupled from UI components to allow future API/backend substitution.
 */

export function calculateElectricityEmissions(monthlyKwh: number, regionCode: string): number {
  if (!monthlyKwh || monthlyKwh <= 0) return 0;
  const region = REGIONS[regionCode] || REGIONS.IN;
  const annualKwh = monthlyKwh * 12;
  // kgCO2e = kWh * kgCO2e/kWh
  return annualKwh * region.gridFactor;
}

export function calculateTransportationEmissions(vehicles: CalculatorState['vehicles']): number {
  if (!vehicles || vehicles.length === 0) return 0;
  let totalKg = 0;
  for (const v of vehicles) {
    const factorInfo = VEHICLE_FACTORS[v.type] || VEHICLE_FACTORS.petrol_car;
    const annualKm = (v.monthlyDistanceKm || 0) * 12;
    totalKg += annualKm * factorInfo.factor;
  }
  return totalKg;
}

export function calculateFlightEmissions(flights: CalculatorState['flights']): number {
  if (!flights || flights.length === 0) return 0;
  let totalKg = 0;
  for (const f of flights) {
    const cabinMultiplier = CABIN_MULTIPLIERS[f.cabin] || 1.0;
    const distance = f.estimatedKmPerTrip || 1000;
    const trips = f.tripsPerYear || 0;
    // Each roundtrip or trip: trips * distance * baseFactor * cabinMultiplier
    totalKg += trips * distance * FLIGHT_BASE_FACTOR_PER_KM * cabinMultiplier;
  }
  return totalKg;
}

export function calculateOtherEmissions(otherEntries: CalculatorState['otherEmissions']): number {
  if (!otherEntries || otherEntries.length === 0) return 0;
  let totalKg = 0;
  for (const entry of otherEntries) {
    const factorConfig = OTHER_EMISSION_FACTORS[entry.activityType] || OTHER_EMISSION_FACTORS.other;
    const amount = entry.amount || 0;
    totalKg += amount * factorConfig.factor;
  }
  return totalKg;
}

export function calculateCarbonFootprint(state: CalculatorState): CalculationResult {
  const electricityKg = calculateElectricityEmissions(state.electricityMonthlyKwh, state.electricityRegion);
  const transportKg = calculateTransportationEmissions(state.vehicles);
  const flightsKg = calculateFlightEmissions(state.flights);
  const otherKg = calculateOtherEmissions(state.otherEmissions);

  const totalKg = electricityKg + transportKg + flightsKg + otherKg;
  const safeTotalKg = Math.max(totalKg, 0.001); // avoid divide by zero

  const electricityTonnes = electricityKg / 1000;
  const transportTonnes = transportKg / 1000;
  const flightsTonnes = flightsKg / 1000;
  const otherTonnes = otherKg / 1000;
  const totalTonnes = totalKg / 1000;

  const breakdown: CategoryBreakdown[] = [
    {
      category: 'electricity',
      label: 'Electricity',
      kgCO2e: electricityKg,
      tCO2e: Number(electricityTonnes.toFixed(2)),
      percentage: Math.round((electricityKg / safeTotalKg) * 100),
      primaryActivity: `${state.electricityMonthlyKwh || 0} kWh/mo (${REGIONS[state.electricityRegion]?.name || 'Grid'})`,
    },
    {
      category: 'transportation',
      label: 'Transportation',
      kgCO2e: transportKg,
      tCO2e: Number(transportTonnes.toFixed(2)),
      percentage: Math.round((transportKg / safeTotalKg) * 100),
      primaryActivity: `${state.vehicles.length} vehicle(s) configured`,
    },
    {
      category: 'flights',
      label: 'Flights & Aviation',
      kgCO2e: flightsKg,
      tCO2e: Number(flightsTonnes.toFixed(2)),
      percentage: Math.round((flightsKg / safeTotalKg) * 100),
      primaryActivity: `${state.flights.reduce((acc, f) => acc + (f.tripsPerYear || 0), 0)} trip(s)/year`,
    },
    {
      category: 'other',
      label: 'Other Activities',
      kgCO2e: otherKg,
      tCO2e: Number(otherTonnes.toFixed(2)),
      percentage: Math.round((otherKg / safeTotalKg) * 100),
      primaryActivity: `${state.otherEmissions.length} activity source(s)`,
    },
  ];

  // Sort to find largest
  const sortedBreakdown = [...breakdown].sort((a, b) => b.kgCO2e - a.kgCO2e);
  const largestCategory = sortedBreakdown[0] || breakdown[0];

  return {
    totalKgCO2e: Math.round(totalKg),
    totalTonnesCO2e: Number(totalTonnes.toFixed(2)),
    offsetRequirementTonnes: Number(totalTonnes.toFixed(2)),
    breakdown,
    largestCategory,
    generatedAt: new Date().toISOString(),
    inputsSnapshot: state,
  };
}

/**
 * Default initial state for a fresh calculator session.
 * Provides sensible starting points while letting the user customize every step.
 */
export const INITIAL_CALCULATOR_STATE: CalculatorState = {
  electricityMonthlyKwh: 500,
  electricityRegion: 'IN',
  vehicles: [
    {
      id: 'veh-1',
      type: 'petrol_car',
      monthlyDistanceKm: 1000,
    },
  ],
  flights: [
    {
      id: 'fl-1',
      from: 'Delhi (DEL)',
      to: 'Mumbai (BOM)',
      estimatedKmPerTrip: 1150,
      tripsPerYear: 4,
      cabin: 'economy',
    },
  ],
  otherEmissions: [
    {
      id: 'oth-1',
      activityType: 'lpg',
      label: 'LPG Domestic Gas',
      amount: 14.2 * 10, // ~10 domestic cylinders / year in kg
      unit: 'kg',
    },
    {
      id: 'oth-2',
      activityType: 'waste',
      label: 'Municipal Solid Waste',
      amount: 400, // 400 kg/year
      unit: 'kg',
    },
  ],
};
