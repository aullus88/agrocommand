export interface CashFlowOverview {
  currentBalance: number
  dailyVariation: number
  projectedBalance30d: number
  cashDays: number
  workingCapitalNeed: number
  receivablesTotal: number
  payablesTotal: number
  lastUpdated: Date
}

export interface CashFlowProjection {
  date: string
  inflows: number
  outflows: number
  netFlow: number
  runningBalance: number
  isProjected: boolean
}

export interface CashTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'inflow' | 'outflow'
  category: string
  source: string
  status: 'pending' | 'confirmed' | 'paid'
  reference?: string
}

export interface PaymentCalendarDay {
  date: string
  netFlow: number
  inflows: number
  outflows: number
  transactions: CashTransaction[]
  hasDebtPayments: boolean
  debtPaymentAmount: number
}

export interface AgingBucket {
  name: string
  days: string
  amount: number
  count: number
  percentage: number
}

export interface ReceivablesData {
  total: number
  overdue: number
  averageDays: number
  aging: AgingBucket[]
  hasRealData: boolean
}

export interface PayablesData {
  total: number
  dueIn7Days: number
  averageDays: number
  aging: AgingBucket[]
  hasRealData: boolean
  debtPaymentsTotal: number
  debtPaymentsPercentage: number
}

export interface WorkingCapitalData {
  monthlyRequirements: Array<{
    month: string
    requirement: number
    available: number
    gap: number
    action: string
  }>
  currentRatio: number
  quickRatio: number
  hasRealData: boolean
}

export interface ConversionCycleData {
  totalDays: number
  daysInventory: number
  daysSalesOutstanding: number
  daysPayableOutstanding: number
  yearOverYearChange: number
  benchmarkDays: number
  hasRealData: boolean
}

export interface OptimizationOpportunity {
  type: 'receivables_factoring' | 'payment_terms' | 'excess_investment' | 'debt_restructure'
  title: string
  description: string
  potentialBenefit: number
  implementationCost: number
  timeframe: string
  roi: number
  hasRealData: boolean
}

export interface ContingencyData {
  liquiditySources: Array<{
    source: string
    amount: number
    timeToAccess: string
    cost: number
  }>
  stressScenarios: Array<{
    name: string
    description: string
    survivalMonths: number
    mitigationActions: string[]
  }>
  hasRealData: boolean
}

export interface CashFlowPortfolio {
  overview: CashFlowOverview
  projections: CashFlowProjection[]
  transactions: CashTransaction[]
  calendar: PaymentCalendarDay[]
  receivables: ReceivablesData
  payables: PayablesData
  workingCapital: WorkingCapitalData
  conversionCycle: ConversionCycleData
  optimization: OptimizationOpportunity[]
  contingency: ContingencyData
}

export interface CashFlowFilters {
  startDate?: string
  endDate?: string
  categories?: string[]
  sources?: string[]
  includeProjected?: boolean
}

export interface DebtPaymentForCashFlow {
  id: string
  amount: number
  dueDate: string
  institution: string
  contract: string
  currency: string
  status: 'pending' | 'paid' | 'overdue'
  principal: number
  interest: number
}