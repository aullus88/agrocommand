import { 
  DebtPortfolio, 
  DebtContract, 
  MaturityProfile,
  DebtFilters,
  DebtKPI 
} from '@/types/debt-management'
import { addDays, addMonths, addQuarters, addYears, startOfQuarter } from 'date-fns'

const currentDate = new Date()
const exchangeRate = 5.42

// Generate realistic maturity profile for 10 years
const generateMaturityProfile = (): MaturityProfile[] => {
  const profile: MaturityProfile[] = []
  const baseDate = startOfQuarter(currentDate)
  
  // Realistic payment distribution for agricultural debt
  const paymentSchedule = [
    { quarter: 1, principal: 15000000, interest: 6875000 },
    { quarter: 2, principal: 12000000, interest: 6750000 },
    { quarter: 3, principal: 18000000, interest: 6500000 },
    { quarter: 4, principal: 22000000, interest: 6250000 },
    { quarter: 5, principal: 25000000, interest: 5875000 },
    { quarter: 6, principal: 20000000, interest: 5500000 },
    { quarter: 7, principal: 28000000, interest: 5125000 },
    { quarter: 8, principal: 32000000, interest: 4625000 },
    { quarter: 9, principal: 18000000, interest: 4250000 },
    { quarter: 10, principal: 15000000, interest: 3875000 },
    { quarter: 11, principal: 12000000, interest: 3500000 },
    { quarter: 12, principal: 10000000, interest: 3250000 },
    { quarter: 13, principal: 8000000, interest: 3000000 },
    { quarter: 14, principal: 7000000, interest: 2750000 },
    { quarter: 15, principal: 6000000, interest: 2500000 },
    { quarter: 16, principal: 5000000, interest: 2250000 },
    { quarter: 17, principal: 4000000, interest: 2000000 },
    { quarter: 18, principal: 3500000, interest: 1750000 },
    { quarter: 19, principal: 3000000, interest: 1500000 },
    { quarter: 20, principal: 2500000, interest: 1250000 },
  ]
  
  let accumulated = 0
  paymentSchedule.forEach((payment, index) => {
    const date = addQuarters(baseDate, index)
    const year = date.getFullYear()
    const quarter = Math.floor(date.getMonth() / 3) + 1
    
    // Split principal between BRL and USD based on currency composition
    const principalBRL = payment.principal * 0.58
    const principalUSD = payment.principal * 0.42
    const total = payment.principal + payment.interest
    accumulated += total
    
    // Payment capacity based on seasonal cash flow
    const isHarvestQuarter = quarter === 2 || quarter === 3
    const paymentCapacity = isHarvestQuarter ? total * 1.8 : total * 1.2
    
    profile.push({
      period: `Q${quarter} ${year}`,
      year,
      quarter,
      principalBRL,
      principalUSD,
      interest: payment.interest,
      total,
      accumulated,
      paymentCapacity,
      dscr: paymentCapacity / total
    })
  })
  
  return profile
}

// Generate realistic debt contracts
const generateContracts = (): DebtContract[] => {
  return [
    {
      id: 'BB-2023-001',
      contractNumber: 'BB-AGR-2023-001',
      institution: 'Banco do Brasil',
      originalAmount: 85000000,
      currentBalance: 72300000,
      currency: 'BRL',
      rateType: 'CDI',
      currentRate: 15.75, // CDI 13.25% + 2.5%
      spread: 2.5,
      disbursementDate: new Date('2023-03-15'),
      maturityDate: new Date('2026-03-15'),
      nextPaymentDate: addDays(currentDate, 30),
      nextPaymentAmount: 8500000,
      purpose: 'Working Capital',
      collateral: 'Crop Lien + Land',
      covenants: [
        { type: 'DSCR', required: 1.25, current: 1.52, status: 'compliant', measurementDate: currentDate },
        { type: 'DebtToEbitda', required: 3.0, current: 2.02, status: 'compliant', measurementDate: currentDate }
      ],
      status: 'active',
      dscr: 1.52,
      paymentSchedule: []
    },
    {
      id: 'RABO-2022-001',
      contractNumber: 'RABO-BR-2022-15847',
      institution: 'Rabobank',
      originalAmount: 15000000,
      currentBalance: 12800000,
      currency: 'USD',
      rateType: 'Libor',
      currentRate: 9.13, // Libor 5.33% + 3.8%
      spread: 3.8,
      disbursementDate: new Date('2022-08-22'),
      maturityDate: new Date('2025-08-22'),
      nextPaymentDate: addDays(currentDate, 45),
      nextPaymentAmount: 1200000,
      purpose: 'Equipment Financing',
      collateral: 'Equipment',
      covenants: [
        { type: 'DSCR', required: 1.25, current: 1.38, status: 'compliant', measurementDate: currentDate },
        { type: 'CollateralCoverage', required: 1.2, current: 1.35, status: 'compliant', measurementDate: currentDate }
      ],
      status: 'active',
      dscr: 1.38,
      paymentSchedule: []
    },
    {
      id: 'JD-2021-001',
      contractNumber: 'JDF-BR-2021-78954',
      institution: 'John Deere Financial',
      originalAmount: 45500000,
      currentBalance: 38900000,
      currency: 'BRL',
      rateType: 'PreFixed',
      currentRate: 11.8,
      disbursementDate: new Date('2021-12-10'),
      maturityDate: new Date('2027-12-10'),
      nextPaymentDate: addDays(currentDate, 15),
      nextPaymentAmount: 3800000,
      purpose: 'Machinery',
      collateral: 'Machinery',
      covenants: [
        { type: 'DSCR', required: 1.25, current: 1.67, status: 'compliant', measurementDate: currentDate }
      ],
      status: 'active',
      dscr: 1.67,
      paymentSchedule: []
    },
    {
      id: 'SANT-2023-001',
      contractNumber: 'SANT-AGR-2023-4521',
      institution: 'Santander',
      originalAmount: 42000000,
      currentBalance: 40200000,
      currency: 'BRL',
      rateType: 'TJLP',
      currentRate: 12.17, // TJLP 7.97% + 4.2%
      spread: 4.2,
      disbursementDate: new Date('2023-06-15'),
      maturityDate: new Date('2025-06-15'),
      nextPaymentDate: addDays(currentDate, 60),
      nextPaymentAmount: 4200000,
      purpose: 'Infrastructure',
      collateral: 'Infrastructure + Land',
      covenants: [
        { type: 'DSCR', required: 1.3, current: 1.45, status: 'compliant', measurementDate: currentDate },
        { type: 'LiquidityRatio', required: 1.1, current: 1.28, status: 'compliant', measurementDate: currentDate }
      ],
      status: 'active',
      dscr: 1.45,
      paymentSchedule: []
    },
    {
      id: 'BNDES-2022-001',
      contractNumber: 'BNDES-AGRO-2022-78123',
      institution: 'BNDES',
      originalAmount: 28750000,
      currentBalance: 25800000,
      currency: 'BRL',
      rateType: 'IPCA',
      currentRate: 8.3, // IPCA 3.8% + 4.5%
      spread: 4.5,
      disbursementDate: new Date('2022-04-20'),
      maturityDate: new Date('2028-04-20'),
      nextPaymentDate: addDays(currentDate, 90),
      nextPaymentAmount: 2100000,
      purpose: 'Land Acquisition',
      collateral: 'Land',
      covenants: [
        { type: 'DSCR', required: 1.2, current: 1.55, status: 'compliant', measurementDate: currentDate }
      ],
      status: 'active',
      dscr: 1.55,
      paymentSchedule: []
    },
    {
      id: 'CITI-2023-001',
      contractNumber: 'CITI-BR-AGR-2023-9874',
      institution: 'Citibank',
      originalAmount: 9400000,
      currentBalance: 8900000,
      currency: 'USD',
      rateType: 'SOFR',
      currentRate: 9.2, // SOFR 5.4% + 3.8%
      spread: 3.8,
      disbursementDate: new Date('2023-09-10'),
      maturityDate: new Date('2026-09-10'),
      nextPaymentDate: addDays(currentDate, 75),
      nextPaymentAmount: 850000,
      purpose: 'Working Capital',
      collateral: 'Receivables',
      covenants: [
        { type: 'DSCR', required: 1.25, current: 1.42, status: 'compliant', measurementDate: currentDate },
        { type: 'DebtToEbitda', required: 3.5, current: 2.02, status: 'compliant', measurementDate: currentDate }
      ],
      status: 'active',
      dscr: 1.42,
      paymentSchedule: []
    },
    {
      id: 'BTG-2024-001',
      contractNumber: 'BTG-AGRO-2024-1254',
      institution: 'BTG Pactual',
      originalAmount: 32000000,
      currentBalance: 31500000,
      currency: 'BRL',
      rateType: 'CDI',
      currentRate: 16.25, // CDI 13.25% + 3.0%
      spread: 3.0,
      disbursementDate: new Date('2024-01-15'),
      maturityDate: new Date('2025-07-15'),
      nextPaymentDate: addDays(currentDate, 20),
      nextPaymentAmount: 2800000,
      purpose: 'Refinancing',
      collateral: 'Crop Lien',
      covenants: [
        { type: 'DSCR', required: 1.3, current: 1.48, status: 'compliant', measurementDate: currentDate },
        { type: 'CollateralCoverage', required: 1.5, current: 1.62, status: 'compliant', measurementDate: currentDate }
      ],
      status: 'active',
      dscr: 1.48,
      paymentSchedule: []
    },
    {
      id: 'ITAU-2023-002',
      contractNumber: 'ITAU-AGR-2023-6547',
      institution: 'Itaú BBA',
      originalAmount: 18500000,
      currentBalance: 16200000,
      currency: 'BRL',
      rateType: 'PreFixed',
      currentRate: 12.5,
      disbursementDate: new Date('2023-11-20'),
      maturityDate: new Date('2025-11-20'),
      nextPaymentDate: addDays(currentDate, 40),
      nextPaymentAmount: 1850000,
      purpose: 'Equipment',
      collateral: 'Equipment + Crop',
      covenants: [
        { type: 'DSCR', required: 1.25, current: 1.35, status: 'compliant', measurementDate: currentDate },
        { type: 'LiquidityRatio', required: 1.0, current: 1.28, status: 'compliant', measurementDate: currentDate }
      ],
      status: 'active',
      dscr: 1.35,
      paymentSchedule: []
    }
  ]
}

// Generate debt KPIs
export const generateDebtKPIs = (): DebtKPI[] => {
  return [
    {
      id: 'total-debt',
      label: 'Dívida Total',
      value: 287500000,
      unit: 'R$',
      change: 2.3,
      changeType: 'negative',
      trend: [275000000, 280000000, 282000000, 285000000, 287500000],
      status: 'warning'
    },
    {
      id: 'usd-exposure',
      label: 'Exposição USD',
      value: 42,
      unit: '%',
      change: -1.5,
      changeType: 'positive',
      trend: [45, 44, 43, 42.5, 42],
      target: 40,
      status: 'warning'
    },
    {
      id: 'avg-rate',
      label: 'Taxa Média',
      value: 9.7,
      unit: '% a.a.',
      change: 0.3,
      changeType: 'negative',
      trend: [9.2, 9.3, 9.5, 9.6, 9.7],
      status: 'warning'
    },
    {
      id: 'dscr',
      label: 'DSCR',
      value: 1.48,
      unit: 'x',
      change: -0.05,
      changeType: 'negative',
      trend: [1.55, 1.52, 1.50, 1.49, 1.48],
      target: 1.25,
      status: 'good'
    },
    {
      id: 'debt-ebitda',
      label: 'Dívida/EBITDA',
      value: 2.02,
      unit: 'x',
      change: 0.08,
      changeType: 'negative',
      trend: [1.85, 1.90, 1.95, 1.98, 2.02],
      target: 2.5,
      status: 'good'
    },
    {
      id: 'next-payment',
      label: 'Próximo Pgto',
      value: 12500000,
      unit: 'R$',
      change: 15,
      changeType: 'neutral',
      status: 'warning'
    }
  ]
}

// Main mock data export
export const mockDebtPortfolio: DebtPortfolio = {
  overview: {
    totalDebt: 287500000,
    totalDebtUSD: 24200000,
    usdExposure: 120700000,
    usdExposurePercent: 42,
    avgWeightedRate: 9.7,
    avgMaturity: 21,
    dscr: 1.48,
    debtToEbitda: 2.02,
    nextPayment: {
      amount: 12500000,
      dueDate: addDays(currentDate, 15),
      daysUntil: 15,
      type: 'both',
      currency: 'BRL'
    },
    lastUpdated: currentDate
  },
  composition: {
    byCurrency: [
      {
        currency: 'BRL',
        amount: 166800000,
        percentage: 58,
        avgRate: 10.2,
        avgMaturity: 18
      },
      {
        currency: 'USD',
        amount: 120700000,
        percentage: 42,
        avgRate: 8.8,
        avgMaturity: 24,
        exchangeRate: exchangeRate
      }
    ],
    byRateType: [
      {
        type: 'CDI',
        amount: 100625000,
        percentage: 35,
        currentRate: 13.25,
        spread: 2.5,
        avgRate: 15.75
      },
      {
        type: 'PreFixed',
        amount: 80500000,
        percentage: 28,
        currentRate: 11.8,
        avgRate: 11.8
      },
      {
        type: 'TJLP',
        amount: 43125000,
        percentage: 15,
        currentRate: 7.97,
        spread: 4.2,
        avgRate: 12.17
      },
      {
        type: 'Libor',
        amount: 34500000,
        percentage: 12,
        currentRate: 5.33,
        spread: 3.8,
        avgRate: 9.13
      },
      {
        type: 'IPCA',
        amount: 28750000,
        percentage: 10,
        currentRate: 3.8,
        spread: 4.5,
        avgRate: 8.3
      }
    ],
    byInstitution: [
      {
        institution: 'Banco do Brasil',
        amount: 72300000,
        percentage: 25.2,
        avgRate: 15.75,
        contracts: 1,
        riskRating: 'A'
      },
      {
        institution: 'John Deere Financial',
        amount: 38900000,
        percentage: 13.5,
        avgRate: 11.8,
        contracts: 1,
        riskRating: 'A'
      },
      {
        institution: 'Santander',
        amount: 40200000,
        percentage: 14.0,
        avgRate: 12.17,
        contracts: 1,
        riskRating: 'A'
      },
      {
        institution: 'BTG Pactual',
        amount: 31500000,
        percentage: 11.0,
        avgRate: 16.25,
        contracts: 1,
        riskRating: 'B'
      },
      {
        institution: 'BNDES',
        amount: 25800000,
        percentage: 9.0,
        avgRate: 8.3,
        contracts: 1,
        riskRating: 'A'
      },
      {
        institution: 'Rabobank',
        amount: 69360000, // 12.8M USD at 5.42
        percentage: 24.1,
        avgRate: 9.13,
        contracts: 1,
        riskRating: 'A'
      },
      {
        institution: 'Others',
        amount: 9440000,
        percentage: 3.2,
        avgRate: 10.5,
        contracts: 3,
        riskRating: 'B'
      }
    ],
    byPurpose: [
      {
        purpose: 'Working Capital',
        amount: 131900000,
        percentage: 45.9,
        avgRate: 12.5
      },
      {
        purpose: 'Equipment',
        amount: 103600000,
        percentage: 36.0,
        avgRate: 10.8
      },
      {
        purpose: 'Infrastructure',
        amount: 42000000,
        percentage: 14.6,
        avgRate: 12.17
      },
      {
        purpose: 'Land Acquisition',
        amount: 28750000,
        percentage: 10.0,
        avgRate: 8.3
      },
      {
        purpose: 'Refinancing',
        amount: 32000000,
        percentage: 11.1,
        avgRate: 16.25
      }
    ],
    byCollateral: [
      {
        type: 'Land',
        amount: 140450000,
        percentage: 48.9,
        utilization: 82
      },
      {
        type: 'Equipment',
        amount: 89600000,
        percentage: 31.2,
        utilization: 75
      },
      {
        type: 'Crop',
        amount: 47700000,
        percentage: 16.6,
        utilization: 90
      },
      {
        type: 'Receivables',
        amount: 9750000,
        percentage: 3.3,
        utilization: 65
      }
    ]
  },
  maturityProfile: generateMaturityProfile(),
  contracts: generateContracts(),
  covenants: {
    dscr: {
      current: 1.48,
      required: 1.25,
      status: 'compliant',
      trend: 'stable',
    },
    debtToEbitda: {
      current: 2.02,
      required: 3.0,
      status: 'compliant',
      trend: 'stable',
    },
    currentRatio: {
      current: 1.28,
      required: 1.0,
      status: 'compliant',
      trend: 'stable',
    },
    lastUpdated: currentDate.toISOString(),
    hasData: true
  },
  currencyRisk: {
    usdExposure: 120700000,
    hedgedAmount: 48280000, // 40% hedged
    hedgeRatio: 0.40,
    openExposure: 72420000,
    var95: 5936840, // 8.2% volatility
    var99: 8428726, // 11.6% volatility
    var30Days: 4200000,
    totalExposure: 120700000,
    hasRealRates: true,
    sensitivityAnalysis: [
      { exchangeRate: 4.50, impact: -17028000, probability: 0.05 },
      { exchangeRate: 5.00, impact: -8514000, probability: 0.15 },
      { exchangeRate: 5.42, impact: 0, probability: 0.60 },
      { exchangeRate: 6.00, impact: 10524000, probability: 0.15 },
      { exchangeRate: 6.50, impact: 19038000, probability: 0.05 }
    ],
    hedgeOperations: [
      {
        id: 'NDF-2024-001',
        type: 'NDF',
        notional: 15000000,
        rate: 5.35,
        maturity: addMonths(currentDate, 6),
        mtm: 1050000,
        effectiveness: 0.92
      },
      {
        id: 'SWAP-2024-001',
        type: 'Swap',
        notional: 20000000,
        rate: 5.48,
        maturity: addMonths(currentDate, 12),
        mtm: -1200000,
        effectiveness: 0.88
      },
      {
        id: 'OPT-2024-001',
        type: 'Option',
        notional: 13280000,
        rate: 5.60,
        maturity: addMonths(currentDate, 3),
        mtm: 350000,
        effectiveness: 0.75
      }
    ]
  },
  scenarios: {
    baseCase: {
      name: 'Cenário Base',
      assumptions: {
        selicRate: 13.25,
        exchangeRate: 5.42,
        commodityPrice: 140,
        production: 3600,
        costs: 110
      },
      totalDebt: 287500000,
      totalCost: 27900000,
      avgRate: 9.7,
      dscr: 1.48,
      survivalMonths: 18,
      refinancingNeed: 67500000,
      probability: 0.60
    },
    optimistic: {
      name: 'Cenário Otimista',
      assumptions: {
        selicRate: 11.50,
        exchangeRate: 5.00,
        commodityPrice: 160,
        production: 3800,
        costs: 105
      },
      totalDebt: 279200000,
      totalCost: 23732000,
      avgRate: 8.5,
      dscr: 1.85,
      survivalMonths: 28,
      refinancingNeed: 45000000,
      probability: 0.25
    },
    pessimistic: {
      name: 'Cenário Pessimista',
      assumptions: {
        selicRate: 15.50,
        exchangeRate: 6.20,
        commodityPrice: 120,
        production: 3200,
        costs: 125
      },
      totalDebt: 308500000,
      totalCost: 34552000,
      avgRate: 11.2,
      dscr: 1.15,
      survivalMonths: 10,
      refinancingNeed: 95000000,
      probability: 0.15
    },
    stress: [
      {
        name: 'Stress Selic',
        assumptions: {
          selicRate: 18.00,
          exchangeRate: 5.42,
          commodityPrice: 140,
          production: 3600,
          costs: 115
        },
        totalDebt: 295000000,
        totalCost: 36875000,
        avgRate: 12.5,
        dscr: 1.20,
        survivalMonths: 12,
        refinancingNeed: 82000000,
        probability: 0.05
      },
      {
        name: 'Stress Cambial',
        assumptions: {
          selicRate: 13.25,
          exchangeRate: 7.00,
          commodityPrice: 140,
          production: 3600,
          costs: 120
        },
        totalDebt: 325000000,
        totalCost: 31525000,
        avgRate: 9.7,
        dscr: 1.10,
        survivalMonths: 8,
        refinancingNeed: 105000000,
        probability: 0.03
      }
    ],
    custom: []
  }
}

// Default filters
export const mockDefaultDebtFilters: DebtFilters = {
  dateRange: {
    start: new Date(currentDate.getFullYear(), 0, 1),
    end: new Date(currentDate.getFullYear(), 11, 31)
  },
  currencies: ['BRL', 'USD'],
  institutions: [],
  rateTypes: [],
  purposes: [],
  status: ['active'],
  covenantStatus: ['compliant', 'warning']
}