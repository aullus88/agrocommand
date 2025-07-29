import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const groupBy = searchParams.get('groupBy') || 'week'
    const currency = searchParams.get('currency') || 'all'
    const institution = searchParams.get('institution') || 'all'
    const format = searchParams.get('format') || 'json'

    // Build base query using the cash flow analysis view
    let query = supabase
      .from('vw_cash_flow_analysis')
      .select('*')
      .gte('vencim_parcela', startDate)
      .lte('vencim_parcela', endDate)
      .order('vencim_parcela', { ascending: true })

    // Apply filters
    if (currency !== 'all') {
      const currencyMap: Record<string, string> = {
        'BRL': 'R$',
        'USD': 'US$',
        'EUR': '€UR'
      }
      query = query.eq('moeda', currencyMap[currency] || currency)
    }

    if (institution !== 'all') {
      query = query.eq('agente', institution)
    }

    const { data: payments, error } = await query

    if (error) {
      console.error('Error fetching cash flow data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cash flow data' },
        { status: 500 }
      )
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalAmount: 0,
            paymentCount: 0,
            maxPayment: 0,
            avgPayment: 0,
            concentrationPercent: 0
          },
          groupedData: [],
          payments: [],
          alerts: []
        }
      })
    }

    // Process and group the data
    const processedData = await processPaymentsForCashFlow(payments, groupBy)

    // Generate alerts
    const alerts = generateCashFlowAlerts(processedData, payments)

    const response = {
      success: true,
      data: {
        ...processedData,
        alerts,
        metadata: {
          generatedAt: new Date().toISOString(),
          period: `${startDate} to ${endDate}`,
          groupBy,
          filters: {
            currency,
            institution
          }
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Cash flow API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processPaymentsForCashFlow(payments: any[], groupBy: string) {
  // Calculate summary metrics
  const totalAmount = payments.reduce((sum, p) => sum + p.total_brl, 0)
  const paymentCount = payments.length
  const maxPayment = Math.max(...payments.map(p => p.total_brl), 0)
  const avgPayment = paymentCount > 0 ? totalAmount / paymentCount : 0

  // Calculate concentration by institution
  const institutionTotals = new Map<string, number>()
  payments.forEach(p => {
    institutionTotals.set(p.agente, (institutionTotals.get(p.agente) || 0) + p.total_brl)
  })
  
  const maxInstitutionTotal = Math.max(...institutionTotals.values(), 0)
  const concentrationPercent = totalAmount > 0 ? (maxInstitutionTotal / totalAmount) * 100 : 0

  // Group payments by period
  const groups = new Map<string, {
    period: string
    startDate: Date
    endDate: Date
    payments: any[]
    totalAmount: number
    principalAmount: number
    interestAmount: number
    paymentCount: number
  }>()

  payments.forEach(payment => {
    const paymentDate = new Date(payment.vencim_parcela)
    let periodKey: string
    let periodStart: Date
    let periodEnd: Date

    if (groupBy === 'week') {
      // Start of week (Monday)
      periodStart = new Date(paymentDate)
      periodStart.setDate(paymentDate.getDate() - paymentDate.getDay() + 1)
      periodStart.setHours(0, 0, 0, 0)
      
      // End of week (Sunday)
      periodEnd = new Date(periodStart)
      periodEnd.setDate(periodStart.getDate() + 6)
      periodEnd.setHours(23, 59, 59, 999)
      
      periodKey = `${periodStart.toISOString().split('T')[0]}_${periodEnd.toISOString().split('T')[0]}`
    } else {
      // Month grouping
      periodStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1)
      periodEnd = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0, 23, 59, 59, 999)
      periodKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`
    }

    if (!groups.has(periodKey)) {
      groups.set(periodKey, {
        period: periodKey,
        startDate: periodStart,
        endDate: periodEnd,
        payments: [],
        totalAmount: 0,
        principalAmount: 0,
        interestAmount: 0,
        paymentCount: 0
      })
    }

    const group = groups.get(periodKey)!
    group.payments.push(payment)
    group.totalAmount += payment.total_brl
    group.principalAmount += payment.principal_brl
    group.interestAmount += payment.interest_brl
    group.paymentCount += 1
  })

  const groupedData = Array.from(groups.values()).sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  )

  return {
    summary: {
      totalAmount,
      paymentCount,
      maxPayment,
      avgPayment,
      concentrationPercent
    },
    groupedData,
    payments
  }
}

function generateCashFlowAlerts(processedData: any, payments: any[]) {
  const alerts = []

  // Concentration alert
  if (processedData.summary.concentrationPercent > 35) {
    alerts.push({
      type: 'warning',
      title: 'Alta Concentração Institucional',
      message: `${processedData.summary.concentrationPercent.toFixed(1)}% dos vencimentos concentrados em uma única instituição`,
      recommendation: 'Considere diversificar as fontes de financiamento'
    })
  }

  // Currency exposure alert
  const foreignCurrencyPayments = payments.filter(p => p.moeda !== 'R$')
  if (foreignCurrencyPayments.length > 0) {
    const foreignExposurePercent = (foreignCurrencyPayments.reduce((sum, p) => sum + p.total_brl, 0) / processedData.summary.totalAmount) * 100
    
    if (foreignExposurePercent > 50) {
      alerts.push({
        type: 'warning',
        title: 'Alta Exposição Cambial',
        message: `${foreignExposurePercent.toFixed(1)}% dos vencimentos em moeda estrangeira`,
        recommendation: 'Verifique posição de hedge cambial'
      })
    }
  }

  // Upcoming payments alert
  const now = new Date()
  const upcomingPayments = payments.filter(p => {
    const dueDate = new Date(p.vencim_parcela)
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 7 && daysUntil >= 0
  })

  if (upcomingPayments.length > 0) {
    const upcomingAmount = upcomingPayments.reduce((sum, p) => sum + p.total_brl, 0)
    alerts.push({
      type: 'info',
      title: 'Vencimentos Próximos',
      message: `${upcomingPayments.length} pagamentos nos próximos 7 dias`,
      recommendation: `Valor total: R$ ${(upcomingAmount / 1000000).toFixed(1)}M`
    })
  }

  return alerts
}