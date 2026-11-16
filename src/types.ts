export type GameLocationId = 'kololo' | 'nakasero' | 'bukoto' | 'ntinda' | 'kira' | 'naalya' | 'gayaza' | 'mukono' | 'entebbe';

export type TenureType = 'FREEHOLD' | 'MAILO' | 'LEASEHOLD';
export type ZoneTier = 'PRIME' | 'RESIDENTIAL' | 'EMERGING';

export type ConstructionStage = 'PLAN_APPROVAL' | 'FOUNDATION' | 'WALLING_ROOFING' | 'FINISHING' | 'OCCUPATION_PERMIT' | 'COMPLETED';

export type LoanType = 'LAND_ACQUISITION' | 'CONSTRUCTION_FACILITY' | 'EQUITY_RELEASE';
export type TaxComplianceStatus = 'COMPLIANT' | 'AUDIT_FLAGGED' | 'PENALIZED';

export interface LoanFacility {
  id: string;
  propertyId: string;
  loanType: LoanType;
  principalUGX: number;
  remainingBalanceUGX: number;
  interestRateAnnual: number; // e.g. 0.17 to 0.22 (17% - 22%)
  monthlyPaymentUGX: number;
  tenorMonths: number;
  monthsPaid: number;
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
  originationFeeUGX: number;
}

export interface UraTaxRecord {
  id: string;
  periodStr: string;
  grossRentalIncomeUGX: number;
  deductibleExpensesUGX: number;
  taxableIncomeUGX: number;
  taxDueUGX: number;
  isPaid: boolean;
  dueDateStr: string;
  penaltyUGX: number;
}

export interface ConstructionTemplate {
  id: string;
  name: string;
  description: string;
  finishTier: 'Standard (Muzigo)' | 'Mid-Range Apartments' | 'Executive Townhouse' | 'Luxury Commercial Plaza';
  costPerM2UGX: number; // UGX 1.8M - 4.5M per m²
  totalAreaM2: number;
  totalCostUGX: number;
  durationMonths: number;
  targetUnits: number;
  projectedMonthlyRentUGX: number;
  stageCostsUGX: {
    planApproval: number;
    foundation: number;
    wallingRoofing: number;
    finishing: number;
    occupationPermit: number;
  };
}

export interface ConstructionProject {
  id: string;
  propertyId: string;
  templateId: string;
  currentStage: ConstructionStage;
  stageIndex: number; // 0 to 5
  totalCostUGX: number;
  fundedCostUGX: number;
  builtMonths: number;
  totalMonths: number;
  permitSecured: boolean;
  builtWithoutPermit: boolean;
  kccaFinePaid: boolean;
  targetUnits: number;
  projectedMonthlyRentUGX: number;
}

export interface GameLocation {
  id: GameLocationId;
  name: string;
  region: string;
  zoneTier: ZoneTier;
  description: string;
  populationDensity: 'Very High' | 'High' | 'Medium' | 'Growing';
  avgLandPricePerDecimalUGX: number;
  rentalDemandIndex: number; // 1.0 to 3.0
  appreciationRateAnnual: number; // percentage e.g. 0.08 (8%)
  riskFactor: 'Low' | 'Moderate' | 'High';
  defaultTenure: TenureType;
  maxLtvRatio: number; // 0.75 Freehold, 0.65 Leasehold, 0.45 Mailo
  kibanjaClearanceCostPerDecimalUGX?: number; // for Mailo land
  leaseYearsRemaining?: number; // for Leasehold
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
  tenureType: TenureType;
  zoneTier: ZoneTier;
  sizeDecimals: number;
  purchasePriceUGX: number;
  currentValuationUGX: number;
  purchaseDateStr: string;
  status: 'Raw Land' | 'Under Development' | 'Completed' | 'Rented';
  monthlyRentalIncomeUGX: number;
  occupancyRate: number; // 0 to 1
  titleVerified: boolean;
  kibanjaCleared: boolean;
  kibanjaClearanceCostUGX: number;
  leaseYearsRemaining?: number;
  maxLtvRatio: number;
}

export interface GameState {
  version: string;
  player: PlayerProfile;
  date: GameDate;
  currentLocationId: GameLocationId;
  cashUGX: number;
  transactions: FinancialTransaction[];
  properties: OwnedProperty[];
  constructionProjects: ConstructionProject[];
  loans: LoanFacility[];
  uraTaxRecords: UraTaxRecord[];
  taxComplianceStatus: TaxComplianceStatus;
  consecutiveNegativeCashMonths: number;
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
