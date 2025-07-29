import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { 
  CashFlowPortfolio, 
  CashFlowFilters, 
  DebtPaymentForCashFlow,
  PaymentCalendarDay,
  AgingBucket,
  PayablesData,
  ReceivablesData,
  WorkingCapitalData,
  ConversionCycleData,
  OptimizationOpportunity,
  ContingencyData,
  CashFlowOverview,
  CashFlowProjection
} from '@/types/cash-flow'
import { DBDebtPayment } from './use-real-debt-data'
import { convertToBRL } from '@/utils/currency-service'

const supabase = createClient()

// Fetch real debt payments for cash flow analysis
const fetchDebtPaymentsForCashFlow = async (): Promise<DebtPaymentForCashFlow[]> => {
  const { data: payments, error } = await supabase
    .from('debt_payments')
    .select('*')
    .order('vencim_parcela', { ascending: true })

  if (error) throw error

  if (!payments || payments.length === 0) {
    return []
  }

  // Convert debt payments to cash flow format
  const cashFlowPayments: DebtPaymentForCashFlow[] = await Promise.all(
    payments.map(async (payment: DBDebtPayment) => {
      const principalConversion = await convertToBRL(payment.vlr_capital_parcela, payment.moeda || 'R$')
      const interestConversion = await convertToBRL(payment.juros_parcela, payment.moeda || 'R$')
      const totalConversion = await convertToBRL(payment.tot_capital_juros, payment.moeda || 'R$')

      return {
        id: payment.id,
        amount: totalConversion.result,
        dueDate: payment.vencim_parcela,
        institution: payment.agente,
        contract: payment.nr_contrato,
        currency: payment.moeda || 'R$',
        status: payment.status as 'pending' | 'paid' | 'overdue',
        principal: principalConversion.result,
        interest: interestConversion.result
      }
    })
  )

  return cashFlowPayments
}

// Create payment calendar with real debt data
const createPaymentCalendar = (debtPayments: DebtPaymentForCashFlow[]): PaymentCalendarDay[] => {
  const calendarMap = new Map<string, PaymentCalendarDay>()
  
  // Initialize calendar for next 365 days
  const startDate = new Date()
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    calendarMap.set(dateStr, {
      date: dateStr,
      netFlow: 0,
      inflows: 0, // Mock data - no real inflow data available
      outflows: 0,
      transactions: [],
      hasDebtPayments: false,
      debtPaymentAmount: 0
    })
  }

  // Add debt payments to calendar
  debtPayments.forEach(payment => {
    const dateStr = payment.dueDate
    const day = calendarMap.get(dateStr)
    
    if (day) {
      day.outflows += payment.amount
      day.debtPaymentAmount += payment.amount
      day.hasDebtPayments = true
      day.netFlow = day.inflows - day.outflows
      
      day.transactions.push({
        id: payment.id,
        date: payment.dueDate,
        description: `Pagamento ${payment.institution} - ${payment.contract}`,
        amount: -payment.amount, // Negative for outflow
        type: 'outflow',
        category: 'Debt Payment',
        source: payment.institution,
        status: payment.status === 'overdue' ? 'pending' : payment.status as 'pending' | 'confirmed' | 'paid',
        reference: payment.contract
      })
    }
  })

  return Array.from(calendarMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// Create payables aging analysis with real debt data
const createPayablesAging = (debtPayments: DebtPaymentForCashFlow[]): PayablesData => {
  const today = new Date().toISOString().split('T')[0]
  
  const aging: AgingBucket[] = [
    { name: 'A vencer 0-30 dias', days: '0-30', amount: 0, count: 0, percentage: 0 },
    { name: 'A vencer 31-60 dias', days: '31-60', amount: 0, count: 0, percentage: 0 },
    { name: 'A vencer 61-90 dias', days: '61-90', amount: 0, count: 0, percentage: 0 },
    { name: 'A vencer >90 dias', days: '>90', amount: 0, count: 0, percentage: 0 },
    { name: 'Vencidos 1-30 dias', days: 'overdue-30', amount: 0, count: 0, percentage: 0 },
    { name: 'Vencidos >30 dias', days: 'overdue-30+', amount: 0, count: 0, percentage: 0 }
  ]

  let totalDebtPayables = 0
  let dueIn7Days = 0

  debtPayments.forEach(payment => {
    const paymentDate = new Date(payment.dueDate)
    const todayDate = new Date(today)
    const diffTime = paymentDate.getTime() - todayDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    totalDebtPayables += payment.amount
    
    if (diffDays <= 7 && diffDays >= 0) {
      dueIn7Days += payment.amount
    }

    // Categorize into aging buckets
    if (diffDays < 0) {
      // Overdue
      if (Math.abs(diffDays) <= 30) {
        aging[4].amount += payment.amount
        aging[4].count++
      } else {
        aging[5].amount += payment.amount
        aging[5].count++
      }
    } else {
      // Future payments
      if (diffDays <= 30) {
        aging[0].amount += payment.amount
        aging[0].count++
      } else if (diffDays <= 60) {
        aging[1].amount += payment.amount
        aging[1].count++
      } else if (diffDays <= 90) {
        aging[2].amount += payment.amount
        aging[2].count++
      } else {
        aging[3].amount += payment.amount
        aging[3].count++
      }
    }
  })

  // Calculate percentages
  aging.forEach(bucket => {
    bucket.percentage = totalDebtPayables > 0 ? (bucket.amount / totalDebtPayables) * 100 : 0
  })

  // Mock additional payables (suppliers, etc.) - 40% of debt payments
  const mockOtherPayables = totalDebtPayables * 0.4
  const totalPayables = totalDebtPayables + mockOtherPayables

  return {
    total: totalPayables,
    dueIn7Days: dueIn7Days + (mockOtherPayables * 0.1), // Assume 10% of other payables due in 7 days
    averageDays: 45, // Mock average
    aging: aging.map(bucket => ({
      ...bucket,
      amount: bucket.amount + (mockOtherPayables / aging.length), // Distribute mock payables
      percentage: ((bucket.amount + (mockOtherPayables / aging.length)) / totalPayables) * 100
    })),
    hasRealData: true,
    debtPaymentsTotal: totalDebtPayables,
    debtPaymentsPercentage: (totalDebtPayables / totalPayables) * 100
  }
}

// Create cash flow overview with real debt data
const createCashFlowOverview = (debtPayments: DebtPaymentForCashFlow[]): CashFlowOverview => {
  const totalDebtPayables = debtPayments.reduce((sum, payment) => sum + payment.amount, 0)
  
  // Mock current balance and receivables (no real data available)
  const mockCurrentBalance = 45700000 // R$ 45.7M
  const mockReceivables = 156000000 // R$ 156M
  const mockWorkingCapitalNeed = 125000000 // R$ 125M

  // Calculate next 30 days debt payments
  const next30Days = new Date()
  next30Days.setDate(next30Days.getDate() + 30)
  const next30DaysStr = next30Days.toISOString().split('T')[0]
  
  const debtPaymentsNext30Days = debtPayments
    .filter(payment => payment.dueDate <= next30DaysStr && payment.status !== 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0)

  // Estimate projected balance (mock calculation)
  const projectedBalance = mockCurrentBalance - debtPaymentsNext30Days

  return {
    currentBalance: mockCurrentBalance,
    dailyVariation: 2300000, // Mock +R$ 2.3M
    projectedBalance30d: projectedBalance,
    cashDays: Math.floor(mockCurrentBalance / (totalDebtPayables / 365)), // Rough calculation
    workingCapitalNeed: mockWorkingCapitalNeed,
    receivablesTotal: mockReceivables,
    payablesTotal: totalDebtPayables + (totalDebtPayables * 0.4), // Add 40% for other payables
    lastUpdated: new Date()
  }
}

// Create monthly cash flow projections with debt data
const createCashFlowProjections = (debtPayments: DebtPaymentForCashFlow[]): CashFlowProjection[] => {
  const projections: CashFlowProjection[] = []
  const startDate = new Date()
  
  // Mock seasonal pattern for agricultural inflows
  const monthlyInflows = [180000000, 120000000, 200000000, 85000000, 45000000, 35000000,
                         28000000, 42000000, 155000000, 285000000, 195000000, 150000000]
  
  let runningBalance = 45700000 // Starting balance
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i)
    const monthStr = date.toISOString().slice(0, 7) // YYYY-MM
    
    // Calculate debt payments for this month
    const monthDebtPayments = debtPayments
      .filter(payment => payment.dueDate.startsWith(monthStr))
      .reduce((sum, payment) => sum + payment.amount, 0)
    
    // Mock other outflows (operational costs, etc.)
    const mockOtherOutflows = monthlyInflows[i] * 0.6 // 60% of inflows as other costs
    
    const totalInflows = monthlyInflows[i]
    const totalOutflows = monthDebtPayments + mockOtherOutflows
    const netFlow = totalInflows - totalOutflows
    
    runningBalance += netFlow
    
    projections.push({
      date: monthStr + '-01',
      inflows: totalInflows,
      outflows: totalOutflows,
      netFlow,
      runningBalance,
      isProjected: i > 0 // First month is current, rest are projected
    })
  }
  
  return projections
}

// Mock data generators for components without real data
const createMockReceivables = (): ReceivablesData => ({
  total: 156000000,
  overdue: 8200000,
  averageDays: 22,
  aging: [
    { name: 'A receber 0-30 dias', days: '0-30', amount: 78000000, count: 45, percentage: 50 },
    { name: 'A receber 31-60 dias', days: '31-60', amount: 45000000, count: 28, percentage: 28.8 },
    { name: 'A receber 61-90 dias', days: '61-90', amount: 25000000, count: 18, percentage: 16.0 },
    { name: 'Vencidos 1-30 dias', days: 'overdue-30', amount: 6000000, count: 8, percentage: 3.8 },
    { name: 'Vencidos >30 dias', days: 'overdue-30+', amount: 2200000, count: 3, percentage: 1.4 }
  ],
  hasRealData: false
})

const createMockWorkingCapital = (): WorkingCapitalData => ({
  monthlyRequirements: [
    { month: 'Jan', requirement: 125000000, available: 95000000, gap: -30000000, action: 'Ativar linha crédito' },
    { month: 'Fev', requirement: 180000000, available: 120000000, gap: -60000000, action: 'CPR complementar' },
    { month: 'Mar', requirement: 145000000, available: 200000000, gap: 55000000, action: 'Aplicar excedente' }
  ],
  currentRatio: 1.45,
  quickRatio: 1.12,
  hasRealData: false
})

const createMockConversionCycle = (): ConversionCycleData => ({
  totalDays: 147,
  daysInventory: 85,
  daysSalesOutstanding: 22,
  daysPayableOutstanding: 45,
  yearOverYearChange: -12,
  benchmarkDays: 165,
  hasRealData: false
})

const createMockOptimization = (): OptimizationOpportunity[] => [
  {
    type: 'receivables_factoring',
    title: 'Antecipação de Recebíveis',
    description: 'Volume disponível: R$ 45M com taxa de 1.2% a.m.',
    potentialBenefit: 44500000,
    implementationCost: 540000,
    timeframe: 'Imediato',
    roi: 8.24,
    hasRealData: false
  },
  {
    type: 'payment_terms',
    title: 'Negociação de Prazos',
    description: '12 fornecedores elegíveis para extensão de 15 dias',
    potentialBenefit: 18000000,
    implementationCost: 0,
    timeframe: '30 dias',
    roi: Infinity,
    hasRealData: false
  }
]

const createMockContingency = (): ContingencyData => ({
  liquiditySources: [
    { source: 'Linha de crédito disponível', amount: 50000000, timeToAccess: 'Imediato', cost: 0.012 },
    { source: 'Ativos líquidos', amount: 15000000, timeToAccess: '3 dias', cost: 0.005 },
    { source: 'Recebíveis antecipáveis', amount: 45000000, timeToAccess: '5 dias', cost: 0.012 },
    { source: 'CPR potencial', amount: 80000000, timeToAccess: '15 dias', cost: 0.095 }
  ],
  stressScenarios: [
    {
      name: 'Queda 30% preço soja',
      description: 'Redução severa no preço da commodity',
      survivalMonths: 8,
      mitigationActions: ['Ativar hedge adicional', 'Reduzir custos operacionais', 'Acessar linha emergencial']
    },
    {
      name: 'Atraso 60 dias recebimentos',
      description: 'Inadimplência generalizada de clientes',
      survivalMonths: 6,
      mitigationActions: ['Antecipar recebíveis', 'Renegociar prazos pagamento', 'Ativar seguros']
    }
  ],
  hasRealData: false
})

// Main function to fetch cash flow data
const fetchCashFlowData = async (filters?: CashFlowFilters): Promise<CashFlowPortfolio> => {
  try {
    // Fetch real debt payments
    const debtPayments = await fetchDebtPaymentsForCashFlow()
    
    // Create components with real and mock data
    const overview = createCashFlowOverview(debtPayments)
    const projections = createCashFlowProjections(debtPayments)
    const calendar = createPaymentCalendar(debtPayments)
    const payables = createPayablesAging(debtPayments)
    
    // Mock data components
    const receivables = createMockReceivables()
    const workingCapital = createMockWorkingCapital()
    const conversionCycle = createMockConversionCycle()
    const optimization = createMockOptimization()
    const contingency = createMockContingency()

    return {
      overview,
      projections,
      transactions: [], // Will be populated from calendar
      calendar,
      receivables,
      payables,
      workingCapital,
      conversionCycle,
      optimization,
      contingency
    }
  } catch (error) {
    console.error('Error fetching cash flow data:', error)
    throw error
  }
}

// Hook to use cash flow data
export const useCashFlowData = (filters?: CashFlowFilters) => {
  return useQuery({
    queryKey: ['cash-flow-data', filters],
    queryFn: () => fetchCashFlowData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 1
  })
}