import { FinancialKPI, IncomeStatementItem, CostCategory, MarginData } from '@/types/financial'

/**
 * Format currency values in Brazilian Real
 */
export const formatCurrency = (
  value: number,
  format: 'millions' | 'thousands' | 'decimal' = 'decimal',
  showSymbol = true
): string => {
  const symbol = showSymbol ? 'R$ ' : ''
  
  switch (format) {
    case 'millions':
      return `${symbol}${(value / 1_000_000).toFixed(1)}M`
    case 'thousands':
      return `${symbol}${(value / 1_000).toFixed(0)}K`
    default:
      return `${symbol}${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`
  }
}

/**
 * Format percentage values
 */
export const formatPercentage = (
  value: number,
  decimals = 1,
  showSymbol = true
): string => {
  const symbol = showSymbol ? '%' : ''
  return `${value.toFixed(decimals)}${symbol}`
}

/**
 * Format ratio values
 */
export const formatRatio = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}x`
}

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Calculate trend direction based on percentage change
 */
export const getTrendDirection = (
  percentageChange: number,
  threshold = 0.5
): 'up' | 'down' | 'stable' => {
  if (Math.abs(percentageChange) < threshold) return 'stable'
  return percentageChange > 0 ? 'up' : 'down'
}

/**
 * Calculate status based on value and target
 */
export const getKPIStatus = (
  value: number,
  target?: number,
  benchmark?: number,
  isHigherBetter = true
): 'excellent' | 'good' | 'warning' | 'critical' => {
  if (!target && !benchmark) return 'good'
  
  const referenceValue = target || benchmark || 0
  const variance = ((value - referenceValue) / referenceValue) * 100
  
  if (isHigherBetter) {
    if (variance >= 10) return 'excellent'
    if (variance >= 0) return 'good'
    if (variance >= -10) return 'warning'
    return 'critical'
  } else {
    if (variance <= -10) return 'excellent'
    if (variance <= 0) return 'good'
    if (variance <= 10) return 'warning'
    return 'critical'
  }
}

/**
 * Calculate EBITDA from revenue and costs
 */
export const calculateEBITDA = (
  revenue: number,
  operatingCosts: number,
  administrativeCosts: number
): number => {
  return revenue - operatingCosts - administrativeCosts
}

/**
 * Calculate profit margin
 */
export const calculateMargin = (profit: number, revenue: number): number => {
  if (revenue === 0) return 0
  return (profit / revenue) * 100
}

/**
 * Calculate ROE (Return on Equity)
 */
export const calculateROE = (netIncome: number, equity: number): number => {
  if (equity === 0) return 0
  return (netIncome / equity) * 100
}

/**
 * Calculate ROIC (Return on Invested Capital)
 */
export const calculateROIC = (
  nopat: number, // Net Operating Profit After Tax
  investedCapital: number
): number => {
  if (investedCapital === 0) return 0
  return (nopat / investedCapital) * 100
}

/**
 * Calculate EVA (Economic Value Added)
 */
export const calculateEVA = (
  nopat: number,
  wacc: number,
  investedCapital: number
): number => {
  return nopat - (wacc / 100 * investedCapital)
}

/**
 * Calculate debt-to-equity ratio
 */
export const calculateDebtToEquity = (totalDebt: number, equity: number): number => {
  if (equity === 0) return 0
  return totalDebt / equity
}

/**
 * Calculate current liquidity ratio
 */
export const calculateCurrentRatio = (
  currentAssets: number,
  currentLiabilities: number
): number => {
  if (currentLiabilities === 0) return 0
  return currentAssets / currentLiabilities
}

/**
 * Calculate cost per hectare
 */
export const calculateCostPerHectare = (
  totalCost: number,
  hectares: number
): number => {
  if (hectares === 0) return 0
  return totalCost / hectares
}

/**
 * Calculate revenue per hectare
 */
export const calculateRevenuePerHectare = (
  totalRevenue: number,
  hectares: number
): number => {
  if (hectares === 0) return 0
  return totalRevenue / hectares
}

/**
 * Calculate break-even point in bags per hectare
 */
export const calculateBreakEvenBags = (
  costPerHectare: number,
  pricePerBag: number
): number => {
  if (pricePerBag === 0) return 0
  return costPerHectare / pricePerBag
}

/**
 * Calculate safety margin for break-even
 */
export const calculateSafetyMargin = (
  actualYield: number,
  breakEvenYield: number
): number => {
  if (breakEvenYield === 0) return 100
  return ((actualYield - breakEvenYield) / actualYield) * 100
}

/**
 * Generate waterfall chart data from income statement
 */
export const generateWaterfallData = (
  incomeStatement: IncomeStatementItem[]
): Array<{
  category: string
  value: number
  cumulative: number
  type: 'positive' | 'negative' | 'total'
  color: string
}> => {
  let cumulative = 0
  
  return incomeStatement.map(item => {
    if (item.type === 'total') {
      cumulative = item.value
      return {
        category: item.label,
        value: item.value,
        cumulative,
        type: 'total' as const,
        color: '#3b82f6' // blue
      }
    }
    
    cumulative += item.value
    
    return {
      category: item.label,
      value: Math.abs(item.value),
      cumulative,
      type: item.value >= 0 ? 'positive' : 'negative',
      color: item.value >= 0 ? '#10b981' : '#ef4444' // green or red
    }
  })
}

/**
 * Calculate efficiency rating for cost categories
 */
export const calculateEfficiency = (
  actual: number,
  budget: number
): 'above_budget' | 'on_budget' | 'below_budget' => {
  const variance = ((actual - budget) / budget) * 100
  
  if (variance > 5) return 'above_budget'
  if (variance < -5) return 'below_budget'
  return 'on_budget'
}

/**
 * Generate color based on efficiency
 */
export const getEfficiencyColor = (
  efficiency: 'above_budget' | 'on_budget' | 'below_budget'
): string => {
  switch (efficiency) {
    case 'below_budget':
      return '#10b981' // green
    case 'on_budget':
      return '#f59e0b' // yellow
    case 'above_budget':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

/**
 * Calculate working capital
 */
export const calculateWorkingCapital = (
  currentAssets: number,
  currentLiabilities: number
): number => {
  return currentAssets - currentLiabilities
}

/**
 * Calculate cash conversion cycle
 */
export const calculateCashCycle = (
  inventoryDays: number,
  receivablesDays: number,
  payablesDays: number
): number => {
  return inventoryDays + receivablesDays - payablesDays
}

/**
 * Format large numbers with appropriate suffixes
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Generate trend label for KPIs
 */
export const generateTrendLabel = (
  percentageChange: number,
  comparisonType: 'previous_harvest' | 'budget' | 'three_year_average' = 'previous_harvest'
): string => {
  const direction = percentageChange >= 0 ? 'increase' : 'decrease'
  const magnitude = Math.abs(percentageChange)
  
  const comparisonLabels = {
    previous_harvest: 'vs safra anterior',
    budget: 'vs orçamento',
    three_year_average: 'vs média 3 anos'
  }
  
  return `${formatPercentage(magnitude)} ${direction} ${comparisonLabels[comparisonType]}`
}