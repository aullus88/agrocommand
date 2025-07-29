'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  FileText, 
  AlertTriangle, 
  Target, 
  BarChart3,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type DebtTab = 'overview' | 'contracts' | 'risk' | 'scenarios' | 'reports'

interface DebtNavigationTabsProps {
  activeTab: DebtTab
  onTabChange: (tab: DebtTab) => void
  alerts?: {
    contracts?: number
    risk?: number
    scenarios?: number
  }
}

export function DebtNavigationTabs({ 
  activeTab, 
  onTabChange, 
  alerts = {} 
}: DebtNavigationTabsProps) {
  const tabs = [
    {
      id: 'overview' as DebtTab,
      label: 'Visão Geral',
      icon: LayoutDashboard,
      description: 'Dashboard principal com KPIs e resumo do portfólio'
    },
    {
      id: 'contracts' as DebtTab,
      label: 'Contratos',
      icon: FileText,
      description: 'Gestão detalhada de contratos e operações',
      alerts: alerts.contracts
    },
    {
      id: 'risk' as DebtTab,
      label: 'Análise de Risco',
      icon: AlertTriangle,
      description: 'Monitoramento de covenants e risco cambial',
      alerts: alerts.risk
    },
    {
      id: 'scenarios' as DebtTab,
      label: 'Cenários',
      icon: Target,
      description: 'Simulações e planejamento estratégico',
      alerts: alerts.scenarios
    },
    {
      id: 'reports' as DebtTab,
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Geração de relatórios e exportação de dados'
    }
  ]

  return (
    <div className="border-b bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold">Gestão de Dívidas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle completo do portfólio de dívidas e covenants financeiros
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Atualizado há 5 min
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            Covenants OK
          </Badge>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as DebtTab)}>
        <TabsList className="h-auto px-6 bg-transparent border-0 rounded-none w-full justify-start">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative flex items-center gap-2 px-6 py-3 rounded-none border-0 border-b-2 border-b-transparent",
                "data-[state=active]:border-b-primary data-[state=active]:bg-transparent",
                "hover:bg-muted/50 transition-colors",
                "text-muted-foreground data-[state=active]:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
              {tab.alerts && tab.alerts > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-1 px-1.5 py-0.5 text-xs min-w-[1.2rem] h-5"
                >
                  {tab.alerts}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}