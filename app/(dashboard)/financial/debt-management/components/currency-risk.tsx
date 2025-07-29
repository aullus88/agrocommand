'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/utils/debt-calculations'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  Shield, 
  Info,
  Target
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Updated interface to match real data structure
interface CurrencyRiskProps {
  currencyRisk: {
    totalExposure?: number
    usdAmount?: number
    eurAmount?: number
    currentRate?: { usd: number; eur: number }
    var30Days?: number
    hedgeRatio?: number
    sensitivity?: Array<{
      scenario: string
      impact: number
      probability: number
    }>
    hasRealRates?: boolean
    rateDataWarning?: string
    // Legacy props from CurrencyRiskData interface
    usdExposure?: number
    hedgedAmount?: number
    openExposure?: number
    var95?: number
    var99?: number
    sensitivityAnalysis?: Array<{
      exchangeRate: number
      impact: number
      probability: number
    }>
    hedgeOperations?: Array<{
      id: string
      type: string
      notional: number
      rate: number
      maturity: Date
      mtm: number
      effectiveness: number
    }>
  }
}

export function CurrencyRisk({ currencyRisk }: CurrencyRiskProps) {
  // Handle both real data and mock data structures
  const usdExposure = currencyRisk.usdAmount || currencyRisk.usdExposure || 0
  const hedgedAmount = currencyRisk.hedgedAmount || 0
  const hedgeRatio = currencyRisk.hedgeRatio || 0
  const openExposure = currencyRisk.openExposure || (usdExposure - hedgedAmount)
  const var95 = currencyRisk.var95 || currencyRisk.var30Days || 0
  
  // Exposure data for pie chart
  const exposureData = [
    {
      name: 'Coberto (Hedge)',
      value: hedgedAmount,
      color: '#16a34a'
    },
    {
      name: 'Exposição Aberta',
      value: openExposure,
      color: '#dc2626'
    }
  ]

  // Handle sensitivity analysis data for bar chart
  const sensitivityAnalysisData = currencyRisk.sensitivityAnalysis || []
  const sensitivityRealData = currencyRisk.sensitivity || []
  
  // Use mock data format if available, otherwise convert real data format
  const sensitivityData = sensitivityAnalysisData.length > 0 
    ? sensitivityAnalysisData.map(scenario => ({
        rate: scenario.exchangeRate.toFixed(2),
        impact: scenario.impact / 1000000, // Convert to millions
        probability: scenario.probability * 100,
        current: scenario.exchangeRate === 5.42
      }))
    : sensitivityRealData.map((scenario, index) => ({
        rate: (5.0 + index * 0.2).toFixed(2), // Generate exchange rates
        impact: scenario.impact / 1000000,
        probability: scenario.probability * 100,
        current: index === 2 // Mark middle scenario as current
      }))

  const hedgeRatioPercentage = (hedgeRatio * 100).toFixed(1)

  const getHedgeStatusColor = (ratio: number) => {
    if (ratio >= 0.6) return 'text-green-600'
    if (ratio >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { rate: string; impact: number; probability: number; current: boolean } }> }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">USD/BRL {data.rate}</p>
          <p className="text-sm">
            Impacto: {data.impact > 0 ? '+' : ''}{formatCurrency(data.impact * 1000000)}
          </p>
          <p className="text-sm text-muted-foreground">
            Probabilidade: {data.probability.toFixed(1)}%
          </p>
          {data.current && (
            <p className="text-xs text-blue-600 mt-1">Taxa atual</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Risco Cambial
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={getHedgeStatusColor(hedgeRatio)}>
            {hedgeRatioPercentage}% Hedgeado
          </Badge>
          <Button variant="ghost" size="sm">
            <Target className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="exposure" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exposure">Exposição</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensibilidade</TabsTrigger>
            <TabsTrigger value="hedge">Hedge</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exposure" className="space-y-4">
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Exposição Total USD</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total da dívida em USD convertida para BRL</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
                <p className="text-lg font-semibold">{formatCurrency(usdExposure)}</p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">VaR 95%</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Perda máxima esperada em 95% dos cenários</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(var95)}
                </p>
              </div>
            </div>

            {/* Exposure breakdown */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exposureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {exposureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Hedge ratio progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Razão de Hedge</span>
                <span className="font-medium">{hedgeRatioPercentage}%</span>
              </div>
              <Progress 
                value={hedgeRatio * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>Meta: 60%</span>
                <span>100%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sensitivity" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="rate" 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'USD/BRL', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}M`}
                    label={{ value: 'Impacto (R$ milhões)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="impact" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Análise de Sensibilidade</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Ganho cambial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span>Taxa atual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Perda cambial</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hedge" className="space-y-4">
            {/* Hedge operations */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Operações de Hedge Ativas</p>
              {(currencyRisk.hedgeOperations || []).map((operation) => (
                <div key={operation.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{operation.type}</Badge>
                      <span className="text-sm font-medium">
                        {formatCurrency(operation.notional)} USD
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      operation.mtm > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {operation.mtm > 0 ? '+' : ''}{formatCurrency(operation.mtm)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span>Taxa: {operation.rate.toFixed(2)}</span>
                    <span>Vencimento: {operation.maturity.toLocaleDateString('pt-BR')}</span>
                    <span>Efetividade: {formatPercentage(operation.effectiveness * 100)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Hedge summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">MTM Total</span>
                <p className="text-lg font-semibold">
                  {(currencyRisk.hedgeOperations || []).reduce((sum, op) => sum + op.mtm, 0) > 0 ? '+' : ''}
                  {formatCurrency((currencyRisk.hedgeOperations || []).reduce((sum, op) => sum + op.mtm, 0))}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Efetividade Média</span>
                <p className="text-lg font-semibold">
                  {formatPercentage(
                    ((currencyRisk.hedgeOperations || []).reduce((sum, op) => sum + op.effectiveness, 0) / 
                     Math.max((currencyRisk.hedgeOperations || []).length, 1)) * 100
                  )}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Recomendação</p>
                  <p className="text-blue-700">
                    Considere aumentar a cobertura de hedge para 60% da exposição USD para reduzir a volatilidade.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}