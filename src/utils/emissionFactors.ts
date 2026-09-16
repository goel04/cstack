import { RegionOption, EmissionFactor, VehicleType, CabinClass } from '../types/carbon';

export const REGIONS: Record<string, RegionOption> = {
  IN: {
    code: 'IN',
    name: 'India',
    gridFactor: 0.716, // kgCO2e per kWh (CEA CO2 Baseline Database v19)
    gridSource: 'Central Electricity Authority (CEA) v19, 2023',
  },
  US: {
    code: 'US',
    name: 'United States',
    gridFactor: 0.386, // kgCO2e per kWh (EPA eGRID national average)
    gridSource: 'US EPA eGRID2023 National Average',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    gridFactor: 0.207, // kgCO2e per kWh (UK DEFRA/DESNZ GHG Conversion Factors)
    gridSource: 'UK DESNZ / DEFRA Greenhouse Gas Conversion Factors 2024',
  },
  EU: {
    code: 'EU',
    name: 'European Union (Average)',
    gridFactor: 0.231, // kgCO2e per kWh (EEA average)
    gridSource: 'European Environment Agency (EEA) 2023',
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    gridFactor: 0.405, // kgCO2e per kWh
    gridSource: 'Energy Market Authority Singapore 2023',
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    gridFactor: 0.656, // kgCO2e per kWh National Greenhouse Accounts
    gridSource: 'Australian National Greenhouse Accounts 2023',
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'Global Average (IEA)',
    gridFactor: 0.475, // kgCO2e per kWh (IEA World Energy Outlook benchmark)
    gridSource: 'International Energy Agency (IEA) Global Grid Factor 2023',
  },
};

export const VEHICLE_FACTORS: Record<VehicleType, { label: string; factor: number; source: string; unit: string }> = {
  petrol_car: {
    label: 'Petrol car',
    factor: 0.171, // kgCO2e per km (DEFRA / ARAI passenger vehicle average)
    source: 'UK DEFRA & ARAI passenger vehicle factors 2024',
    unit: 'km',
  },
  diesel_car: {
    label: 'Diesel car',
    factor: 0.168, // kgCO2e per km
    source: 'UK DEFRA passenger car conversion factors 2024',
    unit: 'km',
  },
  cng_car: {
    label: 'CNG car',
    factor: 0.124, // kgCO2e per km
    source: 'ARAI & IPCC transport emissions factor',
    unit: 'km',
  },
  motorcycle: {
    label: 'Motorcycle / Scooter',
    factor: 0.098, // kgCO2e per km
    source: 'DEFRA two-wheeler benchmark',
    unit: 'km',
  },
  bus: {
    label: 'Bus (Public Transit)',
    factor: 0.082, // kgCO2e per passenger-km
    source: 'National Transit Database & DEFRA 2024',
    unit: 'km',
  },
  metro_rail: {
    label: 'Metro / Rail',
    factor: 0.035, // kgCO2e per passenger-km
    source: 'Rail carbon efficiency factors (GHG Protocol Scope 3)',
    unit: 'km',
  },
};

export const CABIN_MULTIPLIERS: Record<CabinClass, number> = {
  economy: 1.0,
  premium_economy: 1.5,
  business: 2.8,
  first: 4.0,
};

export const FLIGHT_BASE_FACTOR_PER_KM = 0.158; // kgCO2e per passenger km (DEFRA average flight with radiative forcing)

export const OTHER_EMISSION_FACTORS: Record<string, { label: string; factor: number; defaultUnit: string; source: string }> = {
  natural_gas: {
    label: 'Natural Gas',
    factor: 2.02, // kgCO2e per m3
    defaultUnit: 'm³',
    source: 'IPCC & DEFRA fuel factors 2024',
  },
  lpg: {
    label: 'LPG (Bottled Gas)',
    factor: 2.98, // kgCO2e per kg
    defaultUnit: 'kg',
    source: 'GHG Protocol Stationary Combustion Guideline',
  },
  waste: {
    label: 'Municipal Solid Waste',
    factor: 0.46, // kgCO2e per kg landfill waste
    defaultUnit: 'kg',
    source: 'EPA WARM & DEFRA waste treatment',
  },
  business_travel: {
    label: 'Hotel Stays / Per Diem',
    factor: 24.5, // kgCO2e per night
    defaultUnit: 'nights',
    source: 'Cornell Hotel Sustainability Benchmarking Index (CHSB)',
  },
  other: {
    label: 'Custom Activity',
    factor: 1.0, // direct kgCO2e
    defaultUnit: 'kgCO₂e',
    source: 'User specified conversion',
  },
};

export const POPULAR_FLIGHT_ROUTES = [
  { from: 'Delhi (DEL)', to: 'Mumbai (BOM)', distanceKm: 1150 },
  { from: 'Bengaluru (BLR)', to: 'Delhi (DEL)', distanceKm: 1740 },
  { from: 'London (LHR)', to: 'New York (JFK)', distanceKm: 5550 },
  { from: 'San Francisco (SFO)', to: 'New York (JFK)', distanceKm: 4150 },
  { from: 'Singapore (SIN)', to: 'Tokyo (HND)', distanceKm: 5310 },
  { from: 'Paris (CDG)', to: 'Berlin (BER)', distanceKm: 880 },
  { from: 'Dubai (DXB)', to: 'London (LHR)', distanceKm: 5470 },
  { from: 'Custom Route', to: 'Custom Route', distanceKm: 1200 },
];
