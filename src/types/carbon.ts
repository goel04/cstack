export type RegionCode = 'IN' | 'US' | 'GB' | 'EU' | 'GLOBAL' | 'SG' | 'AU';

export interface RegionOption {
  code: RegionCode;
  name: string;
  gridFactor: number; // kgCO2e per kWh
  gridSource: string;
}

export interface EmissionFactor {
  id: string;
  activity: string;
  category: 'electricity' | 'transportation' | 'flights' | 'other';
  unit: string;
  factor: number; // kgCO2e per unit
  source: string;
  year: number;
  region?: string;
  description?: string;
}

export type VehicleType = 
  | 'petrol_car'
  | 'diesel_car'
  | 'cng_car'
  | 'motorcycle'
  | 'bus'
  | 'metro_rail';

export interface VehicleEntry {
  id: string;
  type: VehicleType;
  monthlyDistanceKm: number;
}

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface FlightEntry {
  id: string;
  from: string;
  to: string;
  estimatedKmPerTrip: number;
  tripsPerYear: number;
  cabin: CabinClass;
}

export interface OtherEmissionEntry {
  id: string;
  activityType: 'natural_gas' | 'lpg' | 'waste' | 'business_travel' | 'other';
  label: string;
  amount: number;
  unit: string;
}

export interface CalculatorState {
  // Step 1: Electricity
  electricityMonthlyKwh: number;
  electricityRegion: RegionCode;

  // Step 2: Transportation
  vehicles: VehicleEntry[];

  // Step 3: Flights
  flights: FlightEntry[];

  // Step 4: Other
  otherEmissions: OtherEmissionEntry[];
}

export interface CategoryBreakdown {
  category: 'electricity' | 'transportation' | 'flights' | 'other';
  label: string;
  kgCO2e: number;
  tCO2e: number;
  percentage: number;
  primaryActivity: string;
}

export interface CalculationResult {
  totalKgCO2e: number;
  totalTonnesCO2e: number;
  offsetRequirementTonnes: number;
  breakdown: CategoryBreakdown[];
  largestCategory: CategoryBreakdown;
  generatedAt: string;
  inputsSnapshot: CalculatorState;
}

export type ActivePage = 'home' | 'calculator' | 'about' | 'marketplace' | 'accounting' | 'reporting';
