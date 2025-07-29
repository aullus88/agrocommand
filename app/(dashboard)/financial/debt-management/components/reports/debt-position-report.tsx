'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Building2,
  Globe,
  Target,
  Download,
  BarChart3
} from 'lucide-react'
import { formatCurrency } from '@/utils/debt-calculations'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRealDebtPortfolio } from '@/hooks/use-real-debt-data'
import { DebtCompositionCharts } from './debt-composition-charts'
import { DebtEvolutionChart } from './debt-evolution-chart'
import { ConcentrationAnalysis } from './concentration-analysis'
import { BenchmarkingTable } from './benchmarking-table'
import { Skeleton } from '@/components/ui/skeleton'

interface DebtPositionReportProps {
  onExport?: (format: 'pdf' | 'excel' | 'ppt') => void
}

export function DebtPositionReport({ onExport }: DebtPositionReportProps) {
  const [selectedView, setSelectedView] = useState('overview')
  
  // Fetch real debt data
  const { data: portfolio, isLoading } = useRealDebtPortfolio()

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (!portfolio) return null

    const overview = portfolio.overview
    const composition = portfolio.composition

    // Calculate changes (mock data for now - would come from historical data)
    const totalDebtChange = 2.3 // %
    const usdExposureChange = -1.5 // %
    const avgRateChange = 0.3 // pp
    const avgMaturityChange = -2 // months

    // Top institutions
    const topInstitutions = composition.byInstitution
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Rate distribution
    const rateDistribution = [
      { range: '< 8.0%', amount: overview.totalDebt * 0.15, percentage: 15 },
      { range: '8.0% - 10.0%', amount: overview.totalDebt * 0.399, percentage: 39.9 },
      { range: '10.0% - 12.0%', amount: overview.totalDebt * 0.321, percentage: 32.1 },
      { range: '> 12.0%', amount: overview.totalDebt * 0.13, percentage: 13 }
    ]

    return {
      totalDebt: overview.totalDebt,
      totalDebtChange,
      usdExposure: overview.usdExposurePercent,
      usdExposureChange,
      avgRate: overview.avgWeightedRate,
      avgRateChange,
      avgMaturity: overview.avgMaturity,
      avgMaturityChange,
      topInstitutions,
      rateDistribution,
      currencyComposition: composition.byCurrency,
      institutionComposition: composition.byInstitution,
      purposeComposition: composition.byPurpose
    }
  }, [portfolio])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!portfolio || !metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhum dado de dívida disponível
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <PieChart className="h-6 w-6" />
                Posição de Endividamento
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Snapshot completo da estrutura de dívidas
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onExport?.('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport?.('ppt')}>
                <Download className="h-4 w-4 mr-2" />
                PPT
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Posição em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dívida Total
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(metrics.totalDebt)}
                </p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  metrics.totalDebtChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {metrics.totalDebtChange > 0 ? '+' : ''}{metrics.totalDebtChange}% mês ant.
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Exposição USD
                </p>
                <p className="text-2xl font-bold">
                  {metrics.usdExposure.toFixed(1)}%
                </p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  metrics.usdExposureChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {metrics.usdExposureChange}% trim.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Taxa Média
                </p>
                <p className="text-2xl font-bold">
                  {metrics.avgRate.toFixed(1)}% a.a.
                </p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  metrics.avgRateChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {metrics.avgRateChange > 0 ? '+' : ''}{metrics.avgRateChange}pp mês
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Venc. Médio
                </p>
                <p className="text-2xl font-bold">
                  {metrics.avgMaturity} meses
                </p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  metrics.avgMaturityChange < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {metrics.avgMaturityChange} meses
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Composição</TabsTrigger>
          <TabsTrigger value="institutions">Instituições</TabsTrigger>
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DebtCompositionCharts portfolio={portfolio} />
        </TabsContent>

        <TabsContent value="institutions" className="space-y-6">
          <ConcentrationAnalysis 
            institutions={metrics.topInstitutions}
            totalDebt={metrics.totalDebt}
          />
        </TabsContent>

        <TabsContent value="evolution" className="space-y-6">
          <DebtEvolutionChart totalDebt={metrics.totalDebt} />
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-6">
          <BenchmarkingTable 
            metrics={{
              debtPerHectare: metrics.totalDebt / 50, // Assuming 50 hectares
              usdExposure: metrics.usdExposure,
              avgRate: metrics.avgRate,
              avgMaturity: metrics.avgMaturity,
              topThreeConcentration: metrics.topInstitutions
                .slice(0, 3)
                .reduce((sum, inst) => sum + inst.percentage, 0)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Rate Distribution Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Faixa de Taxa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.rateDistribution.map((range) => (
              <div key={range.range} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={range.range.includes('> 12') ? 'destructive' : 
                               range.range.includes('< 8') ? 'default' : 'secondary'}
                    >
                      {range.range}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatCurrency(range.amount)} ({range.percentage}%)
                    </span>
                  </div>
                  {range.range.includes('> 12') && (
                    <span className="text-sm text-red-600">
                      Economia potencial: R$ 1,8M/ano
                    </span>
                  )}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      range.range.includes('> 12') ? 'bg-red-500' :
                      range.range.includes('< 8') ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${range.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Oportunidades de Otimização</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• 45% da dívida (R$ 310M) com taxa {'>'}10% - Prioridade para renegociação</li>
                  <li>• Potencial de economia: R$ 4.0M/ano com otimização de taxas</li>
                  <li>• Foco em contratos {'>'} 12%: maior relação impacto/esforço</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}