'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Target } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { CostPerHectareData } from '@/types/financial'

interface CostPerHectareProps {
  data: CostPerHectareData[]
  className?: string
}

export function CostPerHectare({
  data,
  className
}: CostPerHectareProps) {
  const [showComparisons, setShowComparisons] = useState(true)

  // Sort data by current value (descending)
  const sortedData = [...data].sort((a, b) => b.current - a.current)

  // Calculate totals
  const totals = {
    current: data.reduce((sum, item) => sum + item.current, 0),
    budget: data.reduce((sum, item) => sum + item.budget, 0),
    previousYear: data.reduce((sum, item) => sum + item.previousYear, 0)
  }

  const budgetVariance = ((totals.current - totals.budget) / totals.budget) * 100
  const yearVariance = ((totals.current - totals.previousYear) / totals.previousYear) * 100

  const chartConfig = {
    current: {
      label: "Atual (2024)",
      color: "hsl(var(--chart-1))",
    },
    budget: {
      label: "Orçamento",
      color: "hsl(var(--muted-foreground))",
    },
    previousYear: {
      label: "Ano Anterior",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ payload: CostPerHectareData }>
    label?: string
  }) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0]?.payload
    if (!data) return null

    const budgetDiff = ((data.current - data.budget) / data.budget) * 100
    const yearDiff = ((data.current - data.previousYear) / data.previousYear) * 100

    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl p-4 space-y-3 min-w-80">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-base">{label}</p>
          <Badge 
            variant={data.efficiency > 5 ? "destructive" : data.efficiency < -5 ? "default" : "secondary"}
            className="text-xs"
          >
            {data.trend === 'worsening' ? '📈' : data.trend === 'improving' ? '📉' : '➡️'} {data.efficiency > 0 ? '+' : ''}{data.efficiency.toFixed(1)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500" />
              Atual:
            </span>
            <span className="font-bold text-lg">R$ {data.current.toLocaleString('pt-BR')}/ha</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted-foreground/50" />
              Orçamento:
            </span>
            <span className="font-medium">R$ {data.budget.toLocaleString('pt-BR')}/ha</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              Ano Anterior:
            </span>
            <span className="font-medium">R$ {data.previousYear.toLocaleString('pt-BR')}/ha</span>
          </div>
          
          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">vs Orçamento:</span>
              <span className={`font-semibold text-sm ${budgetDiff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {budgetDiff > 0 ? '+' : ''}{budgetDiff.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">vs Ano Anterior:</span>
              <span className={`font-semibold text-sm ${yearDiff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {yearDiff > 0 ? '+' : ''}{yearDiff.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
            <div>
              <h3 className="text-xl font-bold">Análise de Custos por Hectare</h3>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Comparativo detalhado de custos por categoria
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Total/ha
            </div>
            <div className="text-lg font-bold">
              R$ {totals.current.toLocaleString('pt-BR')}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart Controls */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-l-4 border-l-green-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>Comparações ativas: Atual, Orçamento, Ano Anterior</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparisons(!showComparisons)}
            className="h-7 text-xs"
          >
            {showComparisons ? 'Ocultar' : 'Mostrar'} Comparações
          </Button>
        </div>

        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={sortedData}
            layout="vertical"
            margin={{
              left: 0,
              right: 20,
            }}
          >
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs"
              width={120}
            />
            <XAxis 
              type="number" 
              hide 
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltip />}
            />
            
            {/* Background bars for previous year */}
            {showComparisons && (
              <Bar 
                dataKey="previousYear" 
                fill="hsl(var(--muted-foreground))"
                opacity={0.2}
                radius={[0, 2, 2, 0]}
              />
            )}
            
            {/* Background bars for budget */}
            {showComparisons && (
              <Bar 
                dataKey="budget" 
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="3,3"
                opacity={0.4}
                radius={[0, 2, 2, 0]}
              />
            )}
            
            {/* Main current value bars */}
            <Bar 
              dataKey="current" 
              fill="hsl(var(--chart-1))"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Budget Performance */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">vs Orçamento</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tabular-nums">
                  {budgetVariance > 0 ? '+' : ''}{budgetVariance.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  R$ {Math.abs(totals.current - totals.budget).toLocaleString('pt-BR')}/ha
                </div>
                <Badge 
                  variant={budgetVariance > 0 ? "destructive" : "default"}
                  className="text-xs"
                >
                  {budgetVariance > 0 ? 'Acima' : 'Abaixo'} do planejado
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Year-over-Year */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {yearVariance > 0 ? 
                  <TrendingUp className="h-4 w-4 text-red-500" /> : 
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                }
                <span className="text-sm font-medium text-muted-foreground">vs Ano Anterior</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tabular-nums">
                  {yearVariance > 0 ? '+' : ''}{yearVariance.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  R$ {Math.abs(totals.current - totals.previousYear).toLocaleString('pt-BR')}/ha
                </div>
                <Badge 
                  variant={yearVariance > 0 ? "destructive" : "default"}
                  className="text-xs"
                >
                  {yearVariance > 0 ? 'Aumento' : 'Redução'} de custos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Average Cost */}
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">Custo Médio</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tabular-nums">
                  R$ {(totals.current / data.length).toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-muted-foreground">
                  por categoria/hectare
                </div>
                <Badge variant="secondary" className="text-xs">
                  {data.length} categorias
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-3 pt-4">
        <Separator />
        <div className="w-full space-y-3">
          {/* Key Insights */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>Principais Insights</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {(() => {
                const highestCost = data.reduce((max, item) => 
                  item.current > max.current ? item : max
                )
                const mostEfficient = data.reduce((min, item) => 
                  item.efficiency < min.efficiency ? item : min
                )
                const mostOverBudget = data.reduce((max, item) => 
                  item.efficiency > max.efficiency ? item : max
                )
                
                return (
                  <>
                    <div>
                      <span className="text-muted-foreground">Maior custo:</span>
                      <div className="font-medium">{highestCost.category}</div>
                      <div className="text-xs text-muted-foreground">
                        R$ {highestCost.current.toLocaleString('pt-BR')}/ha
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mais eficiente:</span>
                      <div className="font-medium text-emerald-600">{mostEfficient.category}</div>
                      <div className="text-xs text-muted-foreground">
                        {mostEfficient.efficiency.toFixed(1)}% vs orçamento
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mais acima orçamento:</span>
                      <div className="font-medium text-red-600">{mostOverBudget.category}</div>
                      <div className="text-xs text-muted-foreground">
                        +{mostOverBudget.efficiency.toFixed(1)}%
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 bg-blue-500 rounded" />
              <span>Atual (2024)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 bg-muted-foreground/20 rounded" />
              <span>Orçamento (sombra)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 bg-emerald-500/30 rounded" />
              <span>Ano Anterior (sombra)</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}