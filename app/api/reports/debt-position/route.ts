import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const format = searchParams.get('format') || 'json'
    const includeHistorical = searchParams.get('includeHistorical') === 'true'

    // Fetch current debt position using the debt position analysis view
    const { data: positionData, error } = await supabase
      .from('vw_debt_position_analysis')
      .select('*')
      .order('total_balance_brl', { ascending: false })

    if (error) {
      console.error('Error fetching debt position data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch debt position data' },
        { status: 500 }
      )
    }

    if (!positionData || positionData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          executiveSummary: getEmptyExecutiveSummary(),
          compositionAnalysis: getEmptyComposition(),
          concentrationRisks: [],
          benchmarkComparison: getEmptyBenchmark(),
          recommendations: []
        }
      })
    }

    // Process the debt position data
    const processedData = await processDebtPositionData(positionData)
    
    // Add historical data if requested
    let historicalData = null
    if (includeHistorical) {
      historicalData = await fetchHistoricalData(supabase)
    }

    const response = {
      success: true,
      data: {
        ...processedData,
        historicalData,
        metadata: {
          generatedAt: new Date().toISOString(),
          includeHistorical,
          dataPoints: positionData.length
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Debt position API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processDebtPositionData(positionData: any[]) {
  // Calculate executive summary
  const totalDebt = positionData.reduce((sum, item) => sum + item.total_balance_brl, 0)
  const totalContracts = positionData.reduce((sum, item) => sum + item.contract_count, 0)
  
  // Calculate currency composition
  const currencyGroups = new Map<string, { amount: number, avgRate: number, contracts: number }>()
  positionData.forEach(item => {
    const currency = item.currency_code
    if (!currencyGroups.has(currency)) {
      currencyGroups.set(currency, { amount: 0, avgRate: 0, contracts: 0 })
    }
    const group = currencyGroups.get(currency)!
    group.amount += item.total_balance_brl
    group.avgRate = (group.avgRate * group.contracts + item.avg_interest_rate * item.contract_count) / (group.contracts + item.contract_count)
    group.contracts += item.contract_count
  })

  const currencyComposition = Array.from(currencyGroups.entries()).map(([currency, data]) => ({
    currency,
    amount: data.amount,
    percentage: (data.amount / totalDebt) * 100,
    avgRate: data.avgRate,
    contracts: data.contracts
  }))

  // Calculate institution composition
  const institutionGroups = new Map<string, { amount: number, avgRate: number, contracts: number }>()
  positionData.forEach(item => {
    const institution = item.agente
    if (!institutionGroups.has(institution)) {
      institutionGroups.set(institution, { amount: 0, avgRate: 0, contracts: 0 })
    }
    const group = institutionGroups.get(institution)!
    group.amount += item.total_balance_brl
    group.avgRate = (group.avgRate * group.contracts + item.avg_interest_rate * item.contract_count) / (group.contracts + item.contract_count)
    group.contracts += item.contract_count
  })

  const institutionComposition = Array.from(institutionGroups.entries())
    .map(([institution, data]) => ({
      institution,
      amount: data.amount,
      percentage: (data.amount / totalDebt) * 100,
      avgRate: data.avgRate,
      contracts: data.contracts,
      riskRating: calculateRiskRating(data.amount, totalDebt)
    }))
    .sort((a, b) => b.amount - a.amount)

  // Calculate modalidade composition
  const modalidadeGroups = new Map<string, { amount: number, avgRate: number, contracts: number }>()
  positionData.forEach(item => {
    const modalidade = item.modalidade
    if (!modalidadeGroups.has(modalidade)) {
      modalidadeGroups.set(modalidade, { amount: 0, avgRate: 0, contracts: 0 })
    }
    const group = modalidadeGroups.get(modalidade)!
    group.amount += item.total_balance_brl
    group.avgRate = (group.avgRate * group.contracts + item.avg_interest_rate * item.contract_count) / (group.contracts + item.contract_count)
    group.contracts += item.contract_count
  })

  const modalidadeComposition = Array.from(modalidadeGroups.entries()).map(([modalidade, data]) => ({
    modalidade,
    amount: data.amount,
    percentage: (data.amount / totalDebt) * 100,
    avgRate: data.avgRate,
    contracts: data.contracts
  }))

  // Calculate weighted average rate
  let totalWeightedRate = 0
  positionData.forEach(item => {
    totalWeightedRate += (item.avg_interest_rate || 0) * item.total_balance_brl
  })
  const avgWeightedRate = totalDebt > 0 ? totalWeightedRate / totalDebt : 0

  // Calculate concentration risks
  const concentrationRisks = analyzeConcentrationRisks(institutionComposition, currencyComposition)

  // Generate executive summary
  const executiveSummary = {
    totalDebt,
    totalContracts,
    avgWeightedRate,
    usdExposure: currencyComposition.find(c => c.currency === 'USD')?.amount || 0,
    usdExposurePercent: currencyComposition.find(c => c.currency === 'USD')?.percentage || 0,
    topInstitution: institutionComposition[0]?.institution || 'N/A',
    topInstitutionPercent: institutionComposition[0]?.percentage || 0,
    avgMaturity: calculateAvgMaturity(positionData),
    nextPaymentDate: findNextPaymentDate(positionData)
  }

  // Generate benchmark comparison
  const benchmarkComparison = generateBenchmarkComparison(executiveSummary, institutionComposition)

  // Generate recommendations
  const recommendations = generateRecommendations(executiveSummary, concentrationRisks)

  return {
    executiveSummary,
    compositionAnalysis: {
      byCurrency: currencyComposition,
      byInstitution: institutionComposition,
      byModalidade: modalidadeComposition
    },
    concentrationRisks,
    benchmarkComparison,
    recommendations
  }
}

function calculateRiskRating(amount: number, totalDebt: number): 'A' | 'B' | 'C' {
  const percentage = (amount / totalDebt) * 100
  if (percentage > 30) return 'C'
  if (percentage > 15) return 'B'
  return 'A'
}

function analyzeConcentrationRisks(institutions: any[], currencies: any[]) {
  const risks = []

  // Institution concentration risk
  const topThreeInstitutions = institutions.slice(0, 3)
  const topThreeConcentration = topThreeInstitutions.reduce((sum, inst) => sum + inst.percentage, 0)
  
  if (topThreeConcentration > 70) {
    risks.push({
      type: 'institution_concentration',
      severity: 'high',
      description: `${topThreeConcentration.toFixed(1)}% da dívida concentrada em 3 instituições`,
      recommendation: 'Diversificar base de credores'
    })
  }

  // Currency concentration risk
  const usdExposure = currencies.find(c => c.currency === 'USD')?.percentage || 0
  if (usdExposure > 50) {
    risks.push({
      type: 'currency_concentration',
      severity: 'high',
      description: `${usdExposure.toFixed(1)}% da dívida em USD`,
      recommendation: 'Implementar estratégia de hedge cambial'
    })
  }

  // Single institution risk
  institutions.forEach(inst => {
    if (inst.percentage > 25) {
      risks.push({
        type: 'single_institution',
        severity: inst.percentage > 35 ? 'high' : 'medium',
        description: `${inst.institution}: ${inst.percentage.toFixed(1)}% da dívida total`,
        recommendation: 'Considerar diversificação para reduzir dependência'
      })
    }
  })

  return risks
}

function calculateAvgMaturity(positionData: any[]): number {
  // Simplified calculation - in reality would need actual maturity dates
  return 28 // months
}

function findNextPaymentDate(positionData: any[]): string {
  // Would need to query actual payment schedule
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return nextMonth.toISOString().split('T')[0]
}

function generateBenchmarkComparison(summary: any, institutions: any[]) {
  return {
    debtPerHectare: {
      value: summary.totalDebt / 5000, // Assuming 5000 hectares
      sectorAverage: 12200,
      percentile: 75
    },
    usdExposure: {
      value: summary.usdExposurePercent,
      sectorAverage: 35.2,
      percentile: 90
    },
    avgRate: {
      value: summary.avgWeightedRate,
      sectorAverage: 11.4,
      percentile: 25
    },
    topThreeConcentration: {
      value: institutions.slice(0, 3).reduce((sum, inst) => sum + inst.percentage, 0),
      sectorAverage: 60,
      percentile: 80
    }
  }
}

function generateRecommendations(summary: any, risks: any[]) {
  const recommendations = []

  if (summary.usdExposurePercent > 50) {
    recommendations.push({
      priority: 'alta',
      category: 'hedge_cambial',
      title: 'Implementar Estratégia de Hedge Cambial',
      description: 'Alta exposição USD requer proteção contra variações cambiais',
      expectedImpact: 'Redução do risco cambial em até 80%'
    })
  }

  if (risks.some(r => r.type === 'institution_concentration')) {
    recommendations.push({
      priority: 'média',
      category: 'diversificacao',
      title: 'Diversificar Base de Credores',
      description: 'Reduzir concentração institucional para melhorar negociação',
      expectedImpact: 'Melhoria no poder de barganha e redução de riscos'
    })
  }

  if (summary.avgWeightedRate > 12) {
    recommendations.push({
      priority: 'alta',
      category: 'refinanciamento',
      title: 'Avaliar Oportunidades de Refinanciamento',
      description: 'Taxa média acima do mercado indica potencial de otimização',
      expectedImpact: 'Economia potencial de R$ 2-4M por ano'
    })
  }

  return recommendations
}

async function fetchHistoricalData(supabase: any) {
  // Mock historical data - in real implementation would query historical tables
  return [
    { month: '2024-07', totalDebt: 500000000 },
    { month: '2024-08', totalDebt: 520000000 },
    { month: '2024-09', totalDebt: 605000000 },
    { month: '2024-10', totalDebt: 610000000 },
    { month: '2024-11', totalDebt: 615000000 },
    { month: '2024-12', totalDebt: 620000000 },
    { month: '2025-01', totalDebt: 740000000 },
    { month: '2025-02', totalDebt: 735000000 },
    { month: '2025-03', totalDebt: 730000000 },
    { month: '2025-04', totalDebt: 725000000 },
    { month: '2025-05', totalDebt: 680000000 },
    { month: '2025-06', totalDebt: 690000000 },
    { month: '2025-07', totalDebt: 687500000 }
  ]
}

function getEmptyExecutiveSummary() {
  return {
    totalDebt: 0,
    totalContracts: 0,
    avgWeightedRate: 0,
    usdExposure: 0,
    usdExposurePercent: 0,
    topInstitution: 'N/A',
    topInstitutionPercent: 0,
    avgMaturity: 0,
    nextPaymentDate: new Date().toISOString().split('T')[0]
  }
}

function getEmptyComposition() {
  return {
    byCurrency: [],
    byInstitution: [],
    byModalidade: []
  }
}

function getEmptyBenchmark() {
  return {
    debtPerHectare: { value: 0, sectorAverage: 12200, percentile: 50 },
    usdExposure: { value: 0, sectorAverage: 35.2, percentile: 50 },
    avgRate: { value: 0, sectorAverage: 11.4, percentile: 50 },
    topThreeConcentration: { value: 0, sectorAverage: 60, percentile: 50 }
  }
}