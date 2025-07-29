'use client'

import { useCashFlowData } from '@/hooks/use-cash-flow-data'
import { DefaultPage } from '@/components/DefaultPage'
import { CashFlowKPIs } from './components/cash-flow-kpis'
import { ProjectedFlowChart } from './components/projected-flow-chart'
import { PaymentCalendar } from './components/payment-calendar'
import { AgingAnalysis } from './components/aging-analysis'
import { WorkingCapitalAnalysis } from './components/working-capital-analysis'
import { ConversionCycleVisual } from './components/conversion-cycle-visual'
import { CashOptimizer } from './components/cash-optimizer'
import { ContingencyPanel } from './components/contingency-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Download, Share2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CashFlowPage() {
  const { data: cashFlowData, isLoading, error } = useCashFlowData()

  // Header actions
  const headerActions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
      <Button variant="outline" size="sm">
        <Share2 className="h-4 w-4 mr-2" />
        Compartilhar
      </Button>
      <Button variant="outline" size="sm">
        <Settings className="h-4 w-4 mr-2" />
        Configurar
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <DefaultPage
        title="Fluxo de Caixa"
        description="Gestão e projeção de fluxo de caixa - Safra 2024/25"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Análise Financeira', href: '/financial' },
          { label: 'Fluxo de Caixa' },
        ]}
        headerActions={headerActions}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </DefaultPage>
    )
  }

  if (error) {
    return (
      <DefaultPage
        title="Fluxo de Caixa"
        description="Gestão e projeção de fluxo de caixa - Safra 2024/25"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Análise Financeira', href: '/financial' },
          { label: 'Fluxo de Caixa' },
        ]}
        headerActions={headerActions}
      >
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados de fluxo de caixa: {error.message}
          </AlertDescription>
        </Alert>
      </DefaultPage>
    )
  }

  if (!cashFlowData) {
    return (
      <DefaultPage
        title="Fluxo de Caixa"
        description="Gestão e projeção de fluxo de caixa - Safra 2024/25"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Análise Financeira', href: '/financial' },
          { label: 'Fluxo de Caixa' },
        ]}
        headerActions={headerActions}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhum dado de fluxo de caixa disponível.
          </AlertDescription>
        </Alert>
      </DefaultPage>
    )
  }

  return (
    <DefaultPage
      title="Fluxo de Caixa"
      description="Gestão e projeção de fluxo de caixa - Safra 2024/25"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Análise Financeira', href: '/financial' },
        { label: 'Fluxo de Caixa' },
      ]}
      headerActions={headerActions}
    >
      {/* KPI Cards */}
      <CashFlowKPIs overview={cashFlowData.overview} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projected Cash Flow - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ProjectedFlowChart 
            projections={cashFlowData.projections}
          />
        </div>
        
        {/* Payment Calendar - Takes 1 column */}
        <PaymentCalendar 
          calendar={cashFlowData.calendar}
        />
      </div>

      {/* Working Capital and Aging Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkingCapitalAnalysis 
          workingCapital={cashFlowData.workingCapital}
        />
        <AgingAnalysis 
          receivables={cashFlowData.receivables}
          payables={cashFlowData.payables}
        />
      </div>

      {/* Conversion Cycle and Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionCycleVisual 
          conversionCycle={cashFlowData.conversionCycle}
        />
        <CashOptimizer 
          opportunities={cashFlowData.optimization}
        />
      </div>

      {/* Contingency Panel */}
      <ContingencyPanel 
        contingency={cashFlowData.contingency}
      />
    </DefaultPage>
  )
}
