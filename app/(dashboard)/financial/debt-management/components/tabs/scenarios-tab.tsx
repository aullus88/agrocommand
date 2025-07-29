'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DebtRestructuringSimulator } from '../debt-restructuring-simulator'
import { StressTesting } from '../stress-testing'
import { 
  Calculator, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  BarChart3,
  Shield,
  DollarSign
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/utils/debt-calculations'

export function ScenariosTab() {
  const [activeScenarioTab, setActiveScenarioTab] = useState('restructuring')

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  // Quick scenario overview cards
  const scenarioOverview = [
    {
      id: 'current-position',
      title: 'Posição Atual',
      value: formatCurrency(287500000),
      subtitle: 'Dívida Total',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'restructuring-potential',
      title: 'Potencial de Reestruturação',
      value: formatCurrency(45000000),
      subtitle: 'Economia Estimada',
      icon: Calculator,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'stress-resistance',
      title: 'Resistência ao Estresse',
      value: '8 meses',
      subtitle: 'Sobrevivência Mínima',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'optimization-score',
      title: 'Score de Otimização',
      value: '75/100',
      subtitle: 'Potencial de Melhoria',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  // Quick actions for scenario planning
  const quickActions = [
    {
      id: 'emergency-plan',
      title: 'Plano de Emergência',
      description: 'Ações imediatas em caso de crise',
      icon: AlertTriangle,
      color: 'bg-red-50 hover:bg-red-100 border-red-200',
      action: () => setActiveScenarioTab('stress-testing')
    },
    {
      id: 'optimization',
      title: 'Otimizar Estrutura',
      description: 'Melhorar termos e condições',
      icon: TrendingUp,
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      action: () => setActiveScenarioTab('restructuring')
    },
    {
      id: 'risk-analysis',
      title: 'Análise de Cenários',
      description: 'Comparar diferentes estratégias',
      icon: BarChart3,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      action: () => console.log('Compare scenarios')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarioOverview.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                    <p className="text-lg font-semibold truncate">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`${action.color} h-auto p-4 justify-start text-left relative overflow-hidden group`}
                  onClick={action.action}
                >
                  <div className="flex items-start gap-3 w-full">
                    <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{action.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Scenario Tools */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeScenarioTab} onValueChange={setActiveScenarioTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="restructuring" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Simulador de Reestruturação
            </TabsTrigger>
            <TabsTrigger value="stress-testing" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Teste de Estresse
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="restructuring" className="mt-6">
            <DebtRestructuringSimulator />
          </TabsContent>
          
          <TabsContent value="stress-testing" className="mt-6">
            <StressTesting />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Scenario Comparison (Future Enhancement) */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparação de Cenários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Comparação Avançada de Cenários
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Compare diferentes estratégias lado a lado para tomar a melhor decisão para sua operação.
              </p>
              <Button variant="outline" className="mt-4">
                Em Desenvolvimento
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}