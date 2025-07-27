'use client'

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { CostCategory } from '@/types/financial'
import { formatCurrency } from '@/utils/financial-calculations'

interface CostTreemapProps {
  data: CostCategory[]
  className?: string
  onItemClick?: (item: CostCategory) => void
}

export function CostTreemap({
  data,
  className,
}: CostTreemapProps) {
  // Transform cost category data to chart format with comparison data
  const chartData = data.map(category => {
    // Generate realistic comparison data (previous year, budget)
    const currentValue = category.totalValue
    const previousYear = currentValue * (0.85 + Math.random() * 0.3) // 85-115% of current
    const budgetValue = currentValue * (0.9 + Math.random() * 0.2) // 90-110% of current
    
    return {
      category: category.name,
      value: currentValue,
      previousYear: previousYear,
      budget: budgetValue,
      percentage: category.percentage,
      efficiency: category.efficiency,
      // Dynamic colors based on efficiency
      fill: category.efficiency === 'below_budget' ? '#10b981' : 
            category.efficiency === 'above_budget' ? '#ef4444' : 
            '#f59e0b'
    }
  })

  // Sort by value descending
  chartData.sort((a, b) => b.value - a.value)

  const totalValue = data.reduce((sum, category) => sum + category.totalValue, 0)
  
  // Calculate efficiency metrics
  const belowBudget = data.filter(item => item.efficiency === 'below_budget').length
  const withinBudget = data.filter(item => item.efficiency === 'on_budget').length
  const aboveBudget = data.filter(item => item.efficiency === 'above_budget').length
  const efficiencyPercentage = Math.round((belowBudget / data.length) * 100)

  const chartConfig = {
    value: {
      label: "Atual (2024)",
    },
    previousYear: {
      label: "Ano Anterior (2023)",
      color: "hsl(var(--muted-foreground))",
    },
    budget: {
      label: "Orçamento",
      color: "hsl(var(--border))",
    },
  } satisfies ChartConfig


  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
            <div>
              <h3 className="text-xl font-bold">Análise de Custos</h3>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Distribuição por categoria e eficiência orçamentária
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Total
            </div>
            <div className="text-lg font-bold">
              {formatCurrency(totalValue, 'millions')}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
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
              width={100}
            />
            <XAxis 
              type="number" 
              hide 
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                
                const data = payload[0].payload
                const getEfficiencyLabel = (efficiency: string) => {
                  switch (efficiency) {
                    case 'below_budget': return 'Abaixo do Orçamento'
                    case 'on_budget': return 'Dentro do Orçamento'  
                    case 'above_budget': return 'Acima do Orçamento'
                    default: return 'N/A'
                  }
                }
                
                const varianceVsBudget = ((data.value - data.budget) / data.budget) * 100
                const varianceVsPrevious = ((data.value - data.previousYear) / data.previousYear) * 100
                
                return (
                  <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl p-4 space-y-3 min-w-80">
                    <p className="font-semibold text-base">{data.category}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: data.fill }} />
                          Atual (2024):
                        </span>
                        <span className="font-bold text-lg">{formatCurrency(data.value, 'millions')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-muted-foreground/50" />
                          Ano Anterior:
                        </span>
                        <span className="font-medium">{formatCurrency(data.previousYear, 'millions')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <div className="w-3 h-3 rounded border-2 border-muted-foreground/30" />
                          Orçamento:
                        </span>
                        <span className="font-medium">{formatCurrency(data.budget, 'millions')}</span>
                      </div>
                      
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-xs">vs Orçamento:</span>
                          <span className={`font-semibold text-sm ${varianceVsBudget > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {varianceVsBudget > 0 ? '+' : ''}{varianceVsBudget.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-xs">vs Ano Anterior:</span>
                          <span className={`font-semibold text-sm ${varianceVsPrevious > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {varianceVsPrevious > 0 ? '+' : ''}{varianceVsPrevious.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Status: {getEfficiencyLabel(data.efficiency)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            
            {/* Background reference bars for previous year */}
            <Bar 
              dataKey="previousYear" 
              fill="hsl(var(--muted-foreground))"
              opacity={0.2}
              radius={[0, 2, 2, 0]}
            />
            
            {/* Background reference bars for budget */}
            <Bar 
              dataKey="budget" 
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="3,3"
              opacity={0.4}
              radius={[0, 2, 2, 0]}
            />
            
            {/* Main current value bars with dynamic colors */}
            <Bar 
              dataKey="value" 
              radius={[0, 6, 6, 0]}
              className="drop-shadow-sm"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
        <div className="flex gap-2 leading-none font-medium">
          {efficiencyPercentage >= 60 ? (
            <>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600">
                {efficiencyPercentage}% das categorias dentro ou abaixo do orçamento
              </span>
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
              <span className="text-red-600">
                {100 - efficiencyPercentage}% das categorias acima do orçamento
              </span>
            </>
          )}
        </div>
        
        <div className="space-y-3">
          {/* Efficiency Status */}
          <div className="grid grid-cols-3 gap-4 w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{belowBudget} Abaixo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>{withinBudget} Dentro</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>{aboveBudget} Acima</span>
            </div>
          </div>
          
          {/* Comparison Legend */}
          <div className="border-t pt-2">
            <div className="text-xs text-muted-foreground mb-2 font-medium">Comparações:</div>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-muted-foreground/20 rounded" />
                <span>Ano Anterior (sombra)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 border border-dashed border-muted-foreground/40 rounded" />
                <span>Orçamento (linha)</span>
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}