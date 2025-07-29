'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { formatCurrency } from '@/utils/debt-calculations'

interface BenchmarkingTableProps {
  metrics: {
    debtPerHectare: number
    usdExposure: number
    avgRate: number
    avgMaturity: number
    topThreeConcentration: number
  }
}

export function BenchmarkingTable({ metrics }: BenchmarkingTableProps) {
  // Industry benchmarks (mock data - would come from market research)
  const benchmarks = [
    {
      metric: 'Dívida/Hectare',
      value: metrics.debtPerHectare,
      formatted: formatCurrency(metrics.debtPerHectare),
      sectorAvg: 12200,
      formattedAvg: formatCurrency(12200),
      percentile: 75,
      status: 'high' as const,
      unit: 'R$/ha'
    },
    {
      metric: '% Dívida USD',
      value: metrics.usdExposure,
      formatted: `${metrics.usdExposure.toFixed(1)}%`,
      sectorAvg: 35.2,
      formattedAvg: '35.2%',
      percentile: 90,
      status: 'very_high' as const,
      unit: '%'
    },
    {
      metric: 'Taxa Média Ponderada',
      value: metrics.avgRate,
      formatted: `${metrics.avgRate.toFixed(1)}%`,
      sectorAvg: 11.4,
      formattedAvg: '11.4%',
      percentile: 25,
      status: 'good' as const,
      unit: '% a.a.'
    },
    {
      metric: 'Prazo Médio',
      value: metrics.avgMaturity,
      formatted: `${metrics.avgMaturity} meses`,
      sectorAvg: 24,
      formattedAvg: '24 meses',
      percentile: 70,
      status: 'high' as const,
      unit: 'meses'
    },
    {
      metric: 'Concentração Top 3',
      value: metrics.topThreeConcentration,
      formatted: `${metrics.topThreeConcentration.toFixed(1)}%`,
      sectorAvg: 60,
      formattedAvg: '60%',
      percentile: 80,
      status: 'high' as const,
      unit: '%'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'very_high':
        return <Badge variant="destructive">Muito Alto</Badge>
      case 'high':
        return <Badge variant="secondary">Alto</Badge>
      case 'good':
        return <Badge variant="default">Bom</Badge>
      case 'low':
        return <Badge variant="outline">Baixo</Badge>
      default:
        return null
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'bg-red-500'
    if (percentile >= 60) return 'bg-yellow-500'
    if (percentile >= 40) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getTrendIcon = (value: number, avg: number, inverted = false) => {
    const isHigherBetter = inverted
    if (value > avg) {
      return isHigherBetter ? (
        <TrendingUp className="h-4 w-4 text-green-600" />
      ) : (
        <TrendingUp className="h-4 w-4 text-red-600" />
      )
    } else if (value < avg) {
      return isHigherBetter ? (
        <TrendingDown className="h-4 w-4 text-red-600" />
      ) : (
        <TrendingDown className="h-4 w-4 text-green-600" />
      )
    }
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  // Calculate overall positioning
  const avgPercentile = benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length
  const overallPosition = 
    avgPercentile >= 75 ? 'Superior' :
    avgPercentile >= 50 ? 'Intermediário Superior' :
    avgPercentile >= 25 ? 'Intermediário' : 'Básico'

  return (
    <div className="space-y-6">
      {/* Overall Positioning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Posicionamento Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <h3 className="text-3xl font-bold">{overallPosition}</h3>
            <p className="text-muted-foreground mt-2">
              Percentil médio: {avgPercentile.toFixed(0)}º
            </p>
          </div>
          <Progress value={avgPercentile} className="h-3 mt-4" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Básico</span>
            <span>Intermediário</span>
            <span>Superior</span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Benchmarking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação com o Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Métrica</th>
                  <th className="text-center py-3 px-4">Nossa Posição</th>
                  <th className="text-center py-3 px-4">Média Setor</th>
                  <th className="text-center py-3 px-4">Percentil</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((benchmark) => (
                  <tr key={benchmark.metric} className="border-b">
                    <td className="py-4 px-4">
                      <div className="font-medium">{benchmark.metric}</div>
                      <div className="text-xs text-muted-foreground">{benchmark.unit}</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="font-medium flex items-center justify-center gap-2">
                        {benchmark.formatted}
                        {getTrendIcon(
                          benchmark.value, 
                          benchmark.sectorAvg,
                          benchmark.metric === 'Taxa Média Ponderada'
                        )}
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 text-muted-foreground">
                      {benchmark.formattedAvg}
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 relative">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${getPercentileColor(benchmark.percentile)}`}
                              style={{ width: `${benchmark.percentile}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium">{benchmark.percentile}º</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      {getStatusBadge(benchmark.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise e Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium flex items-center gap-2 text-green-600">
              <TrendingDown className="h-4 w-4" />
              Pontos Fortes
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Taxa de juros competitiva, abaixo da média do setor</li>
              <li>Boa diversificação de prazos de vencimento</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2 text-red-600">
              <TrendingUp className="h-4 w-4" />
              Pontos de Atenção
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Alta exposição a moeda estrangeira (90º percentil)</li>
              <li>Concentração institucional acima da média</li>
              <li>Endividamento por hectare elevado</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2 text-blue-600">
              <Target className="h-4 w-4" />
              Prioridades Estratégicas
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Implementar estratégia de hedge cambial para reduzir exposição USD</li>
              <li>Diversificar base de credores para reduzir concentração</li>
              <li>Avaliar oportunidades de refinanciamento para capturar taxas competitivas</li>
              <li>Considerar alongamento de prazos em linhas de crédito específicas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}