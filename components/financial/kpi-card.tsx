'use client'


import { MoreHorizontal, TrendingUp, Target, Info } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SparklineChart } from '@/components/charts/sparkline-chart'
// import { GaugeIndicator } from '@/components/charts/gauge-indicator'
import { TrendIndicator } from '@/components/charts/trend-indicator'
import { FinancialKPI } from '@/types/financial'
import { formatCurrency, formatPercentage, formatRatio } from '@/utils/financial-calculations'
import { cn } from '@/lib/utils'

interface KPICardProps {
  kpi: FinancialKPI
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  onDrillDown?: (kpiId: string) => void
  onCreateAlert?: (kpiId: string) => void
  onShare?: (kpiId: string) => void
}

export function KPICard({
  kpi,
  className,
  variant = 'default',
  onDrillDown,
  onCreateAlert,
  onShare
}: KPICardProps) {
  

  const formatValue = (value: number): string => {
    switch (kpi.unit) {
      case 'currency':
        return formatCurrency(value, kpi.format as 'millions' | 'thousands' | 'decimal' | undefined)
      case 'percentage':
        return formatPercentage(value, kpi.format === 'decimal' ? 1 : 0)
      case 'ratio':
        return formatRatio(value)
      case 'days':
        return `${value.toFixed(0)} dias`
      default:
        return value.toLocaleString('pt-BR')
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

  if (variant === 'compact') {
    return (
      <Card className={cn('h-full', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{kpi.title}</h3>
            <Badge className={cn('text-xs', getStatusBadgeVariant(kpi.status))}>
              {kpi.status}
            </Badge>
          </div>
          
          <div className="flex items-baseline justify-between">
            <span className={cn('text-2xl font-bold tabular-nums', getStatusColor(kpi.status))}>
              {formatValue(kpi.value)}
            </span>
            <TrendIndicator
              trend={kpi.trend}
              value={kpi.trendValue}
              size="sm"
            />
          </div>
          
          {kpi.sparklineData && (
            <div className="mt-2">
              <SparklineChart
                data={kpi.sparklineData}
                height={20}
                color={kpi.status === 'excellent' ? '#10b981' : kpi.status === 'critical' ? '#ef4444' : '#3b82f6'}
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('h-full transition-all duration-200 hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {kpi.title}
          </h3>
          {kpi.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={14} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{kpi.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onDrillDown && (
              <DropdownMenuItem onClick={() => onDrillDown(kpi.id)}>
                <TrendingUp size={14} className="mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
            )}
            {onCreateAlert && (
              <DropdownMenuItem onClick={() => onCreateAlert(kpi.id)}>
                <Target size={14} className="mr-2" />
                Criar Alerta
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={() => onShare(kpi.id)}>
                Compartilhar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="space-y-4">
          {/* Main Value and Trend */}
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className={cn(
                'text-3xl font-bold tabular-nums leading-none',
                getStatusColor(kpi.status)
              )}>
                {formatValue(kpi.value)}
              </span>
              {kpi.target && (
                <span className="text-sm text-muted-foreground mt-1">
                  Meta: {formatValue(kpi.target)}
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-1">
              <TrendIndicator
                trend={kpi.trend}
                value={kpi.trendValue}
                label={kpi.trendLabel}
                size="sm"
              />
              <Badge className={cn('text-xs', getStatusBadgeVariant(kpi.status))}>
                {kpi.status}
              </Badge>
            </div>
          </div>

          {/* Target Progress */}
          {kpi.target && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso da Meta</span>
                <span className="font-medium">
                  {Math.round((kpi.value / kpi.target) * 100)}%
                </span>
              </div>
              <Progress 
                value={(kpi.value / kpi.target) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Gauge for specific KPIs */}
          {/* {(kpi.id === 'ebitda' || kpi.id === 'roe') && kpi.target && (
            <div className="flex justify-center">
              <GaugeIndicator
                value={kpi.value}
                max={kpi.target * 1.5}
                target={kpi.target}
                size="md"
                showValue={false}
              />
            </div>
          )} */}

          {/* Sparkline Chart */}
          {kpi.sparklineData && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Evolução (últimos 10 períodos)</span>
              </div>
              <SparklineChart
                data={kpi.sparklineData}
                height={40}
                color={
                  kpi.status === 'excellent' ? '#10b981' : 
                  kpi.status === 'critical' ? '#ef4444' : 
                  '#3b82f6'
                }
                showDots={true}
              />
            </div>
          )}

          {/* Breakdown */}
          {kpi.breakdown && kpi.breakdown.length > 0 && (
            <div className="space-y-2">
            
              
              {true && (
                <div className="space-y-2 pt-2 border-t">
                  {kpi.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        {item.color && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        )}
                        <span className="text-muted-foreground">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium tabular-nums">
                          {kpi.unit === 'currency' ? formatCurrency(item.value, kpi.format as 'millions' | 'thousands' | 'decimal' | undefined) : 
                           kpi.unit === 'percentage' ? formatPercentage(item.value) :
                           item.value.toLocaleString('pt-BR')}
                        </span>
                        {item.percentage !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            ({item.percentage.toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface KPIGridProps {
  kpis: FinancialKPI[]
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  onDrillDown?: (kpiId: string) => void
  onCreateAlert?: (kpiId: string) => void
  onShare?: (kpiId: string) => void
}

export function KPIGrid({
  kpis,
  className,
  variant = 'default',
  onDrillDown,
  onCreateAlert,
  onShare
}: KPIGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      variant === 'compact' 
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
      className
    )}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          kpi={kpi}
          variant={variant}
          onDrillDown={onDrillDown}
          onCreateAlert={onCreateAlert}
          onShare={onShare}
        />
      ))}
    </div>
  )
}