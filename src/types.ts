export type GameLocationId = 'kampala' | 'wakiso' | 'entebbe' | 'mukono' | 'jinja' | 'mbarara' | 'gulu' | 'mbale' | 'soroti';

export interface GameLocation {
  id: GameLocationId;
  name: string;
  region: string;
  description: string;
  populationDensity: 'Very High' | 'High' | 'Medium' | 'Growing';
  avgLandPricePerDecimalUGX: number;
  rentalDemandIndex: number; // 1.0 to 3.0
  appreciationRateAnnual: number; // percentage e.g. 0.08 (8%)
  riskFactor: 'Low' | 'Moderate' | 'High';
  isStartingCity: boolean;
}

export interface PlayerProfile {
  name: string;
  companyName: string;
  avatarId: string;
  startingCapitalUGX: number;
  currentCashUGX: number;
  reputation: number; // 0 to 100
  businessLevel: number;
  businessTitle: string;
  experiencePoints: number;
}

export interface GameDate {
  year: number;
  month: number; // 1-12
  day: number;
  totalDaysElapsed: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'CAPITAL' | 'CONSTRUCTION' | 'MANAGEMENT' | 'TAX' | 'LOAN';

export interface FinancialTransaction {
  id: string;
  dateStr: string;
  timestamp: number;
  type: TransactionType;
  description: string;
  amountUGX: number; // positive for inflows, negative for outflows
  previousBalanceUGX: number;
  newBalanceUGX: number;
  entityReference?: string;
}

export interface OwnedProperty {
  id: string;
  title: string;
  locationId: GameLocationId;
  tenureType: 'Mailo' | 'Freehold' | 'Leasehold' | 'Customary';
  sizeDecimals: number;
  purchasePriceUGX: number;
  currentValuationUGX: number;
  purchaseDateStr: string;
  status: 'Raw Land' | 'Under Development' | 'Completed' | 'Rented';
  monthlyRentalIncomeUGX: number;
  occupancyRate: number; // 0 to 1
}

export interface GameState {
  version: string;
  player: PlayerProfile;
  date: GameDate;
  currentLocationId: GameLocationId;
  cashUGX: number;
  transactions: FinancialTransaction[];
  properties: OwnedProperty[];
  liabilitiesUGX: number;
  macroEconomy: {
    inflationRate: number;
    primeLendingRate: number;
    constructionMaterialIndex: number;
    gdpGrowthRate: number;
  };
  settings: {
    soundEnabled: boolean;
    autoSaveEnabled: boolean;
    simulationSpeed: number; // seconds per month
  };
}

export interface TestResultItem {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}
