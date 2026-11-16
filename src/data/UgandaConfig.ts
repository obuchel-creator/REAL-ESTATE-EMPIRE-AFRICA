import { GameLocation } from '../types';

export const UGANDA_LOCATIONS: GameLocation[] = [
  {
    id: 'kampala',
    name: 'Kampala (Capital District)',
    region: 'Central Region',
    description: 'The bustling economic and political capital of Uganda. High commercial and residential demand, premium land values, and rapid urban densification.',
    populationDensity: 'Very High',
    avgLandPricePerDecimalUGX: 45000000, // 45M UGX per decimal
    rentalDemandIndex: 2.4,
    appreciationRateAnnual: 0.12,
    riskFactor: 'Low',
    isStartingCity: true,
  },
  {
    id: 'wakiso',
    name: 'Wakiso (Greater Kampala)',
    region: 'Central Region',
    description: 'The fastest-growing suburban and satellite district surrounding Kampala. Massive demand for middle-income housing estates and gated communities.',
    populationDensity: 'Very High',
    avgLandPricePerDecimalUGX: 25000000,
    rentalDemandIndex: 2.2,
    appreciationRateAnnual: 0.14,
    riskFactor: 'Low',
    isStartingCity: false,
  },
  {
    id: 'entebbe',
    name: 'Entebbe (Peninsula & Airport Hub)',
    region: 'Central Region',
    description: 'Scenic lakeside peninsula hosting the International Airport, luxury resorts, UN hubs, and upscale expatriate residential rentals.',
    populationDensity: 'High',
    avgLandPricePerDecimalUGX: 35000000,
    rentalDemandIndex: 2.0,
    appreciationRateAnnual: 0.10,
    riskFactor: 'Low',
    isStartingCity: false,
  },
  {
    id: 'mukono',
    name: 'Mukono (Eastern Corridor)',
    region: 'Central Region',
    description: 'Industrial and university hub along the Kampala-Jinja highway. Strong student rental markets and warehouse development potential.',
    populationDensity: 'High',
    avgLandPricePerDecimalUGX: 18000000,
    rentalDemandIndex: 1.8,
    appreciationRateAnnual: 0.09,
    riskFactor: 'Moderate',
    isStartingCity: false,
  },
  {
    id: 'jinja',
    name: 'Jinja (Source of the Nile)',
    region: 'Eastern Region',
    description: 'Historic industrial capital and tourism hotspot on Lake Victoria. Growing hospitality real estate and agro-processing warehousing.',
    populationDensity: 'Medium',
    avgLandPricePerDecimalUGX: 12000000,
    rentalDemandIndex: 1.5,
    appreciationRateAnnual: 0.08,
    riskFactor: 'Moderate',
    isStartingCity: false,
  },
  {
    id: 'mbarara',
    name: 'Mbarara (Western Commercial Hub)',
    region: 'Western Region',
    description: 'The commercial heartbeat of Western Uganda. Thriving retail centers, medical institutions, and dairy processing commercial land.',
    populationDensity: 'High',
    avgLandPricePerDecimalUGX: 15000000,
    rentalDemandIndex: 1.6,
    appreciationRateAnnual: 0.09,
    riskFactor: 'Moderate',
    isStartingCity: false,
  },
  {
    id: 'gulu',
    name: 'Gulu (Northern Metropolis)',
    region: 'Northern Region',
    description: 'The commercial and humanitarian gateway to Northern Uganda and South Sudan trade routes. Rapidly modernizing regional hub.',
    populationDensity: 'Growing',
    avgLandPricePerDecimalUGX: 8000000,
    rentalDemandIndex: 1.4,
    appreciationRateAnnual: 0.11,
    riskFactor: 'Moderate',
    isStartingCity: false,
  },
  {
    id: 'mbale',
    name: 'Mbale (Industrial City at Mount Elgon)',
    region: 'Eastern Region',
    description: 'Picturesque city at the foot of Mount Elgon featuring government industrial parks and expanding urban commercial zones.',
    populationDensity: 'Medium',
    avgLandPricePerDecimalUGX: 9000000,
    rentalDemandIndex: 1.3,
    appreciationRateAnnual: 0.08,
    riskFactor: 'Moderate',
    isStartingCity: false,
  },
  {
    id: 'soroti',
    name: 'Soroti (Teso Sub-region Hub)',
    region: 'Eastern Region',
    description: 'Rising agricultural and aviation training center with growing demand for commercial godowns and residential staff housing.',
    populationDensity: 'Growing',
    avgLandPricePerDecimalUGX: 6000000,
    rentalDemandIndex: 1.2,
    appreciationRateAnnual: 0.07,
    riskFactor: 'High',
    isStartingCity: false,
  },
];

export const INITIAL_MACRO_ECONOMY = {
  inflationRate: 0.052, // 5.2% Bank of Uganda target band
  primeLendingRate: 0.175, // 17.5% commercial bank average
  constructionMaterialIndex: 100.0,
  gdpGrowthRate: 0.060, // 6.0% annual growth
};

export function formatUGX(amount: number): string {
  const rounded = Math.round(amount);
  return 'UGX ' + rounded.toLocaleString('en-US');
}
