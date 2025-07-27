export interface FinancialKPI {
  id: string
  title: string
  value: number
  previousValue?: number
  target?: number
  unit: 'currency' | 'percentage' | 'ratio' | 'days'
  format: 'millions' | 'thousands' | 'decimal' | 'integer'
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  trendLabel: string
  status: 'excellent' | 'good' | 'warning' | 'critical'
  sparklineData?: number[]
  breakdown?: FinancialBreakdown[]
  description?: string
}

export interface FinancialBreakdown {
  label: string
  value: number
  percentage: number
  color?: string
}

export interface IncomeStatementItem {
  id: string
  label: string
  value: number
  type: 'revenue' | 'cost' | 'expense' | 'total'
  category: 'positive' | 'negative' | 'neutral'
  budgetValue?: number
  previousValue?: number
  breakdown?: FinancialBreakdown[]
}

export interface CostCategory {
  id: string
  name: string
  totalValue: number
  budgetValue?: number
  previousValue?: number
  percentage: number
  subcategories: CostSubcategory[]
  efficiency: 'above_budget' | 'on_budget' | 'below_budget'
  color: string
}

export interface CostSubcategory {
  id: string
  name: string
  value: number
  budgetValue?: number
  percentage: number
  unit: string
  efficiency: 'above_budget' | 'on_budget' | 'below_budget'
}

export interface MarginData {
  period: string
  date: Date
  grossMargin: number
  operationalMargin: number
  ebitdaMargin: number
  netMargin: number
  sectorBenchmark?: {
    grossMargin: number
    operationalMargin: number
    ebitdaMargin: number
    netMargin: number
  }
}

export interface CostPerHectareData {
  category: string
  current: number
  budget: number
  previousYear: number
  unit: string
  efficiency: number
  trend: 'improving' | 'stable' | 'worsening'
}

export interface FinancialIndicator {
  id: string
  name: string
  value: number
  target?: number
  benchmark?: number
  unit: 'ratio' | 'percentage' | 'currency' | 'days'
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  description: string
  calculation?: string
}

export interface FinancialPeriod {
  id: string
  label: string
  startDate: Date
  endDate: Date
  type: 'monthly' | 'quarterly' | 'harvest' | 'annual'
}

export interface FinancialFilters {
  period: FinancialPeriod
  comparison?: {
    type: 'previous_harvest' | 'budget' | 'three_year_average'
    period: FinancialPeriod
  }
  culture: 'soybean' | 'corn' | 'all'
  plots?: string[]
  costCenters?: string[]
}

export interface FinancialOverviewData {
  kpis: FinancialKPI[]
  incomeStatement: IncomeStatementItem[]
  costBreakdown: CostCategory[]
  marginEvolution: MarginData[]
  costPerHectare: CostPerHectareData[]
  financialIndicators: FinancialIndicator[]
  lastUpdated: Date
  filters: FinancialFilters
}

export interface ExportOptions {
  format: 'pdf' | 'excel'
  sections: string[]
  period: FinancialPeriod
  includeCharts: boolean
  includeComparison: boolean
}

export interface AlertConfig {
  id: string
  name: string
  metric: string
  condition: 'above' | 'below' | 'change'
  threshold: number
  enabled: boolean
  notifications: ('email' | 'sms' | 'dashboard')[]
}

// Utility types for chart data
export interface WaterfallChartData {
  category: string
  value: number
  cumulative: number
  type: 'positive' | 'negative' | 'total'
  budgetValue?: number
  color: string
}

export interface TreemapData {
  id: string
  name: string
  value: number
  percentage: number
  children?: TreemapData[]
  color: string
  efficiency: 'above_budget' | 'on_budget' | 'below_budget'
}

export interface SparklineData {
  period: string
  value: number
  date: Date
}

// API Response types
export interface FinancialApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: Date
}

export interface FinancialApiError {
  code: string
  message: string
  details?: Record<string, any>
}