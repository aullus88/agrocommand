'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DefaultPage } from '@/components/DefaultPage'
import { DebtNavigationTabs, DebtTab } from './components/debt-navigation-tabs'
import { OverviewTab } from './components/tabs/overview-tab'
import { ContractsTab } from './components/tabs/contracts-tab'
import { RiskTab } from './components/tabs/risk-tab'
import { ScenariosTab } from './components/tabs/scenarios-tab'
import { ReportsTab } from './components/tabs/reports-tab'
import { useDebtPortfolio } from '@/hooks/use-debt-portfolio'
import { useRealDebtPortfolio } from '@/hooks/use-real-debt-data'
import { mockDefaultDebtFilters } from '@/data/mock-debt-data'
import { DebtFilters } from '@/types/debt-management'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Settings } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { HeaderCurrencyRates } from './components/currency-rates-display'

export default function DebtManagementPage() {
  const [activeTab, setActiveTab] = useState<DebtTab>('overview')
  const [filters] = useState<DebtFilters>(mockDefaultDebtFilters)
  const [useRealData, setUseRealData] = useState(false)
  
  // Always call both hooks to avoid conditional hooks issue
  const realDataQuery = useRealDebtPortfolio(filters)
  const mockDataQuery = useDebtPortfolio(filters)
  
  // Choose between real and mock data
  const {
    data: portfolio,
    isLoading,
    isError,
    error
  } = useRealData ? realDataQuery : mockDataQuery

  const handleTabChange = (tab: DebtTab) => {
    setActiveTab(tab)
  }

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab as DebtTab)
  }

  // Calculate alerts for tabs
  const alerts = {
    contracts: 1, // One upcoming payment
    risk: 2,      // Two risk alerts
    scenarios: 0
  }

  if (isError) {
    return (
      <DefaultPage
        title="Gestão de Dívidas"
        description="Controle completo do portfólio de dívidas e covenants financeiros"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Financeiro', href: '/financial' },
          { label: 'Gestão de Dívidas' }
        ]}
      >
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados de dívidas: {error?.message || 'Erro desconhecido'}
          </AlertDescription>
        </Alert>
      </DefaultPage>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-shrink-0">
          <DebtNavigationTabs 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            alerts={alerts}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Loading skeleton */}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-[500px]">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
              <Card className="h-[500px]">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!portfolio) return null

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            portfolio={portfolio}
            onNavigateToTab={handleNavigateToTab}
          />
        )
      case 'contracts':
        return <ContractsTab contracts={portfolio.contracts} />
      case 'risk':
        return (
          <RiskTab 
            covenants={portfolio.covenants}
            currencyRisk={portfolio.currencyRisk}
            useRealData={useRealData}
          />
        )
      case 'scenarios':
        return <ScenariosTab />
      case 'reports':
        return <ReportsTab />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-shrink-0">
        {/* Header Controls */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-4 justify-end">
            <div className="flex items-center gap-4">
              {/* Currency Rates Display - only show when using real data */}
              {useRealData && (
                <div className="flex items-center gap-2">
                 
                  <HeaderCurrencyRates />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="real-data"
                  checked={useRealData}
                  onCheckedChange={setUseRealData}
                />
                <Label htmlFor="real-data" className="text-sm">
                  Dados Reais
                </Label>
                <Badge variant={useRealData ? 'default' : 'secondary'} className="text-xs">
                  {useRealData ? 'Supabase' : 'Mock'}
                </Badge>
              </div>
              
              
            </div>
            
            <Link href="/financial/debt-management/admin">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 " />
                
              </Button>
            </Link>
          </div>
        </div>
        
        <DebtNavigationTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          alerts={alerts}
        />
      </div>
      
      <div className="flex-1 overflow-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  )
}
