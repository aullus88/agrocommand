import { DebtOverview } from '@/types/debt-management'
import { KPICard } from '@/components/financial/kpi-card'
import { FinancialKPI } from '@/types/financial'

interface DebtOverviewCardsProps {
  overview: DebtOverview
}

export function DebtOverviewCards({ overview }: DebtOverviewCardsProps) {
  const kpis: FinancialKPI[] = [
    {
      id: 'total-debt',
      title: 'Dívida Total',
      value: overview.totalDebt,
      unit: 'currency',
      format: 'millions',
      trend: 'up',
      trendValue: 2.3,
      trendLabel: 'vs período anterior',
      status: 'warning',
      sparklineData: [275000000, 280000000, 282000000, 285000000, 287500000],
      description: 'Total de dívidas da operação'
    },
    {
      id: 'usd-exposure',
      title: 'Exposição USD',
      value: overview.usdExposurePercent,
      unit: 'percentage',
      format: 'decimal',
      trend: 'down',
      trendValue: -1.5,
      trendLabel: 'vs período anterior',
      status: 'warning',
      target: 40,
      sparklineData: [45, 44, 43, 42.5, 42],
      description: 'Percentual da dívida exposta ao dólar'
    },
    {
      id: 'avg-rate',
      title: 'Taxa Média',
      value: overview.avgWeightedRate,
      unit: 'percentage',
      format: 'decimal',
      trend: 'up',
      trendValue: 0.3,
      trendLabel: 'pontos base',
      status: 'warning',
      sparklineData: [9.2, 9.3, 9.5, 9.6, 9.7],
      description: 'Taxa média ponderada do portfólio'
    },
    {
      id: 'dscr',
      title: 'DSCR',
      value: overview.dscr,
      unit: 'ratio',
      format: 'decimal',
      trend: 'down',
      trendValue: -0.05,
      trendLabel: 'vs trimestre anterior',
      status: 'good',
      target: 1.25,
      sparklineData: [1.55, 1.52, 1.50, 1.49, 1.48],
      description: 'Cobertura do serviço da dívida'
    },
    {
      id: 'debt-ebitda',
      title: 'Dívida/EBITDA',
      value: overview.debtToEbitda,
      unit: 'ratio',
      format: 'decimal',
      trend: 'up',
      trendValue: 0.08,
      trendLabel: 'vs período anterior',
      status: 'good',
      target: 2.5,
      sparklineData: [1.85, 1.90, 1.95, 1.98, 2.02],
      description: 'Endividamento sobre EBITDA'
    },
    {
      id: 'next-payment',
      title: 'Próximo Pgto',
      value: overview.nextPayment.amount,
      unit: 'currency',
      format: 'millions',
      trend: 'stable',
      trendValue: overview.nextPayment.daysUntil,
      trendLabel: `em ${overview.nextPayment.daysUntil} dias`,
      status: overview.nextPayment.daysUntil <= 7 ? 'critical' : 'warning',
      description: 'Próximo pagamento programado'
    }
  ]

  const handleDrillDown = (kpiId: string) => {
    console.log('Drill down for KPI:', kpiId)
  }

  const handleCreateAlert = (kpiId: string) => {
    console.log('Create alert for KPI:', kpiId)
  }

  const handleShare = (kpiId: string) => {
    console.log('Share KPI:', kpiId)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          kpi={kpi}
          variant="compact"
          onDrillDown={handleDrillDown}
          onCreateAlert={handleCreateAlert}
          onShare={handleShare}
        />
      ))}
    </div>
  )
}