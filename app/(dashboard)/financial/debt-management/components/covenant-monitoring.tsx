'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CovenantStatus } from '@/types/debt-management'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts'
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CovenantMonitoringProps {
  covenants: CovenantStatus
}

export function CovenantMonitoring({ covenants }: CovenantMonitoringProps) {
  const getStatusIcon = (status: 'compliant' | 'warning' | 'breach') => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'breach':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusBadge = (status: 'compliant' | 'warning' | 'breach') => {
    const variants = {
      compliant: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      breach: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      compliant: 'Conforme',
      warning: 'Alerta',
      breach: 'Quebra'
    }
    
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getOverallStatus = (): 'compliant' | 'warning' | 'breach' => {
    const statuses = [covenants.dscr.status, covenants.debtToEbitda.status, covenants.currentRatio.status]
    
    if (statuses.some(s => s === 'breach')) return 'breach'
    if (statuses.some(s => s === 'warning')) return 'warning'
    if (statuses.some(s => s === 'unknown')) return 'warning'
    return 'compliant'
  }

  const calculateProgress = (current: number, required: number, isMin: boolean = true) => {
    if (isMin) {
      return Math.min(100, (current / required) * 100)
    } else {
      return Math.min(100, Math.max(0, 100 - ((current / required) * 100)))
    }
  }

  const covenantMetrics = [
    {
      id: 'dscr',
      label: 'DSCR (Debt Service Coverage Ratio)',
      ...covenants.dscr,
      isMin: true,
      description: 'Capacidade de pagamento do serviço da dívida'
    },
    {
      id: 'debt-ebitda',
      label: 'Dívida/EBITDA',
      ...covenants.debtToEbitda,
      isMin: false,
      description: 'Endividamento em relação ao EBITDA'
    },
    {
      id: 'liquidity',
      label: 'Índice de Liquidez',
      ...covenants.currentRatio,
      isMin: true,
      description: 'Capacidade de honrar obrigações de curto prazo'
    }
  ]

  const generateTrendData = (trend: number[], forecast: number[]) => {
    const data: Array<{ period: string; value: number; type: string }> = []
    
    // Historical data
    trend.forEach((value, index) => {
      data.push({
        period: `T-${trend.length - index}`,
        value: value,
        type: 'historical'
      })
    })
    
    // Forecast data
    forecast.forEach((value, index) => {
      data.push({
        period: `T+${index + 1}`,
        value: value,
        type: 'forecast'
      })
    })
    
    return data
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitoramento de Covenants
          </CardTitle>
          {getStatusBadge(getOverallStatus())}
        </div>
        <Button variant="ghost" size="sm">
          <TrendingUp className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Covenant metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {covenantMetrics.map((metric) => (
            <div key={metric.id} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{metric.description}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
                {getStatusIcon(metric.status === 'good' ? 'compliant' : metric.status === 'unknown' ? 'warning' : metric.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Atual: <strong>{metric.current?.toFixed(2) || 'N/A'}x</strong></span>
                  <span>Mínimo: <strong>{metric.required.toFixed(2)}x</strong></span>
                </div>
                
                <Progress 
                  value={calculateProgress(metric.current || 0, metric.required, metric.isMin)} 
                  className={cn(
                    "h-2",
                    metric.status === 'compliant' && "text-green-600",
                    metric.status === 'warning' && "text-yellow-600",
                    metric.status === 'breach' && "text-red-600"
                  )}
                />
              </div>
              
              {/* Mini trend chart */}
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateTrendData([], [])}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={
                        metric.status === 'compliant' ? '#16a34a' :
                        metric.status === 'warning' ? '#ca8a04' : '#dc2626'
                      }
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="0"
                    />
                    <ReferenceLine 
                      y={metric.required} 
                      stroke="#94a3b8" 
                      strokeDasharray="3 3"
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(2), 'Valor']}
                      labelFormatter={(label) => `Período: ${label}`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Covenant trend analysis */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Análise de Tendência - DSCR</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateTrendData([], [])}>
                <defs>
                  <linearGradient id="dscrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(2) + 'x', 'DSCR']}
                />
                <ReferenceLine 
                  y={covenants.dscr.required} 
                  stroke="#dc2626" 
                  strokeDasharray="5 5"
                  label={{ value: "Mínimo", position: "top" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  fillOpacity={1}
                  fill="url(#dscrGradient)"
                  strokeDasharray="0"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts and recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Alertas e Recomendações</h4>
          
          {getOverallStatus() === 'compliant' && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Todos os covenants estão em conformidade</p>
                <p className="text-green-700">Continue monitorando as tendências para manter a saúde financeira.</p>
              </div>
            </div>
          )}
          
          {covenants.dscr.current !== null && covenants.dscr.current < covenants.dscr.required * 1.1 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">DSCR próximo do limite mínimo</p>
                <p className="text-yellow-700">Considere renegociar prazos ou buscar fontes adicionais de receita.</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Próxima medição</p>
              <p className="text-blue-700">Os covenants serão reavaliados em 30 dias com base nos demonstrativos trimestrais.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}