import { DebtContract, CovenantStatus, ScenarioAssumptions } from '@/types/debt-management'

// Calculate Debt Service Coverage Ratio
export const calculateDSCR = (ebitda: number, debtService: number): number => {
  if (debtService === 0) return 0
  return Number((ebitda / debtService).toFixed(2))
}

// Calculate total debt service (principal + interest)
export const calculateDebtService = (principal: number, interest: number): number => {
  return principal + interest
}

// Calculate Debt to EBITDA ratio
export const calculateDebtToEbitda = (totalDebt: number, ebitda: number): number => {
  if (ebitda === 0) return 0
  return Number((totalDebt / ebitda).toFixed(2))
}

// Calculate weighted average interest rate
export const calculateWeightedAvgRate = (contracts: DebtContract[]): number => {
  const totalDebt = contracts.reduce((sum, contract) => sum + contract.currentBalance, 0)
  if (totalDebt === 0) return 0
  
  const weightedSum = contracts.reduce((sum, contract) => {
    return sum + (contract.currentBalance * contract.currentRate)
  }, 0)
  
  return Number((weightedSum / totalDebt).toFixed(2))
}

// Calculate average maturity in months
export const calculateAvgMaturity = (contracts: DebtContract[]): number => {
  const totalDebt = contracts.reduce((sum, contract) => sum + contract.currentBalance, 0)
  if (totalDebt === 0) return 0
  
  const weightedMaturity = contracts.reduce((sum, contract) => {
    const monthsToMaturity = Math.max(0, 
      (contract.maturityDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    return sum + (contract.currentBalance * monthsToMaturity)
  }, 0)
  
  return Math.round(weightedMaturity / totalDebt)
}

// Calculate currency exposure
export const calculateCurrencyExposure = (
  contracts: DebtContract[], 
  currency: 'USD' | 'EUR', 
  exchangeRate: number
): { amount: number; percentage: number } => {
  const currencyDebt = contracts
    .filter(c => c.currency === currency)
    .reduce((sum, c) => sum + c.currentBalance, 0)
  
  const totalDebt = contracts.reduce((sum, c) => {
    if (c.currency === 'BRL') return sum + c.currentBalance
    return sum + (c.currentBalance * exchangeRate)
  }, 0)
  
  const amount = currencyDebt * exchangeRate
  const percentage = totalDebt > 0 ? (amount / totalDebt) * 100 : 0
  
  return {
    amount: Math.round(amount),
    percentage: Number(percentage.toFixed(1))
  }
}

// Calculate Value at Risk (VaR) for currency exposure
export const calculateCurrencyVaR = (
  usdExposure: number, 
  volatility: number, 
  confidence: number = 95
): number => {
  // Z-scores for different confidence levels
  const zScores: { [key: number]: number } = {
    90: 1.282,
    95: 1.645,
    99: 2.326
  }
  
  const zScore = zScores[confidence] || 1.645
  return Math.round(usdExposure * volatility * zScore)
}

// Calculate liquidity ratio
export const calculateLiquidityRatio = (
  currentAssets: number, 
  currentLiabilities: number
): number => {
  if (currentLiabilities === 0) return 0
  return Number((currentAssets / currentLiabilities).toFixed(2))
}

// Calculate collateral coverage ratio
export const calculateCollateralCoverage = (
  collateralValue: number, 
  debtAmount: number
): number => {
  if (debtAmount === 0) return 0
  return Number((collateralValue / debtAmount).toFixed(2))
}

// Determine covenant status based on current vs required values
export const determineCovenantStatus = (
  current: number, 
  required: number, 
  type: 'min' | 'max' = 'min'
): 'compliant' | 'warning' | 'breach' => {
  const ratio = current / required
  
  if (type === 'min') {
    if (ratio >= 1.1) return 'compliant'
    if (ratio >= 1.0) return 'warning'
    return 'breach'
  } else {
    if (ratio <= 0.9) return 'compliant'
    if (ratio <= 1.0) return 'warning'
    return 'breach'
  }
}

// Calculate overall covenant status
export const calculateOverallCovenantStatus = (
  covenants: CovenantStatus
): 'compliant' | 'warning' | 'breach' => {
  const statuses = [
    covenants.dscr.status,
    covenants.debtToEbitda.status,
    covenants.currentRatio.status
  ]
  
  if (statuses.includes('breach')) return 'breach'
  if (statuses.includes('warning')) return 'warning'
  return 'compliant'
}

// Calculate debt service under different scenarios
export const calculateScenarioDebtService = (
  contracts: DebtContract[],
  assumptions: ScenarioAssumptions
): number => {
  return contracts.reduce((total, contract) => {
    let adjustedRate = contract.currentRate
    
    // Adjust floating rates based on Selic changes
    if (contract.rateType === 'CDI') {
      const selicDiff = assumptions.selicRate - 13.25 // Current Selic
      adjustedRate = contract.currentRate + selicDiff
    }
    
    // Calculate interest payment
    const interest = contract.currentBalance * (adjustedRate / 100)
    
    // Estimate principal payment (simplified)
    const remainingMonths = Math.max(1,
      (contract.maturityDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    const principal = contract.currentBalance / remainingMonths * 12
    
    return total + principal + interest
  }, 0)
}

// Calculate survival months based on liquidity
export const calculateSurvivalMonths = (
  cashBalance: number,
  monthlyBurn: number,
  creditLines: number = 0
): number => {
  const totalLiquidity = cashBalance + creditLines
  if (monthlyBurn <= 0) return 999
  return Math.floor(totalLiquidity / monthlyBurn)
}

// Format currency values
export const formatCurrency = (
  value: number, 
  currency: 'BRL' | 'USD' = 'BRL',
  decimals: number = 0
): string => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  
  if (currency === 'BRL' && Math.abs(value) >= 1000000) {
    return formatter.format(value / 1000000).replace('R$', 'R$ ') + ' mi'
  }
  
  return formatter.format(value)
}

// Format percentage values
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

// Format DSCR and other ratios
export const formatRatio = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}x`
}

// Calculate days until date
export const calculateDaysUntil = (date: Date): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Group contracts by property
export const groupContractsBy = <K extends keyof DebtContract>(
  contracts: DebtContract[],
  key: K
): Map<DebtContract[K], DebtContract[]> => {
  const grouped = new Map<DebtContract[K], DebtContract[]>()
  
  contracts.forEach(contract => {
    const value = contract[key]
    if (!grouped.has(value)) {
      grouped.set(value, [])
    }
    grouped.get(value)!.push(contract)
  })
  
  return grouped
}

// Calculate refinancing need
export const calculateRefinancingNeed = (
  contracts: DebtContract[],
  months: number = 12
): number => {
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() + months)
  
  return contracts
    .filter(c => c.maturityDate <= cutoffDate)
    .reduce((sum, c) => sum + c.currentBalance, 0)
}