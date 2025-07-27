'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GaugeIndicator, LinearGauge } from '@/components/charts/gauge-indicator'
import { TrendIndicator } from '@/components/charts/trend-indicator'
import { Badge } from '@/components/ui/badge'
import { FinancialIndicator } from '@/types/financial'
import { formatCurrency, formatPercentage, formatRatio } from '@/utils/financial-calculations'
import { cn } from '@/lib/utils'

interface IndicatorsDashboardProps {
  indicators: FinancialIndicator[]
  className?: string
}

export function IndicatorsDashboard({
  indicators,
  className
}: IndicatorsDashboardProps) {
  const formatIndicatorValue = (indicator: FinancialIndicator): string => {
    switch (indicator.unit) {
      case 'currency':
        return formatCurrency(indicator.value, 'millions')
      case 'percentage':
        return formatPercentage(indicator.value)
      case 'ratio':
        return formatRatio(indicator.value)
      case 'days':
        return `${indicator.value.toFixed(0)} dias`
      default:
        return indicator.value.toLocaleString('pt-BR')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'good':
        return 'text-blue-600 dark:text-blue-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const IndicatorCard = ({ indicator }: { indicator: FinancialIndicator }) => {
    const showGauge = ['current_liquidity', 'debt_to_equity'].includes(indicator.id)
    const showLinearGauge = ['break_even'].includes(indicator.id)
    
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {indicator.name}
            </CardTitle>
            <Badge className={cn('text-xs', getStatusBadgeVariant(indicator.status))}>
              {indicator.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Main Value */}
          <div className="flex items-baseline justify-between">
            <span className={cn(
              'text-2xl font-bold tabular-nums',
              getStatusColor(indicator.status)
            )}>
              {formatIndicatorValue(indicator)}
            </span>
            <TrendIndicator
              trend={indicator.trend}
              value={0} // We don't have trend values in the mock data
              size="sm"
              showValue={false}
            />
          </div>

          {/* Target/Benchmark */}
          {(indicator.target || indicator.benchmark) && (
            <div className="text-sm text-muted-foreground">
              {indicator.target && (
                <div>Meta: {formatIndicatorValue({ ...indicator, value: indicator.target })}</div>
              )}
              {indicator.benchmark && (
                <div>Benchmark: {formatIndicatorValue({ ...indicator, value: indicator.benchmark })}</div>
              )}
            </div>
          )}

          {/* Visual Indicators */}
          {showGauge && indicator.target && (
            <div className="flex justify-center">
              <GaugeIndicator
                value={indicator.value}
                target={indicator.target}
                max={indicator.target * 2}
                size="sm"
                showValue={false}
              />
            </div>
          )}

          {showLinearGauge && (
            <LinearGauge
              value={indicator.value}
              min={0}
              max={70}
              target={50}
              height={6}
              showValue={false}
            />
          )}

          {/* Special cases */}
          {indicator.id === 'working_capital' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Dias de caixa: 87 dias</div>
              <div>Necessidade 90 dias: R$ 125M</div>
            </div>
          )}

          {indicator.id === 'financial_cycle' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Redução YoY: -12 dias</div>
              <div>Benchmark setor: 165 dias</div>
            </div>
          )}

          {indicator.id === 'break_even' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Margem segurança: 28%</div>
              <div>Produtividade atual: 60 sc/ha</div>
            </div>
          )}

          {/* Description */}
          <div className="text-xs text-muted-foreground">
            {indicator.description}
          </div>

          {/* Calculation */}
          {indicator.calculation && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              <span className="font-medium">Cálculo:</span> {indicator.calculation}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Dashboard de Indicadores Financeiros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicators.map((indicator) => (
            <IndicatorCard key={indicator.id} indicator={indicator} />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-3">Resumo de Saúde Financeira</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Indicadores Excelentes</span>
              <span className="font-medium text-lg text-emerald-600">
                {indicators.filter(i => i.status === 'excellent').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Indicadores Bons</span>
              <span className="font-medium text-lg text-blue-600">
                {indicators.filter(i => i.status === 'good').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Indicadores Atenção</span>
              <span className="font-medium text-lg text-yellow-600">
                {indicators.filter(i => i.status === 'warning').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Indicadores Críticos</span>
              <span className="font-medium text-lg text-red-600">
                {indicators.filter(i => i.status === 'critical').length}
              </span>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-muted-foreground">
            💡 Todos os indicadores estão dentro dos parâmetros aceitáveis para uma operação de grande escala.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}