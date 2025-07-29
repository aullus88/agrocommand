'use client'

import { motion } from 'framer-motion'
import { DebtPortfolio } from '@/types/debt-management'
import { DebtOverviewCards } from '../debt-overview-cards'
import { PortfolioComposition } from '../portfolio-composition'
import { MaturityProfile } from '../maturity-profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  AlertTriangle, 
  Target, 
  BarChart3,
  ArrowRight,
  TrendingUp,
  Shield
} from 'lucide-react'

interface OverviewTabProps {
  portfolio: DebtPortfolio
  onNavigateToTab: (tab: string) => void
}

export function OverviewTab({ portfolio, onNavigateToTab }: OverviewTabProps) {
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  const quickActions = [
    {
      id: 'new-payment',
      title: 'Registrar Pagamento',
      description: 'Registre um novo pagamento de dívida',
      icon: FileText,
      action: () => onNavigateToTab('contracts'),
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'risk-analysis',
      title: 'Análise de Risco',
      description: 'Verificar status dos covenants',
      icon: AlertTriangle,
      action: () => onNavigateToTab('risk'),
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
      urgent: true
    },
    {
      id: 'scenario-planning',
      title: 'Simulação de Cenários',
      description: 'Planeje reestruturações e cenários',
      icon: Target,
      action: () => onNavigateToTab('scenarios'),
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      id: 'generate-report',
      title: 'Gerar Relatório',
      description: 'Exporte relatórios para compliance',
      icon: BarChart3,
      action: () => onNavigateToTab('reports'),
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    }
  ]

  const recentAlerts = [
    {
      id: 'payment-due',
      type: 'warning',
      title: 'Pagamento Próximo',
      description: 'Banco do Brasil - R$ 8.5M vence em 15 dias',
      time: '2 horas atrás'
    },
    {
      id: 'covenant-check',
      type: 'info',
      title: 'Covenant Atualizado',
      description: 'DSCR recalculado: 1.48x (dentro do limite)',
      time: '1 dia atrás'
    },
    {
      id: 'rate-change',
      type: 'info',
      title: 'Taxa CDI Alterada',
      description: 'Nova taxa: 13.25% (+0.25 pontos)',
      time: '2 dias atrás'
    }
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <DebtOverviewCards overview={portfolio.overview} />
      </motion.div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          variants={itemVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <PortfolioComposition composition={portfolio.composition} />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          <MaturityProfile maturityProfile={portfolio.maturityProfile} />
        </motion.div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{action.title}</span>
                          {action.urgent && (
                            <span className="flex h-2 w-2 rounded-full bg-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          variants={itemVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    alert.type === 'warning' ? 'bg-yellow-500' :
                    alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))}
              
              <Button variant="ghost" size="sm" className="w-full mt-4">
                Ver todas as atividades
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}