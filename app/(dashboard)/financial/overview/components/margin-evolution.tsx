'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MultiLineChart } from '@/components/charts/multi-line-chart'
import { MarginData } from '@/types/financial'

interface MarginEvolutionProps {
  data: MarginData[]
  className?: string
}

export function MarginEvolution({
  data,
  className
}: MarginEvolutionProps) {
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    grossMargin: true,
    operationalMargin: true,
    ebitdaMargin: true,
    netMargin: true
  })

  const lines = [
    {
      dataKey: 'grossMargin',
      name: 'Margem Bruta',
      color: '#3b82f6',
      strokeWidth: 3,
      show: visibleLines.grossMargin
    },
    {
      dataKey: 'operationalMargin',
      name: 'Margem Operacional',
      color: '#10b981',
      strokeWidth: 3,
      show: visibleLines.operationalMargin
    },
    {
      dataKey: 'ebitdaMargin',
      name: 'Margem EBITDA',
      color: '#8b5cf6',
      strokeWidth: 3,
      show: visibleLines.ebitdaMargin
    },
    {
      dataKey: 'netMargin',
      name: 'Margem Líquida',
      color: '#f59e0b',
      strokeWidth: 3,
      show: visibleLines.netMargin
    }
  ]

  // Calculate latest values for summary
  const latestData = data[data.length - 1]
  const previousData = data[data.length - 2]

  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100
  }

  const toggleLineVisibility = (dataKey: string) => {
    setVisibleLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }))
  }

  const getTrendIcon = (change: number) => {
    if (change > 0.5) return <TrendingUp className="h-3 w-3 text-emerald-600" />
    if (change < -0.5) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-600" />
  }

  const getBenchmarkComparison = (current: number, benchmark: number | undefined) => {
    if (!benchmark) return null
    const diff = current - benchmark
    return {
      diff: Math.abs(diff),
      status: diff > 2 ? 'above' : diff < -2 ? 'below' : 'within',
      color: diff > 2 ? 'text-emerald-600' : diff < -2 ? 'text-red-600' : 'text-yellow-600'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
            <div>
              <h3 className="text-xl font-bold">Evolução de Margens</h3>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Análise de performance e tendências ao longo do tempo
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Período
            </div>
            <div className="text-sm font-semibold text-purple-600">
              Últimos 5 anos
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Interactive Legend */}
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border-l-4 border-l-purple-200">
          <div className="text-xs font-medium text-muted-foreground mb-2 w-full">
            💡 Clique nas legendas para ocultar/exibir linhas
          </div>
          {lines.map(line => (
            <Button
              key={line.dataKey}
              variant={line.show ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleLineVisibility(line.dataKey)}
            >
              <div 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: line.show ? line.color : '#d1d5db' }}
              />
              {line.name}
              {line.show ? <Eye className="ml-1 h-3 w-3" /> : <EyeOff className="ml-1 h-3 w-3" />}
            </Button>
          ))}
        </div>

        <MultiLineChart
          data={data.map(item => ({
            period: item.period,
            grossMargin: item.grossMargin,
            operationalMargin: item.operationalMargin,
            ebitdaMargin: item.ebitdaMargin,
            netMargin: item.netMargin,
            sectorBenchmark: item.sectorBenchmark
          }))}
          lines={lines}
          height={400}
          showGrid={true}
          showLegend={false}
          showBenchmark={true}
          benchmarkKey="sectorBenchmark"
          xAxisKey="period"
        />
        
        {/* Performance Cards */}
        {latestData && previousData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lines.map(line => {
              const current = latestData[line.dataKey as keyof MarginData] as number
              const previous = previousData[line.dataKey as keyof MarginData] as number
              const change = calculateChange(current, previous)
              
              // Get benchmark comparison
              const benchmarkData = latestData.sectorBenchmark
              const benchmarkValue = benchmarkData?.[line.dataKey as keyof typeof benchmarkData] as number | undefined
              const benchmarkComp = getBenchmarkComparison(current, benchmarkValue)
              
              return (
                <Card key={line.dataKey} className="relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-1 h-full" 
                    style={{ backgroundColor: line.color }}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: line.color }}
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {line.name}
                        </span>
                      </div>
                      {getTrendIcon(change)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-2xl font-bold tabular-nums">
                        {current.toFixed(1)}%
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge 
                          variant={change >= 0 ? "default" : "destructive"}
                          className="text-xs px-1.5 py-0.5"
                        >
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}pp
                        </Badge>
                        <span className="text-muted-foreground">vs anterior</span>
                      </div>
                      
                      {benchmarkComp && (
                        <div className="text-xs mt-2 pt-2 border-t">
                          <span className="text-muted-foreground">vs setor: </span>
                          <span className={benchmarkComp.color}>
                            {benchmarkComp.status === 'above' ? '+' : benchmarkComp.status === 'below' ? '-' : '≈'}
                            {benchmarkComp.diff.toFixed(1)}pp
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-3 pt-4">
        <Separator />
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Insights da Análise</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Melhor Performance:</span>
              <span className="ml-1">
                {lines.reduce((best, line) => {
                  const current = latestData?.[line.dataKey as keyof MarginData] as number
                  const bestValue = latestData?.[best.dataKey as keyof MarginData] as number
                  return current > bestValue ? line : best
                }).name}
              </span>
            </div>
            <div>
              <span className="font-medium">Maior Crescimento:</span>
              <span className="ml-1">
                {lines.reduce((best, line) => {
                  const current = latestData?.[line.dataKey as keyof MarginData] as number
                  const previous = previousData?.[line.dataKey as keyof MarginData] as number
                  const change = current && previous ? calculateChange(current, previous) : 0
                  
                  const bestCurrent = latestData?.[best.dataKey as keyof MarginData] as number
                  const bestPrevious = previousData?.[best.dataKey as keyof MarginData] as number
                  const bestChange = bestCurrent && bestPrevious ? calculateChange(bestCurrent, bestPrevious) : 0
                  
                  return change > bestChange ? line : best
                }).name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 bg-muted-foreground/50" style={{ backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, currentColor 2px, currentColor 4px)' }} />
              <span>Benchmark Setor</span>
            </div>
            <span>•</span>
            <span>pp = pontos percentuais</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}