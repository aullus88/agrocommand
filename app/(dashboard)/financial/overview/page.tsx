'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DefaultPage } from '@/components/DefaultPage'
import { KPIGrid } from '@/components/financial/kpi-card'
import { FinancialHeader } from './components/financial-header'
import { IncomeWaterfall } from './components/income-waterfall'
import { CostTreemap } from './components/cost-treemap'
import { MarginEvolution } from './components/margin-evolution'
import { CostPerHectare } from './components/cost-per-hectare'
import { IndicatorsDashboard } from './components/indicators-dashboard'
import { useFinancialDashboard } from '@/hooks/use-financial-data'
import { mockDefaultFilters } from '@/data/mock-financial-data'
import { FinancialFilters } from '@/types/financial'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function FinancialOverviewPage() {
  const [filters, setFilters] = useState<FinancialFilters>(mockDefaultFilters)
  
  const {
    data,
    isLoading,
    isError,
    error
  } = useFinancialDashboard(filters)

  const handleDrillDown = (kpiId: string) => {
    console.log('Drill down for KPI:', kpiId)
    // Implement drill-down functionality
  }

  const handleCreateAlert = (kpiId: string) => {
    console.log('Create alert for KPI:', kpiId)
    // Implement alert creation
  }

  const handleShare = (kpiId: string) => {
    console.log('Share KPI:', kpiId)
    // Implement sharing functionality
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },                  
    animate: { opacity: 1, y: 0 }
  }

  if (isError) {
    return (
      <DefaultPage
        title="Visão Geral Financeira"
        description="Análise completa dos indicadores financeiros da fazenda"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Financeiro', href: '/financial' },
          { label: 'Visão Geral' }
        ]}
      >
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados financeiros: {error?.message || 'Erro desconhecido'}
          </AlertDescription>
        </Alert>
      </DefaultPage>
    )
  }

  return (
    <DefaultPage
      title="Visão Geral Financeira"
      description="Análise completa dos indicadores financeiros da fazenda"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Financeiro', href: '/financial' },
        { label: 'Visão Geral' }
      ]}
    
    >
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
           <FinancialHeader
          filters={filters}
          onFiltersChange={setFilters}
          lastUpdated={data.overview?.lastUpdated}
        />
        {/* KPI Cards */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-48">
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : data.kpis ? (
              <KPIGrid
                kpis={data.kpis}
                variant="default"
                onDrillDown={handleDrillDown}
                onCreateAlert={handleCreateAlert}
                onShare={handleShare}
              />
            ) : null}
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Income Statement Waterfall - Takes 2 columns */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              {isLoading ? (
                <Card className="h-96">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-80 w-full" />
                  </CardContent>
                </Card>
              ) : data.incomeStatement ? (
                <IncomeWaterfall
                  data={data.incomeStatement}
                  showBudgetComparison={true}
                />
              ) : null}
            </motion.div>

            {/* Cost Treemap - Takes 1 column */}
            <motion.div variants={itemVariants}>
              {isLoading ? (
                <Card className="h-96">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-80 w-full" />
                  </CardContent>
                </Card>
              ) : data.costBreakdown ? (
                <CostTreemap
                  data={data.costBreakdown}
                  onItemClick={(item) => console.log('Treemap item clicked:', item)}
                />
              ) : null}
            </motion.div>
          </div>

          {/* Margin Evolution */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <Card className="h-96">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-80 w-full" />
                </CardContent>
              </Card>
            ) : data.marginEvolution ? (
              <MarginEvolution data={data.marginEvolution} />
            ) : null}
          </motion.div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Cost per Hectare */}
            <motion.div variants={itemVariants}>
              {isLoading ? (
                <Card className="h-96">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-80 w-full" />
                  </CardContent>
                </Card>
              ) : data.costPerHectare ? (
                <CostPerHectare data={data.costPerHectare} />
              ) : null}
            </motion.div>

            {/* Financial Indicators */}
            <motion.div variants={itemVariants}>
              {isLoading ? (
                <Card className="h-96">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : data.financialIndicators ? (
                <IndicatorsDashboard indicators={data.financialIndicators} />
              ) : null}
            </motion.div>
          </div>
        </motion.div>
    </DefaultPage>
  )
}
