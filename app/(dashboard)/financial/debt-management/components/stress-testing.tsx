'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { 
 
  Shield,

  Activity,
  Clock,

  Zap,

  BarChart2
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/utils/debt-calculations'
import {

  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface StressScenario {
  id: string
  name: string
  description: string
  severity: 'mild' | 'moderate' | 'severe' | 'extreme'
  parameters: {
    selicIncrease: number
    exchangeRateIncrease: number
    revenueDecrease: number
    costIncrease: number
    commodityPriceDecrease: number
  }
  results: {
    survivalMonths: number
    dscrImpact: number
    liquidityImpact: number
    refinancingNeed: number
    riskScore: number
  }
}

export function StressTesting() {
  const [selectedScenario, setSelectedScenario] = useState<string>('covid-like')
  const [customParameters, setCustomParameters] = useState({
    selicIncrease: 3.0,
    exchangeRateIncrease: 15.0,
    revenueDecrease: 20.0,
    costIncrease: 10.0,
    commodityPriceDecrease: 25.0
  })

  // Predefined stress scenarios
  const stressScenarios: StressScenario[] = [
    {
      id: 'covid-like',
      name: 'Cenário COVID-19',
      description: 'Crise global similar à pandemia de 2020',
      severity: 'severe',
      parameters: {
        selicIncrease: 2.0,
        exchangeRateIncrease: 20.0,
        revenueDecrease: 30.0,
        costIncrease: 15.0,
        commodityPriceDecrease: 25.0
      },
      results: {
        survivalMonths: 8,
        dscrImpact: -35.0,
        liquidityImpact: -45.0,
        refinancingNeed: 95000000,
        riskScore: 25
      }
    },
    {
      id: 'inflation-spike',
      name: 'Disparo Inflacionário',
      description: 'Inflação descontrolada com alta da Selic',
      severity: 'moderate',
      parameters: {
        selicIncrease: 8.0,
        exchangeRateIncrease: 10.0,
        revenueDecrease: 15.0,
        costIncrease: 25.0,
        commodityPriceDecrease: 10.0
      },
      results: {
        survivalMonths: 12,
        dscrImpact: -28.0,
        liquidityImpact: -35.0,
        refinancingNeed: 75000000,
        riskScore: 35
      }
    },
    {
      id: 'currency-crisis',
      name: 'Crise Cambial',
      description: 'Desvalorização extrema do Real',
      severity: 'severe',
      parameters: {
        selicIncrease: 5.0,
        exchangeRateIncrease: 40.0,
        revenueDecrease: 10.0,
        costIncrease: 30.0,
        commodityPriceDecrease: 5.0
      },
      results: {
        survivalMonths: 6,
        dscrImpact: -45.0,
        liquidityImpact: -55.0,
        refinancingNeed: 125000000,
        riskScore: 15
      }
    },
    {
      id: 'commodity-collapse',
      name: 'Colapso das Commodities',
      description: 'Queda severa nos preços agrícolas',
      severity: 'extreme',
      parameters: {
        selicIncrease: 1.0,
        exchangeRateIncrease: 5.0,
        revenueDecrease: 50.0,
        costIncrease: 5.0,
        commodityPriceDecrease: 45.0
      },
      results: {
        survivalMonths: 4,
        dscrImpact: -60.0,
        liquidityImpact: -70.0,
        refinancingNeed: 150000000,
        riskScore: 10
      }
    },
    {
      id: 'mild-recession',
      name: 'Recessão Leve',
      description: 'Desaceleração econômica moderada',
      severity: 'mild',
      parameters: {
        selicIncrease: 1.5,
        exchangeRateIncrease: 8.0,
        revenueDecrease: 10.0,
        costIncrease: 8.0,
        commodityPriceDecrease: 12.0
      },
      results: {
        survivalMonths: 18,
        dscrImpact: -15.0,
        liquidityImpact: -20.0,
        refinancingNeed: 35000000,
        riskScore: 65
      }
    }
  ]

  const currentScenario = stressScenarios.find(s => s.id === selectedScenario) || stressScenarios[0]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'severe': return 'bg-orange-100 text-orange-800'
      case 'extreme': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'mild': return 'Leve'
      case 'moderate': return 'Moderado'
      case 'severe': return 'Severo'
      case 'extreme': return 'Extremo'
      default: return 'Desconhecido'
    }
  }

  // Generate survival analysis data
  const generateSurvivalAnalysis = () => {
    const months = 24
    const data = []
    const currentCash = 50000000 // Starting cash position
    const monthlyBurn = 18500000 // Current monthly debt service
    
    for (let month = 1; month <= months; month++) {
      const stressedBurn = monthlyBurn * (1 + (currentScenario.results.dscrImpact / 100))
      const remainingCash = Math.max(0, currentCash - (stressedBurn * month))
      const normalCash = Math.max(0, currentCash - (monthlyBurn * month))
      
      data.push({
        month: `M${month}`,
        normalScenario: normalCash,
        stressScenario: remainingCash,
        survivalThreshold: 10000000
      })
    }
    
    return data
  }

  const survivalData = generateSurvivalAnalysis()

  // Contingency measures
  const contingencyMeasures = [
    {
      id: 'credit-line',
      title: 'Linha de Crédito Emergencial',
      description: 'Ativar linhas de crédito pré-aprovadas',
      impact: 'Adiciona 6-8 meses de liquidez',
      cost: formatCurrency(5000000),
      timeToImplement: '1-2 semanas',
      effectiveness: 85
    },
    {
      id: 'asset-sale',
      title: 'Venda de Ativos Não-Essenciais',
      description: 'Liquidar equipamentos e terras menos produtivas',
      impact: 'Reduz dívida em até R$ 50M',
      cost: formatCurrency(8000000),
      timeToImplement: '3-6 meses',
      effectiveness: 75
    },
    {
      id: 'renegotiation',
      title: 'Renegociação Emergencial',
      description: 'Negociar carência e redução de juros',
      impact: 'Reduz pagamentos em 40-50%',
      cost: formatCurrency(3000000),
      timeToImplement: '2-4 semanas',
      effectiveness: 90
    },
    {
      id: 'operational-cuts',
      title: 'Cortes Operacionais',
      description: 'Reduzir custos variáveis e investimentos',
      impact: 'Economia de R$ 5-8M mensais',
      cost: formatCurrency(0),
      timeToImplement: '1 semana',
      effectiveness: 60
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Teste de Estresse
          </h2>
          <p className="text-muted-foreground mt-1">
            Análise de resistência da operação a cenários adversos
          </p>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stressScenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedScenario === scenario.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedScenario(scenario.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{scenario.name}</h4>
                <Badge className={getSeverityColor(scenario.severity)}>
                  {getSeverityLabel(scenario.severity)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Sobrevivência:</span>
                  <span className="ml-1 font-medium">{scenario.results.survivalMonths}m</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Risk Score:</span>
                  <span className="ml-1 font-medium">{scenario.results.riskScore}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Parâmetros do Cenário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Aumento Selic</p>
                  <p className="text-xs text-muted-foreground">Taxa básica de juros</p>
                </div>
                <span className="text-lg font-semibold text-red-700">
                  +{formatPercentage(currentScenario.parameters.selicIncrease)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Câmbio USD/BRL</p>
                  <p className="text-xs text-muted-foreground">Desvalorização do Real</p>
                </div>
                <span className="text-lg font-semibold text-orange-700">
                  +{formatPercentage(currentScenario.parameters.exchangeRateIncrease)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Queda de Receita</p>
                  <p className="text-xs text-muted-foreground">Redução na receita bruta</p>
                </div>
                <span className="text-lg font-semibold text-blue-700">
                  -{formatPercentage(currentScenario.parameters.revenueDecrease)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Aumento de Custos</p>
                  <p className="text-xs text-muted-foreground">Inflação de custos</p>
                </div>
                <span className="text-lg font-semibold text-purple-700">
                  +{formatPercentage(currentScenario.parameters.costIncrease)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Análise de Impacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Risk Score</span>
                  <span className="text-sm">{currentScenario.results.riskScore}/100</span>
                </div>
                <Progress value={currentScenario.results.riskScore} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Impacto no DSCR</span>
                  <span className="text-sm text-red-600">
                    {currentScenario.results.dscrImpact.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.abs(currentScenario.results.dscrImpact)} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Impacto na Liquidez</span>
                  <span className="text-sm text-red-600">
                    {currentScenario.results.liquidityImpact.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.abs(currentScenario.results.liquidityImpact)} 
                  className="h-2"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Meses de Sobrevivência</p>
                  <p className="text-2xl font-bold text-red-600">
                    {currentScenario.results.survivalMonths}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Necessidade de Refinanciamento</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(currentScenario.results.refinancingNeed)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Survival Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Análise de Sobrevivência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={survivalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value / 1000000) + 'M'} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'normalScenario' ? 'Cenário Normal' : 
                    name === 'stressScenario' ? 'Cenário de Estresse' : 'Limite Crítico'
                  ]}
                />
                <ReferenceLine 
                  y={10000000} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: "Limite Crítico", position: "top" }}
                />
                <Area
                  type="monotone"
                  dataKey="normalScenario"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="stressScenario"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Contingency Measures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Medidas de Contingência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contingencyMeasures.map((measure) => (
              <div key={measure.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{measure.title}</h4>
                  <Badge variant="outline">
                    {measure.effectiveness}% eficácia
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{measure.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Impacto:</span>
                    <p className="font-medium">{measure.impact}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Implementação:</span>
                    <p className="font-medium">{measure.timeToImplement}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Custo:</span>
                    <span className="ml-1 font-medium">{measure.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}