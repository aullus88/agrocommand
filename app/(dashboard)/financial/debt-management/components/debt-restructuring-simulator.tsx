'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Download,
  Play,
  BarChart3,
  DollarSign,
  Calendar,
  Percent
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
} from 'recharts'

interface SimulationScenario {
  id: string
  name: string
  description: string
  parameters: {
    newTermMonths: number
    newInterestRate: number
    gracePeriodsMonths: number
    partialPrepayment: number
    renegotiationCost: number
  }
  results: {
    totalSavings: number
    monthlyReduction: number
    newDSCR: number
    paybackMonths: number
    riskReduction: number
  }
}

export function DebtRestructuringSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<string>('extend-term')
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  
  // Current debt parameters (from mock data)
  const currentDebt = {
    totalAmount: 287500000,
    avgRate: 9.7,
    avgTermMonths: 21,
    monthlyPayment: 18500000,
    dscr: 1.48
  }

  // Predefined scenarios
  const scenarios: SimulationScenario[] = [
    {
      id: 'extend-term',
      name: 'Extensão de Prazo',
      description: 'Estender prazos para reduzir pagamentos mensais',
      parameters: {
        newTermMonths: 36,
        newInterestRate: 9.7,
        gracePeriodsMonths: 6,
        partialPrepayment: 0,
        renegotiationCost: 2875000
      },
      results: {
        totalSavings: 15000000,
        monthlyReduction: 8500000,
        newDSCR: 1.85,
        paybackMonths: 8,
        riskReduction: 25
      }
    },
    {
      id: 'rate-reduction',
      name: 'Redução de Taxa',
      description: 'Negociar taxas menores com garantias adicionais',
      parameters: {
        newTermMonths: 21,
        newInterestRate: 8.2,
        gracePeriodsMonths: 0,
        partialPrepayment: 0,
        renegotiationCost: 1437500
      },
      results: {
        totalSavings: 22000000,
        monthlyReduction: 3200000,
        newDSCR: 1.65,
        paybackMonths: 5,
        riskReduction: 15
      }
    },
    {
      id: 'partial-prepayment',
      name: 'Pagamento Antecipado',
      description: 'Usar recursos próprios para reduzir principal',
      parameters: {
        newTermMonths: 18,
        newInterestRate: 9.7,
        gracePeriodsMonths: 0,
        partialPrepayment: 50000000,
        renegotiationCost: 575000
      },
      results: {
        totalSavings: 35000000,
        monthlyReduction: 6800000,
        newDSCR: 1.72,
        paybackMonths: 12,
        riskReduction: 30
      }
    },
    {
      id: 'combined',
      name: 'Estratégia Combinada',
      description: 'Combinar extensão, redução de taxa e pagamento antecipado',
      parameters: {
        newTermMonths: 30,
        newInterestRate: 8.5,
        gracePeriodsMonths: 3,
        partialPrepayment: 25000000,
        renegotiationCost: 4312500
      },
      results: {
        totalSavings: 45000000,
        monthlyReduction: 9200000,
        newDSCR: 1.92,
        paybackMonths: 10,
        riskReduction: 40
      }
    }
  ]

  const currentScenario = scenarios.find(s => s.id === selectedScenario) || scenarios[0]

  // Generate cash flow projection data
  const generateCashFlowData = (scenario: SimulationScenario) => {
    const data: Array<{ month: string; current: number; restructured: number; savings: number }> = []
    const months = Math.max(24, scenario.parameters.newTermMonths)
    
    for (let month = 1; month <= months; month++) {
      const currentPayment = month <= currentDebt.avgTermMonths ? currentDebt.monthlyPayment : 0
      const newPayment = month <= scenario.parameters.newTermMonths 
        ? (currentDebt.monthlyPayment - scenario.results.monthlyReduction) 
        : 0
      
      data.push({
        month: `M${month}`,
        current: currentPayment,
        restructured: newPayment,
        savings: currentPayment - newPayment
      })
    }
    
    return data
  }

  const cashFlowData = generateCashFlowData(currentScenario)

  const runSimulation = async () => {
    setIsSimulating(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock simulation results
    setSimulationResults({
      scenario: currentScenario,
      projectedSavings: currentScenario.results.totalSavings,
      riskImprovement: currentScenario.results.riskReduction,
      recommendationScore: 85
    })
    
    setIsSimulating(false)
  }

  const resetSimulation = () => {
    setSimulationResults(null)
    setSelectedScenario('extend-term')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Simulador de Reestruturação
          </h2>
          <p className="text-muted-foreground mt-1">
            Analise diferentes cenários de reestruturação da dívida
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetSimulation}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Current Debt Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Situação Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Dívida Total</p>
              <p className="text-lg font-semibold">{formatCurrency(currentDebt.totalAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Taxa Média</p>
              <p className="text-lg font-semibold">{formatPercentage(currentDebt.avgRate)} a.a.</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Prazo Médio</p>
              <p className="text-lg font-semibold">{currentDebt.avgTermMonths} meses</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pagamento Mensal</p>
              <p className="text-lg font-semibold">{formatCurrency(currentDebt.monthlyPayment)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">DSCR Atual</p>
              <p className="text-lg font-semibold">{currentDebt.dscr.toFixed(2)}x</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cenários de Reestruturação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <Badge variant={selectedScenario === scenario.id ? 'default' : 'secondary'}>
                    {formatCurrency(scenario.results.totalSavings)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">DSCR:</span>
                    <span className="ml-1 font-medium">{scenario.results.newDSCR.toFixed(2)}x</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payback:</span>
                    <span className="ml-1 font-medium">{scenario.results.paybackMonths}m</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scenario Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {currentScenario.name} - Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="parameters" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
                <TabsTrigger value="results">Resultados</TabsTrigger>
                <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
              </TabsList>
              
              <TabsContent value="parameters" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Novo Prazo (meses)
                    </Label>
                    <div className="mt-2">
                      <Input 
                        type="number" 
                        value={currentScenario.parameters.newTermMonths}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Nova Taxa (% a.a.)
                    </Label>
                    <div className="mt-2">
                      <Input 
                        type="number" 
                        value={currentScenario.parameters.newInterestRate}
                        step="0.1"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Carência (meses)</Label>
                    <div className="mt-2">
                      <Input 
                        type="number" 
                        value={currentScenario.parameters.gracePeriodsMonths}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Pagamento Antecipado
                    </Label>
                    <div className="mt-2">
                      <Input 
                        value={formatCurrency(currentScenario.parameters.partialPrepayment)}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Economia Total</p>
                        <p className="text-lg font-semibold text-green-700">
                          {formatCurrency(currentScenario.results.totalSavings)}
                        </p>
                      </div>
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Redução Mensal</p>
                        <p className="text-lg font-semibold text-blue-700">
                          {formatCurrency(currentScenario.results.monthlyReduction)}
                        </p>
                      </div>
                      <TrendingDown className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Novo DSCR</p>
                        <p className="text-lg font-semibold text-purple-700">
                          {currentScenario.results.newDSCR.toFixed(2)}x
                        </p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Redução de Risco</p>
                        <p className="text-lg font-semibold text-orange-700">
                          {formatPercentage(currentScenario.results.riskReduction)}
                        </p>
                      </div>
                      <TrendingDown className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cashflow">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowData.slice(0, 24)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value / 1000000) + 'M'} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name === 'currentScenario' ? 'Cenário Atual' : 
                          name === 'newScenario' ? 'Novo Cenário' : 'Economia'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="currentScenario"
                        stackId="1"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="newScenario"
                        stackId="2"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Executar Simulação Detalhada</h3>
              <p className="text-sm text-muted-foreground">
                Análise completa do cenário selecionado com projeções de longo prazo
              </p>
            </div>
            <Button 
              onClick={runSimulation} 
              disabled={isSimulating}
              size="lg"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Executar Simulação
                </>
              )}
            </Button>
          </div>
          
          {simulationResults && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Resultados da Simulação</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Economia Projetada:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(simulationResults.projectedSavings)}
                  </span>
                </div>
                <div>
                  <span className="text-green-700">Melhoria de Risco:</span>
                  <span className="ml-2 font-medium">
                    {formatPercentage(simulationResults.riskImprovement)}
                  </span>
                </div>
                <div>
                  <span className="text-green-700">Score de Recomendação:</span>
                  <span className="ml-2 font-medium">
                    {simulationResults.recommendationScore}/100
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}