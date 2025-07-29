'use client'

import { motion } from 'framer-motion'
import { CovenantStatus, CurrencyRiskData } from '@/types/debt-management'
import { CovenantMonitoring } from '../covenant-monitoring'
import { CovenantMonitoringReal } from '../covenant-monitoring-real'
import { CurrencyRisk } from '../currency-risk'
import { SensitivityAnalysis } from '../sensitivity-analysis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  DollarSign,
  Activity,
  Settings,
  Bell
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/utils/debt-calculations'

interface RiskTabProps {
  covenants: CovenantStatus
  currencyRisk: CurrencyRiskData
  useRealData?: boolean
}

export function RiskTab({ covenants, currencyRisk, useRealData }: RiskTabProps) {
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  // Calculate risk score (0-100) adapted for real data
  const calculateRiskScore = () => {
    let score = 75 // Start with moderate score since we lack complete financial data
    
    // Currency risk (50% weight) - main risk we can calculate accurately
    const totalForeignExposure = currencyRisk.totalExposure || 0
    if (totalForeignExposure > 60) {
      score -= 25 // High foreign exposure risk
    } else if (totalForeignExposure > 40) {
      score -= 15 // Medium foreign exposure risk
    } else if (totalForeignExposure > 20) {
      score -= 5 // Low foreign exposure risk
    }
    
    // Interest rate risk (30% weight)
    // Higher average rates indicate higher risk
    const avgRate = 10.0 // We could calculate this from contract data
    if (avgRate > 15) {
      score -= 15 // High interest rate risk
    } else if (avgRate > 12) {
      score -= 10 // Medium interest rate risk
    } else if (avgRate > 8) {
      score -= 5 // Low interest rate risk
    }
    
    // Data availability penalty (20% weight)
    // Reduce score because we can't calculate key financial ratios
    if (!covenants?.dscr?.current) score -= 10 // Missing DSCR data
    if (!covenants?.debtToEbitda?.current) score -= 5 // Missing debt/EBITDA data
    if (!covenants?.currentRatio?.current) score -= 5 // Missing liquidity data
    
    return Math.max(0, Math.min(100, score))
  }

  const riskScore = calculateRiskScore()
  const getRiskLevel = () => {
    if (riskScore >= 80) return { level: 'Baixo', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (riskScore >= 60) return { level: 'Médio', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (riskScore >= 40) return { level: 'Alto', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { level: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const riskLevel = getRiskLevel()

  const riskMetrics = [
    {
      id: 'overall-risk',
      label: 'Risco Geral',
      value: riskScore.toFixed(0),
      unit: '/100',
      status: riskLevel.level,
      color: riskLevel.color,
      icon: Shield
    },
    {
      id: 'currency-exposure',
      label: 'Exposição Cambial',
      value: formatPercentage(currencyRisk.totalExposure || 0),
      status: (currencyRisk.totalExposure || 0) > 60 ? 'Alto' : 
              (currencyRisk.totalExposure || 0) > 40 ? 'Médio' : 'Controlado',
      color: (currencyRisk.totalExposure || 0) > 60 ? 'text-red-600' : 
             (currencyRisk.totalExposure || 0) > 40 ? 'text-yellow-600' : 'text-green-600',
      icon: DollarSign
    },
    {
      id: 'var-30days',
      label: 'VaR 30 Dias',
      value: formatCurrency(currencyRisk.var30Days || 0),
      status: 'Estimado',
      color: 'text-blue-600',
      icon: TrendingDown
    },
    {
      id: 'covenant-health',
      label: 'Saúde dos Covenants',
      value: covenants?.hasData ? 'N/A' : 'Sem Dados',
      status: covenants?.hasData ? 'Não Disponível' : 'Dados Necessários',
      color: 'text-gray-600',
      icon: Activity,
      warning: covenants?.dataWarning
    }
  ]

  const generateRiskAlerts = () => {
    const alerts = []
    
    // Currency exposure alert
    if ((currencyRisk.totalExposure || 0) > 50) {
      alerts.push({
        id: 'currency-exposure',
        type: 'warning',
        title: 'Exposição Cambial Elevada',
        description: `${formatPercentage(currencyRisk.totalExposure || 0)} do portfólio em moeda estrangeira. Risco de variação cambial.`,
        action: 'Avaliar Hedge',
        priority: 'high'
      })
    }
    
    // Exchange rate monitoring
    if (currencyRisk?.hasRealRates) {
      alerts.push({
        id: 'rate-monitoring',
        type: 'info',
        title: 'Taxas de Câmbio Atualizadas',
        description: currencyRisk.rateDataWarning || 'Taxas obtidas de fonte externa em tempo real.',
        action: 'Ver Detalhes',
        priority: 'low'
      })
    }
    
    // Data completeness warning
    if (!covenants?.hasData) {
      alerts.push({
        id: 'missing-data',
        type: 'warning',
        title: 'Dados Financeiros Incompletos',
        description: covenants?.dataWarning || 'Alguns indicadores de risco não podem ser calculados sem dados adicionais.',
        action: 'Importar Dados',
        priority: 'medium'
      })
    }
    
    return alerts
  }
  
  const riskAlerts = generateRiskAlerts()

  return (
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskMetrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  <Badge className={`${riskLevel.bgColor} ${metric.color} border-0`}>
                    {metric.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-lg font-semibold">
                    {metric.value}
                    {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Risk Score Visualization */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Score de Risco Consolidado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nível de Risco Atual</span>
                <Badge className={`${riskLevel.bgColor} ${riskLevel.color} border-0`}>
                  {riskLevel.level}
                </Badge>
              </div>
              <Progress value={riskScore} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Crítico (0-40)</span>
                <span>Alto (40-60)</span>
                <span>Médio (60-80)</span>
                <span>Baixo (80-100)</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">80+</p>
                  <p className="text-xs text-muted-foreground">Meta</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{riskScore.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Atual</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-orange-600">
                    {riskScore >= 80 ? '+' : ''}{(riskScore - 80).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">vs Meta</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Alerts */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas de Risco
            </CardTitle>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge variant={alert.priority === 'high' ? 'destructive' : 
                                   alert.priority === 'medium' ? 'default' : 'secondary'} 
                           className="text-xs">
                      {alert.priority === 'high' ? 'Alta' : 
                       alert.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {alert.description}
                  </p>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    {alert.action}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Risk Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          variants={itemVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          {useRealData ? (
            <CovenantMonitoringReal covenants={covenants} />
          ) : (
            <CovenantMonitoring covenants={covenants} />
          )}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
        >
          <CurrencyRisk currencyRisk={currencyRisk} />
        </motion.div>
      </div>

      {/* Sensitivity Analysis */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
      >
        <SensitivityAnalysis />
      </motion.div>
    </div>
  )
}