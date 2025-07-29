import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Wallet, Calendar, Target, AlertTriangle } from 'lucide-react'
import { CashFlowOverview } from '@/types/cash-flow'
import { formatCurrency } from '@/utils/debt-calculations'

interface CashFlowKPIsProps {
  overview: CashFlowOverview
}

export function CashFlowKPIs({ overview }: CashFlowKPIsProps) {
  const formatDaysBadgeColor = (days: number, target: number) => {
    if (days >= target) return 'default'
    if (days >= target * 0.8) return 'secondary'
    return 'destructive'
  }

  const formatVariationColor = (variation: number) => {
    return variation >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const formatBalanceStatus = (current: number, projected: number) => {
    const trend = projected >= current ? 'up' : 'down'
    const color = projected >= current ? 'text-green-600' : 'text-yellow-600'
    return { trend, color }
  }

  const gapAmount = overview.workingCapitalNeed - (overview.currentBalance + overview.receivablesTotal * 0.7) // Assume 70% collection rate
  const balanceStatus = formatBalanceStatus(overview.currentBalance, overview.projectedBalance30d)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* Current Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.currentBalance)}
          </div>
          <div className={`flex items-center text-xs ${formatVariationColor(overview.dailyVariation)}`}>
            {overview.dailyVariation >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {formatCurrency(Math.abs(overview.dailyVariation))} hoje
          </div>
        </CardContent>
      </Card>

      {/* 30-day Projection */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projeção 30d</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.projectedBalance30d)}
          </div>
          <div className={`flex items-center text-xs ${balanceStatus.color}`}>
            {balanceStatus.trend === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <Badge variant={overview.projectedBalance30d > 0 ? 'default' : 'destructive'}>
              {overview.projectedBalance30d > 0 ? 'Adequado' : 'Atenção'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cash Days */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dias de Caixa</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.cashDays} dias</div>
          <div className="flex items-center text-xs">
            <Badge variant={formatDaysBadgeColor(overview.cashDays, 60)}>
              Meta: &gt;60 dias
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Working Capital Need */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capital Giro 90d</CardTitle>
          {gapAmount < 0 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.workingCapitalNeed)}
          </div>
          <div className="text-xs text-muted-foreground">
            Gap: <span className={gapAmount < 0 ? 'text-red-600' : 'text-green-600'}>
              {formatCurrency(Math.abs(gapAmount))}
            </span>
          </div>
          <div className="mt-1">
            <Badge variant={gapAmount < 0 ? 'destructive' : 'default'}>
              {gapAmount < 0 ? 'Déficit' : 'Coberto'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Receivables - MOCK DATA WARNING */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recebíveis</CardTitle>
          <div className="flex items-center">
            <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
            <span className="text-xs text-amber-600">Mock</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.receivablesTotal)}
          </div>
          <div className="text-xs text-muted-foreground">
            Prazo médio: 22 dias
          </div>
        </CardContent>
      </Card>

      {/* Payables - REAL DATA INDICATOR */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagáveis</CardTitle>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
            <span className="text-xs text-green-600">Real</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.payablesTotal)}
          </div>
          <div className="text-xs text-muted-foreground">
            Vencendo 7d: {formatCurrency(overview.payablesTotal * 0.1)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}