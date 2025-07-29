'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Download,
  Filter,
  DollarSign,
  Clock,
  Building2,
  Globe
} from 'lucide-react'
import { formatCurrency } from '@/utils/debt-calculations'
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealDebtPortfolio } from '@/hooks/use-real-debt-data'
import { DBDebtPayment } from '@/hooks/use-real-debt-data'
import { CashFlowChart } from './cash-flow-chart'
import { CashFlowTable } from './cash-flow-table'
import { CashFlowMetrics } from './cash-flow-metrics'
import { Skeleton } from '@/components/ui/skeleton'

interface CashFlowReportProps {
  startDate?: Date
  endDate?: Date
  onExport?: (format: 'pdf' | 'excel') => void
}

export function CashFlowReport({ startDate, endDate, onExport }: CashFlowReportProps) {
  const [period, setPeriod] = useState('90')
  const [groupBy, setGroupBy] = useState<'week' | 'month'>('week')
  const [selectedCurrency, setSelectedCurrency] = useState<'all' | 'BRL' | 'USD' | 'EUR'>('all')
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all')

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const start = startDate || new Date()
    const end = endDate || addDays(start, parseInt(period))
    return { start, end }
  }, [startDate, endDate, period])

  // Fetch real debt data
  const { data: portfolio, isLoading } = useRealDebtPortfolio({
    dateRange: {
      start: dateRange.start,
      end: dateRange.end
    },
    currencies: ['BRL', 'USD', 'EUR'],
    institutions: [],
    rateTypes: [],
    purposes: [],
    status: ['active', 'grace', 'default', 'paid']
  })

  // Filter and process payments
  const filteredPayments = useMemo(() => {
    if (!portfolio?.contracts) return []
    
    const payments: DBDebtPayment[] = []
    
    // Extract payments from contracts
    portfolio.contracts.forEach(contract => {
      if (contract.paymentSchedule) {
        contract.paymentSchedule.forEach(scheduleItem => {
          // Convert payment schedule to DBDebtPayment format
          const payment: DBDebtPayment = {
            id: `${contract.id}-${scheduleItem.date}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            agente: contract.institution,
            modalidade: contract.rateType,
            nr_contrato: contract.contractNumber,
            tx_jur: contract.currentRate,
            objeto_financiado: contract.purpose,
            data_contrato: contract.contractDate?.toISOString() || null,
            moeda: contract.currency === 'BRL' ? 'R$' : contract.currency === 'USD' ? 'US$' : '€UR',
            documento: contract.document || null,
            parc_current: contract.currentInstallment || 1,
            parc_total: contract.totalInstallments || 1,
            vencim_parcela: scheduleItem.date.toISOString(),
            ano: scheduleItem.date.getFullYear(),
            mes: scheduleItem.date.getMonth() + 1,
            dia: scheduleItem.date.getDate(),
            vlr_capital_parcela: scheduleItem.principal,
            juros_parcela: scheduleItem.interest,
            tot_capital_juros: scheduleItem.total,
            saldo_capital_parc: scheduleItem.balance,
            saldo_juros_parc: 0,
            saldo_a_pagar: scheduleItem.balance,
            rolagem: contract.hasRollover || false,
            cambio: contract.exchangeRate || null,
            valor_pagar_reais: contract.amountInReais || null,
            status: scheduleItem.paid ? 'paid' : 'pending',
            payment_date: scheduleItem.paid ? scheduleItem.date.toISOString() : null
          }
          
          // Apply filters
          const paymentDate = new Date(payment.vencim_parcela)
          if (paymentDate >= dateRange.start && paymentDate <= dateRange.end) {
            if (selectedCurrency === 'all' || 
                (selectedCurrency === 'BRL' && payment.moeda === 'R$') ||
                (selectedCurrency === 'USD' && payment.moeda === 'US$') ||
                (selectedCurrency === 'EUR' && payment.moeda === '€UR')) {
              if (selectedInstitution === 'all' || payment.agente === selectedInstitution) {
                payments.push(payment)
              }
            }
          }
        })
      }
    })
    
    return payments.sort((a, b) => 
      new Date(a.vencim_parcela).getTime() - new Date(b.vencim_parcela).getTime()
    )
  }, [portfolio, dateRange, selectedCurrency, selectedInstitution])

  // Get unique institutions for filter
  const institutions = useMemo(() => {
    if (!portfolio?.composition?.byInstitution) return []
    return portfolio.composition.byInstitution.map(inst => inst.institution)
  }, [portfolio])

  // Group payments by period
  const groupedPayments = useMemo(() => {
    const groups = new Map<string, {
      period: string
      startDate: Date
      endDate: Date
      payments: DBDebtPayment[]
      totalAmount: number
      principalAmount: number
      interestAmount: number
      paymentCount: number
    }>()

    filteredPayments.forEach(payment => {
      const paymentDate = new Date(payment.vencim_parcela)
      let periodKey: string
      let periodStart: Date
      let periodEnd: Date

      if (groupBy === 'week') {
        periodStart = startOfWeek(paymentDate, { locale: ptBR })
        periodEnd = endOfWeek(paymentDate, { locale: ptBR })
        periodKey = `${format(periodStart, 'yyyy-MM-dd')}_${format(periodEnd, 'yyyy-MM-dd')}`
      } else {
        periodStart = startOfMonth(paymentDate)
        periodEnd = endOfMonth(paymentDate)
        periodKey = format(paymentDate, 'yyyy-MM')
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
      group.totalAmount += payment.tot_capital_juros
      group.principalAmount += payment.vlr_capital_parcela
      group.interestAmount += payment.juros_parcela
      group.paymentCount += 1
    })

    return Array.from(groups.values()).sort((a, b) => 
      a.startDate.getTime() - b.startDate.getTime()
    )
  }, [filteredPayments, groupBy])

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + p.tot_capital_juros, 0)
    const maxPayment = Math.max(...filteredPayments.map(p => p.tot_capital_juros), 0)
    const maxPaymentItem = filteredPayments.find(p => p.tot_capital_juros === maxPayment)
    
    // Find concentration
    const institutionTotals = new Map<string, number>()
    filteredPayments.forEach(p => {
      institutionTotals.set(p.agente, (institutionTotals.get(p.agente) || 0) + p.tot_capital_juros)
    })
    
    const maxInstitutionTotal = Math.max(...institutionTotals.values(), 0)
    const maxInstitution = Array.from(institutionTotals.entries())
      .find(([_, total]) => total === maxInstitutionTotal)?.[0]
    
    const concentrationPercent = total > 0 ? (maxInstitutionTotal / total) * 100 : 0

    // Find peak week
    const peakWeek = groupedPayments.reduce((max, group) => 
      group.totalAmount > (max?.totalAmount || 0) ? group : max
    , groupedPayments[0])

    return {
      totalAmount: total,
      paymentCount: filteredPayments.length,
      maxPayment,
      maxPaymentDate: maxPaymentItem?.vencim_parcela ? new Date(maxPaymentItem.vencim_parcela) : null,
      maxPaymentInstitution: maxPaymentItem?.agente,
      concentrationInstitution: maxInstitution,
      concentrationPercent,
      peakPeriod: peakWeek,
      avgPayment: filteredPayments.length > 0 ? total / filteredPayments.length : 0
    }
  }, [filteredPayments, groupedPayments])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum dado encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não há dados de pagamentos disponíveis para o período selecionado.
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique se há dados importados na tabela de pagamentos ou ajuste o filtro de período.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Fluxo de Vencimentos
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Análise detalhada dos compromissos financeiros futuros
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onExport?.('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Period selector */}
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="180">6 meses</SelectItem>
                <SelectItem value="365">1 ano</SelectItem>
              </SelectContent>
            </Select>

            {/* Group by selector */}
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as 'week' | 'month')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Por Semana</SelectItem>
                <SelectItem value="month">Por Mês</SelectItem>
              </SelectContent>
            </Select>

            {/* Currency filter */}
            <Select value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as any)}>
              <SelectTrigger className="w-[140px]">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Moedas</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>

            {/* Institution filter */}
            <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Instituições</SelectItem>
                {institutions.map(inst => (
                  <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary Metrics */}
      <CashFlowMetrics 
        metrics={metrics}
        period={parseInt(period)}
      />

      {/* Cash Flow Chart */}
      <CashFlowChart 
        data={groupedPayments}
        groupBy={groupBy}
      />

      {/* Detailed Payment Table */}
      <CashFlowTable 
        payments={filteredPayments}
        groupedData={groupedPayments}
        groupBy={groupBy}
      />

      {/* Alerts and Warnings */}
      {metrics.concentrationPercent > 35 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900">Alerta de Concentração</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {metrics.concentrationPercent.toFixed(1)}% dos vencimentos concentrados em {metrics.concentrationInstitution}.
                  Considere diversificar as fontes de financiamento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}