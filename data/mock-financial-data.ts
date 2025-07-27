import { 
  FinancialOverviewData, 
  FinancialKPI, 
  IncomeStatementItem, 
  CostCategory, 
  MarginData, 
  CostPerHectareData, 
  FinancialIndicator,
  FinancialPeriod,
  FinancialFilters
} from '@/types/financial'
import { 
  calculatePercentageChange,
  getTrendDirection,
  getKPIStatus,
  calculateMargin,
  calculateEfficiency,
  getEfficiencyColor
} from '@/utils/financial-calculations'

// Farm configuration
const HECTARES = 50_000
const SOYBEAN_YIELD_BAGS_PER_HA = 60
const SOYBEAN_PRICE_PER_BAG = 162
const CORN_REVENUE_PERCENTAGE = 0.15

// Financial periods
export const mockFinancialPeriods: FinancialPeriod[] = [
  {
    id: 'current_harvest',
    label: 'Safra 2024/25',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-08-31'),
    type: 'harvest'
  },
  {
    id: 'previous_harvest',
    label: 'Safra 2023/24',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-08-31'),
    type: 'harvest'
  },
  {
    id: 'q1_2025',
    label: 'Q1 2025',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-03-31'),
    type: 'quarterly'
  }
]

// Calculate base financial values
const GROSS_REVENUE = HECTARES * SOYBEAN_YIELD_BAGS_PER_HA * SOYBEAN_PRICE_PER_BAG
const CORN_REVENUE = GROSS_REVENUE * CORN_REVENUE_PERCENTAGE
const TOTAL_REVENUE = GROSS_REVENUE + CORN_REVENUE // R$ 559M

const PRODUCTION_COSTS = HECTARES * 4680 // R$ 234M (R$ 4,680/ha)
const SALES_TAXES = TOTAL_REVENUE * 0.04 // 4% of revenue
const OPERATING_EXPENSES = 78_500_000 // R$ 78.5M
const ADMINISTRATIVE_COSTS = 31_000_000 // R$ 31M
const FINANCIAL_EXPENSES = 45_200_000 // R$ 45.2M
const DEPRECIATION = 39_800_000 // R$ 39.8M
const INCOME_TAX = 50_400_000 // R$ 50.4M

const EBITDA = TOTAL_REVENUE - SALES_TAXES - PRODUCTION_COSTS - OPERATING_EXPENSES - ADMINISTRATIVE_COSTS - FINANCIAL_EXPENSES
const NET_PROFIT = EBITDA - DEPRECIATION - INCOME_TAX

// Previous year values for comparison
const PREVIOUS_REVENUE = 498_000_000
const PREVIOUS_EBITDA = 124_500_000
const PREVIOUS_NET_PROFIT = 82_100_000

// Mock KPIs
export const mockKPIs: FinancialKPI[] = [
  {
    id: 'total_revenue',
    title: 'Receita Total',
    value: TOTAL_REVENUE,
    previousValue: PREVIOUS_REVENUE,
    target: 650_000_000,
    unit: 'currency',
    format: 'millions',
    trend: getTrendDirection(calculatePercentageChange(TOTAL_REVENUE, PREVIOUS_REVENUE)),
    trendValue: calculatePercentageChange(TOTAL_REVENUE, PREVIOUS_REVENUE),
    
    trendLabel: 'vs safra anterior',
    status: getKPIStatus(TOTAL_REVENUE, 650_000_000),
    sparklineData: [420, 445, 465, 485, 502, 498, 520, 535, 545, 559],
    breakdown: [
      { label: 'Soja', value: GROSS_REVENUE, percentage: 85, color: '#10b981' },
      { label: 'Milho Safrinha', value: CORN_REVENUE, percentage: 15, color: '#f59e0b' }
    ],
    description: 'Receita bruta total da operação agrícola'
  },
  {
    id: 'ebitda',
    title: 'EBITDA',
    value: EBITDA,
    previousValue: PREVIOUS_EBITDA,
    target: 150_000_000,
    unit: 'currency',
    format: 'millions',
    trend: getTrendDirection(calculatePercentageChange(EBITDA, PREVIOUS_EBITDA)),
    trendValue: calculatePercentageChange(EBITDA, PREVIOUS_EBITDA),
    trendLabel: 'vs safra anterior',
    status: getKPIStatus(EBITDA, 150_000_000),
    sparklineData: [110, 118, 125, 132, 128, 124, 135, 142, 145, 140],
    breakdown: [
      { label: 'Margem EBITDA', value: calculateMargin(EBITDA, TOTAL_REVENUE), percentage: 100, color: '#3b82f6' }
    ],
    description: 'Lucro antes de juros, impostos, depreciação e amortização'
  },
  {
    id: 'net_profit',
    title: 'Lucro Líquido',
    value: NET_PROFIT,
    previousValue: PREVIOUS_NET_PROFIT,
    target: 80_000_000,
    unit: 'currency',
    format: 'millions',
    trend: getTrendDirection(calculatePercentageChange(NET_PROFIT, PREVIOUS_NET_PROFIT)),
    trendValue: calculatePercentageChange(NET_PROFIT, PREVIOUS_NET_PROFIT),
    trendLabel: 'vs safra anterior',
    status: getKPIStatus(NET_PROFIT, PREVIOUS_NET_PROFIT),
    sparklineData: [65, 68, 72, 75, 78, 82, 85, 88, 86, 89],
    breakdown: [
      { label: 'Margem Líquida', value: calculateMargin(NET_PROFIT, TOTAL_REVENUE), percentage: 50, color: '#8b5cf6' },
      { label: 'Por Hectare', value: NET_PROFIT / HECTARES, percentage: 50, color: '#06b6d4' }
    ],
    description: 'Resultado líquido após todos os custos e impostos'
  },
  {
    id: 'roe',
    title: 'ROE',
    value: 18.5,
    target: 15.0,
    unit: 'percentage',
    format: 'decimal',
    trend: 'up',
    trendValue: 2.3,
    trendLabel: 'vs benchmark setor',
    status: 'excellent',
    sparklineData: [14.2, 15.1, 16.8, 17.2, 17.8, 18.1, 18.5, 18.3, 18.7, 18.5],
    breakdown: [
      { label: 'Benchmark Setor', value: 15.2, percentage: 100, color: '#64748b' }
    ],
    description: 'Retorno sobre o patrimônio líquido'
  },
  {
    id: 'roic',
    title: 'ROIC',
    value: 14.2,
    target: 11.8, // WACC
    unit: 'percentage',
    format: 'decimal',
    trend: 'up',
    trendValue: 2.4,
    trendLabel: 'vs WACC',
    status: 'excellent',
    sparklineData: [10.5, 11.2, 12.1, 12.8, 13.2, 13.8, 14.1, 14.2, 14.0, 14.2],
    breakdown: [
      { label: 'WACC', value: 11.8, percentage: 60, color: '#ef4444' },
      { label: 'Spread', value: 2.4, percentage: 40, color: '#10b981' }
    ],
    description: 'Retorno sobre o capital investido'
  },
  {
    id: 'eva',
    title: 'EVA',
    value: 28_500_000,
    target: 20_000_000,
    unit: 'currency',
    format: 'millions',
    trend: 'up',
    trendValue: 15.3,
    trendLabel: 'vs ano anterior',
    status: 'excellent',
    sparklineData: [18, 20, 22, 24, 25, 26, 27, 28, 29, 28],
    breakdown: [
      { label: 'Por Hectare', value: 570, percentage: 100, color: '#10b981' }
    ],
    description: 'Valor econômico agregado'
  }
]

// Mock Income Statement
export const mockIncomeStatement: IncomeStatementItem[] = [
  {
    id: 'gross_revenue',
    label: 'Receita Bruta',
    value: TOTAL_REVENUE,
    type: 'revenue',
    category: 'positive',
    budgetValue: 545_000_000,
    previousValue: PREVIOUS_REVENUE,
    breakdown: [
      { label: 'Soja', value: GROSS_REVENUE, percentage: 85 },
      { label: 'Milho', value: CORN_REVENUE, percentage: 15 }
    ]
  },
  {
    id: 'sales_taxes',
    label: 'Impostos sobre Vendas',
    value: -SALES_TAXES,
    type: 'expense',
    category: 'negative',
    budgetValue: -21_800_000,
    previousValue: -19_920_000
  },
  {
    id: 'production_costs',
    label: 'Custos de Produção',
    value: -PRODUCTION_COSTS,
    type: 'cost',
    category: 'negative',
    budgetValue: -225_000_000,
    previousValue: -218_000_000,
    breakdown: [
      { label: 'Insumos', value: 117_000_000, percentage: 50 },
      { label: 'Operações', value: 78_000_000, percentage: 33.3 },
      { label: 'Outros', value: 39_000_000, percentage: 16.7 }
    ]
  },
  {
    id: 'operating_expenses',
    label: 'Despesas Operacionais',
    value: -OPERATING_EXPENSES,
    type: 'expense',
    category: 'negative',
    budgetValue: -75_000_000,
    previousValue: -72_500_000
  },
  {
    id: 'administrative_costs',
    label: 'Despesas Administrativas',
    value: -ADMINISTRATIVE_COSTS,
    type: 'expense',
    category: 'negative',
    budgetValue: -28_500_000,
    previousValue: -29_200_000
  },
  {
    id: 'financial_expenses',
    label: 'Despesas Financeiras',
    value: -FINANCIAL_EXPENSES,
    type: 'expense',
    category: 'negative',
    budgetValue: -42_000_000,
    previousValue: -48_500_000
  },
  {
    id: 'ebitda',
    label: 'EBITDA',
    value: EBITDA,
    type: 'total',
    category: 'positive',
    budgetValue: 152_700_000,
    previousValue: PREVIOUS_EBITDA
  },
  {
    id: 'depreciation',
    label: 'Depreciação',
    value: -DEPRECIATION,
    type: 'expense',
    category: 'negative',
    budgetValue: -38_000_000,
    previousValue: -37_200_000
  },
  {
    id: 'income_tax',
    label: 'Impostos sobre Lucro',
    value: -INCOME_TAX,
    type: 'expense',
    category: 'negative',
    budgetValue: -46_800_000,
    previousValue: -45_200_000
  },
  {
    id: 'net_profit',
    label: 'Lucro Líquido',
    value: NET_PROFIT,
    type: 'total',
    category: 'positive',
    budgetValue: 67_900_000,
    previousValue: PREVIOUS_NET_PROFIT
  }
]

// Mock Cost Categories
export const mockCostBreakdown: CostCategory[] = [
  {
    id: 'inputs',
    name: 'Insumos',
    totalValue: 210_000_000,
    budgetValue: 195_000_000,
    previousValue: 185_000_000,
    percentage: 50.1,
    efficiency: calculateEfficiency(210_000_000, 195_000_000),
    color: getEfficiencyColor(calculateEfficiency(210_000_000, 195_000_000)),
    subcategories: [
      {
        id: 'seeds',
        name: 'Sementes',
        value: 38_700_000,
        budgetValue: 35_000_000,
        percentage: 18.4,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(38_700_000, 35_000_000)
      },
      {
        id: 'fertilizers',
        name: 'Fertilizantes',
        value: 100_500_000,
        budgetValue: 95_000_000,
        percentage: 47.9,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(100_500_000, 95_000_000)
      },
      {
        id: 'pesticides',
        name: 'Defensivos',
        value: 70_500_000,
        budgetValue: 65_000_000,
        percentage: 33.6,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(70_500_000, 65_000_000)
      }
    ]
  },
  {
    id: 'operations',
    name: 'Operacionais',
    totalValue: 78_500_000,
    budgetValue: 75_000_000,
    previousValue: 72_500_000,
    percentage: 18.7,
    efficiency: calculateEfficiency(78_500_000, 75_000_000),
    color: getEfficiencyColor(calculateEfficiency(78_500_000, 75_000_000)),
    subcategories: [
      {
        id: 'labor',
        name: 'Mão de Obra',
        value: 24_300_000,
        budgetValue: 22_500_000,
        percentage: 31.0,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(24_300_000, 22_500_000)
      },
      {
        id: 'fuel',
        name: 'Combustível',
        value: 19_500_000,
        budgetValue: 20_000_000,
        percentage: 24.8,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(19_500_000, 20_000_000)
      },
      {
        id: 'maintenance',
        name: 'Manutenção',
        value: 17_200_000,
        budgetValue: 16_000_000,
        percentage: 21.9,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(17_200_000, 16_000_000)
      },
      {
        id: 'rent',
        name: 'Arrendamentos',
        value: 17_500_000,
        budgetValue: 16_500_000,
        percentage: 22.3,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(17_500_000, 16_500_000)
      }
    ]
  },
  {
    id: 'administrative',
    name: 'Administrativos',
    totalValue: 31_000_000,
    budgetValue: 28_500_000,
    previousValue: 29_200_000,
    percentage: 7.4,
    efficiency: calculateEfficiency(31_000_000, 28_500_000),
    color: getEfficiencyColor(calculateEfficiency(31_000_000, 28_500_000)),
    subcategories: [
      {
        id: 'management',
        name: 'Gestão',
        value: 18_600_000,
        budgetValue: 17_100_000,
        percentage: 60.0,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(18_600_000, 17_100_000)
      },
      {
        id: 'consulting',
        name: 'Consultoria',
        value: 12_400_000,
        budgetValue: 11_400_000,
        percentage: 40.0,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(12_400_000, 11_400_000)
      }
    ]
  },
  {
    id: 'financial',
    name: 'Financeiros',
    totalValue: 45_200_000,
    budgetValue: 42_000_000,
    previousValue: 48_500_000,
    percentage: 10.8,
    efficiency: calculateEfficiency(45_200_000, 42_000_000),
    color: getEfficiencyColor(calculateEfficiency(45_200_000, 42_000_000)),
    subcategories: [
      {
        id: 'interest',
        name: 'Juros',
        value: 35_400_000,
        budgetValue: 33_600_000,
        percentage: 78.3,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(35_400_000, 33_600_000)
      },
      {
        id: 'fees',
        name: 'Tarifas',
        value: 9_800_000,
        budgetValue: 8_400_000,
        percentage: 21.7,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(9_800_000, 8_400_000)
      }
    ]
  },
  {
    id: 'logistics',
    name: 'Logística',
    totalValue: 54_400_000,
    budgetValue: 51_000_000,
    previousValue: 49_800_000,
    percentage: 13.0,
    efficiency: calculateEfficiency(54_400_000, 51_000_000),
    color: getEfficiencyColor(calculateEfficiency(54_400_000, 51_000_000)),
    subcategories: [
      {
        id: 'transport',
        name: 'Transporte',
        value: 32_600_000,
        budgetValue: 30_600_000,
        percentage: 60.0,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(32_600_000, 30_600_000)
      },
      {
        id: 'storage',
        name: 'Armazenagem',
        value: 21_800_000,
        budgetValue: 20_400_000,
        percentage: 40.0,
        unit: 'R$/ha',
        efficiency: calculateEfficiency(21_800_000, 20_400_000)
      }
    ]
  }
]

// Mock Margin Evolution Data
export const mockMarginEvolution: MarginData[] = [
  { period: '2020', date: new Date('2020-12-31'), grossMargin: 42.5, operationalMargin: 28.3, ebitdaMargin: 22.1, netMargin: 13.2, sectorBenchmark: { grossMargin: 38.2, operationalMargin: 24.8, ebitdaMargin: 18.5, netMargin: 11.2 } },
  { period: '2021', date: new Date('2021-12-31'), grossMargin: 45.8, operationalMargin: 31.2, ebitdaMargin: 24.8, netMargin: 15.1, sectorBenchmark: { grossMargin: 40.1, operationalMargin: 26.3, ebitdaMargin: 19.8, netMargin: 12.1 } },
  { period: '2022', date: new Date('2022-12-31'), grossMargin: 41.2, operationalMargin: 27.8, ebitdaMargin: 21.5, netMargin: 12.8, sectorBenchmark: { grossMargin: 37.8, operationalMargin: 24.2, ebitdaMargin: 18.1, netMargin: 10.8 } },
  { period: '2023', date: new Date('2023-12-31'), grossMargin: 48.1, operationalMargin: 33.5, ebitdaMargin: 26.2, netMargin: 16.5, sectorBenchmark: { grossMargin: 42.3, operationalMargin: 28.1, ebitdaMargin: 21.2, netMargin: 13.4 } },
  { period: '2024', date: new Date('2024-12-31'), grossMargin: 46.9, operationalMargin: 32.1, ebitdaMargin: 25.1, netMargin: 16.0, sectorBenchmark: { grossMargin: 41.8, operationalMargin: 27.5, ebitdaMargin: 20.8, netMargin: 13.1 } }
]

// Mock Cost per Hectare Data
export const mockCostPerHectare: CostPerHectareData[] = [
  { category: 'Sementes', current: 774, budget: 700, previousYear: 650, unit: 'R$/ha', efficiency: 10.6, trend: 'worsening' },
  { category: 'Fertilizantes', current: 2010, budget: 1900, previousYear: 1850, unit: 'R$/ha', efficiency: 5.8, trend: 'worsening' },
  { category: 'Defensivos', current: 1410, budget: 1300, previousYear: 1275, unit: 'R$/ha', efficiency: 8.5, trend: 'worsening' },
  { category: 'Operações', current: 1570, budget: 1500, previousYear: 1450, unit: 'R$/ha', efficiency: 4.7, trend: 'stable' },
  { category: 'Overhead', current: 620, budget: 570, previousYear: 584, unit: 'R$/ha', efficiency: 8.8, trend: 'worsening' }
]

// Mock Financial Indicators
export const mockFinancialIndicators: FinancialIndicator[] = [
  {
    id: 'current_liquidity',
    name: 'Liquidez Corrente',
    value: 1.45,
    target: 1.3,
    unit: 'ratio',
    status: 'good',
    trend: 'stable',
    description: 'Capacidade de pagamento de obrigações de curto prazo',
    calculation: 'Ativo Circulante / Passivo Circulante'
  },
  {
    id: 'working_capital',
    name: 'Capital de Giro',
    value: 124_000_000,
    unit: 'currency',
    status: 'good',
    trend: 'up',
    description: 'Recursos para financiar as operações do dia a dia',
    calculation: 'Ativo Circulante - Passivo Circulante'
  },
  {
    id: 'debt_to_equity',
    name: 'Endividamento',
    value: 0.68,
    target: 0.7,
    unit: 'ratio',
    status: 'good',
    trend: 'stable',
    description: 'Relação entre dívidas e patrimônio líquido',
    calculation: 'Passivo Total / Patrimônio Líquido'
  },
  {
    id: 'asset_turnover',
    name: 'Giro do Ativo',
    value: 0.72,
    benchmark: 0.65,
    unit: 'ratio',
    status: 'excellent',
    trend: 'up',
    description: 'Eficiência na utilização dos ativos',
    calculation: 'Receita Líquida / Ativo Total'
  },
  {
    id: 'financial_cycle',
    name: 'Ciclo Financeiro',
    value: 147,
    benchmark: 165,
    unit: 'days',
    status: 'good',
    trend: 'down',
    description: 'Tempo entre pagamento de insumos e recebimento de vendas',
    calculation: 'Prazo Médio de Estoque + Prazo Médio de Recebimento - Prazo Médio de Pagamento'
  },
  {
    id: 'break_even',
    name: 'Ponto de Equilíbrio',
    value: 42.5,
    unit: 'ratio',
    status: 'good',
    trend: 'stable',
    description: 'Produtividade mínima necessária para cobrir custos',
    calculation: 'Custos Fixos / (Preço Unitário - Custo Variável Unitário)'
  }
]

// Default filters
export const mockDefaultFilters: FinancialFilters = {
  period: mockFinancialPeriods[0],
  comparison: {
    type: 'previous_harvest',
    period: mockFinancialPeriods[1]
  },
  culture: 'all',
  plots: [],
  costCenters: []
}

// Main financial overview data
export const mockFinancialOverviewData: FinancialOverviewData = {
  kpis: mockKPIs,
  incomeStatement: mockIncomeStatement,
  costBreakdown: mockCostBreakdown,
  marginEvolution: mockMarginEvolution,
  costPerHectare: mockCostPerHectare,
  financialIndicators: mockFinancialIndicators,
  lastUpdated: new Date(),
  filters: mockDefaultFilters
}

// Simulation function to generate data with delays
export const simulateApiCall = <T>(data: T, delay = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}