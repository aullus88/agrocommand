export interface DebtPortfolio {
  overview: DebtOverview
  composition: DebtComposition
  maturityProfile: MaturityProfile[]
  contracts: DebtContract[]
  covenants: CovenantStatus
  currencyRisk: CurrencyRiskData
  scenarios: ScenarioAnalysis
}

export interface DebtOverview {
  totalDebt: number
  totalDebtUSD: number
  usdExposure: number
  usdExposurePercent: number
  avgWeightedRate: number
  avgMaturity: number
  dscr: number
  debtToEbitda: number
  nextPayment: PaymentInfo
  lastUpdated: Date
}

export interface PaymentInfo {
  amount: number
  dueDate: Date
  daysUntil: number
  type: 'principal' | 'interest' | 'both'
  currency: 'BRL' | 'USD'
  contract?: string
}

export interface DebtComposition {
  byCurrency: CurrencyBreakdown[]
  byRateType: RateTypeBreakdown[]
  byInstitution: InstitutionBreakdown[]
  byPurpose: PurposeBreakdown[]
  byCollateral: CollateralBreakdown[]
}

export interface CurrencyBreakdown {
  currency: 'BRL' | 'USD' | 'EUR'
  amount: number
  percentage: number
  avgRate: number
  avgMaturity: number
  exchangeRate?: number
}

export interface RateTypeBreakdown {
  type: 'CDI' | 'PreFixed' | 'TJLP' | 'Libor' | 'IPCA' | 'SOFR'
  amount: number
  percentage: number
  currentRate: number
  spread?: number
  avgRate: number
}

export interface InstitutionBreakdown {
  institution: string
  amount: number
  percentage: number
  avgRate: number
  contracts: number
  riskRating: 'A' | 'B' | 'C'
}

export interface PurposeBreakdown {
  purpose: 'Working Capital' | 'Equipment' | 'Infrastructure' | 'Land Acquisition' | 'Refinancing'
  amount: number
  percentage: number
  avgRate: number
}

export interface CollateralBreakdown {
  type: 'Land' | 'Equipment' | 'Crop' | 'Unsecured' | 'Receivables'
  amount: number
  percentage: number
  utilization: number
}

export interface MaturityProfile {
  period: string
  year: number
  quarter: number
  principalBRL: number
  principalUSD: number
  interest: number
  total: number
  accumulated: number
  paymentCapacity: number
  dscr: number
}

export interface DebtContract {
  id: string
  contractNumber: string
  institution: string
  originalAmount: number
  currentBalance: number
  currency: 'BRL' | 'USD' | 'EUR'
  rateType: 'CDI' | 'PreFixed' | 'TJLP' | 'Libor' | 'IPCA' | 'SOFR'
  currentRate: number
  spread?: number
  disbursementDate: Date
  maturityDate: Date
  nextPaymentDate: Date
  nextPaymentAmount: number
  purpose: string
  collateral: string
  covenants: ContractCovenant[]
  status: 'active' | 'grace' | 'default' | 'paid'
  dscr: number | null
  paymentSchedule?: PaymentScheduleItem[]
  // Additional real data fields
  document?: string | null
  contractDate?: Date | null
  hasRollover?: boolean
  exchangeRate?: number | null
  amountInReais?: number | null
  paymentDate?: Date | null
  currentInstallment?: number
  totalInstallments?: number
}

export interface ContractCovenant {
  type: 'DSCR' | 'DebtToEbitda' | 'LiquidityRatio' | 'CollateralCoverage'
  required: number
  current: number
  status: 'compliant' | 'warning' | 'breach'
  measurementDate: Date
}

export interface PaymentScheduleItem {
  date: Date
  principal: number
  interest: number
  total: number
  balance: number
  paid: boolean
}

export interface CovenantStatus {
  dscr: CovenantMetric
  debtToEbitda: CovenantMetric  
  currentRatio: CovenantMetric
  lastUpdated: string
  hasData: boolean
  dataWarning?: string
}

export interface CovenantMetric {
  current: number | null
  required: number
  minimum?: number
  maximum?: number
  status: 'compliant' | 'warning' | 'breach' | 'good' | 'unknown'
  trend: 'stable' | 'improving' | 'deteriorating' | 'unknown'
  warning?: string
}

export interface CovenantBreach {
  date: Date
  covenant: string
  value: number
  required: number
  resolved: boolean
  resolutionDate?: Date
}

export interface CurrencyRiskData {
  usdExposure: number
  hedgedAmount: number
  hedgeRatio: number
  openExposure: number
  var95: number
  var99: number
  var30Days: number
  totalExposure: number
  hasRealRates: boolean
  rateDataWarning?: string
  sensitivityAnalysis: SensitivityScenario[]
  hedgeOperations: HedgeOperation[]
  usdAmount?: number
}

export interface SensitivityScenario {
  exchangeRate: number
  impact: number
  probability: number
}

export interface HedgeOperation {
  id: string
  type: 'NDF' | 'Swap' | 'Option' | 'Future'
  notional: number
  rate: number
  maturity: Date
  mtm: number
  effectiveness: number
}

export interface ScenarioAnalysis {
  baseCase: ScenarioResult
  optimistic: ScenarioResult
  pessimistic: ScenarioResult
  stress: ScenarioResult[]
  custom: ScenarioResult[]
}

export interface ScenarioResult {
  name: string
  assumptions: ScenarioAssumptions
  totalDebt: number
  totalCost: number
  avgRate: number
  dscr: number
  survivalMonths: number
  refinancingNeed: number
  probability: number
  cashFlowImpact?: number
}

export interface ScenarioAssumptions {
  selicRate: number
  exchangeRate: number
  commodityPrice: number
  production: number
  costs: number
}

export interface DebtFilters {
  dateRange: {
    start: Date
    end: Date
  }
  startDate?: Date
  endDate?: Date
  loanTypes?: string[]
  currencies: ('BRL' | 'USD' | 'EUR')[]
  institutions: string[]
  rateTypes: string[]
  purposes: string[]
  status: ('active' | 'grace' | 'default' | 'paid')[]
  minAmount?: number
  maxAmount?: number
  covenantStatus?: ('compliant' | 'warning' | 'breach')[]
}

export interface DebtKPI {
  id: string
  label: string
  value: number | string
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  unit?: string
  icon?: string
  trend?: number[]
  target?: number
  status?: 'good' | 'warning' | 'critical'
}