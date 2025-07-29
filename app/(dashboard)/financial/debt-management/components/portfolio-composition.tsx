'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DebtComposition } from '@/types/debt-management'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency, formatPercentage } from '@/utils/debt-calculations'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Info, Download } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PortfolioCompositionProps {
  composition: DebtComposition
}

const COLORS = {
  currency: ['#0088FE', '#00C49F', '#FFBB28'],
  rateType: ['#8884D8', '#82CA9D', '#FFC658', '#FF8042', '#FF6B6B'],
  institution: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'],
  purpose: ['#8884D8', '#82CA9D', '#FFC658', '#FF8042', '#0088FE'],
  collateral: ['#00C49F', '#FFBB28', '#0088FE', '#8884D8']
}

export function PortfolioComposition({ composition }: PortfolioCompositionProps) {
  const [activeTab, setActiveTab] = useState('currency')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const getChartData = () => {
    let rawData: any[] = []
    
    switch (activeTab) {
      case 'currency':
        rawData = composition.byCurrency.map(item => ({
          name: (item as any).name || item.currency,
          value: item.amount,
          percentage: item.percentage,
          avgRate: item.avgRate || 0,
          originalAmount: (item as any).originalAmount || item.amount
        }))
        break
      case 'rateType':
        rawData = ((composition as any).byType || composition.byRateType || []).map((item: any) => ({
          name: item.name || item.type, // Handle both real data (name) and mock data (type)
          value: item.amount,
          percentage: item.percentage,
          currentRate: item.currentRate,
          spread: item.spread,
          avgRate: item.avgRate
        }))
        break
      case 'institution':
        rawData = composition.byInstitution.map(item => ({
          name: (item as any).name || item.institution,
          value: item.amount,
          percentage: item.percentage,
          avgRate: item.avgRate,
          contracts: item.contracts,
          riskRating: item.riskRating
        }))
        break
      case 'purpose':
        rawData = (composition.byPurpose || []).map(item => ({
          name: item.purpose || 'Não especificado',
          value: item.amount,
          percentage: item.percentage,
          avgRate: item.avgRate
        }))
        break
      case 'collateral':
        rawData = (composition.byCollateral || []).map(item => ({
          name: item.type || 'Não especificado',
          value: item.amount,
          percentage: item.percentage,
          utilization: item.utilization
        }))
        break
      default:
        return []
    }

    // For institution tab, group smaller items into "Others" if more than 8 items
    if (activeTab === 'institution' && rawData.length > 8) {
      // Sort by value descending
      const sortedData = [...rawData].sort((a, b) => b.value - a.value)
      
      // Take top 7 institutions
      const topInstitutions = sortedData.slice(0, 7)
      
      // Group remaining institutions into "Others"
      const otherInstitutions = sortedData.slice(7)
      const othersTotal = otherInstitutions.reduce((sum, item) => sum + item.value, 0)
      const othersPercentage = otherInstitutions.reduce((sum, item) => sum + item.percentage, 0)
      const othersAvgRate = otherInstitutions.length > 0 
        ? otherInstitutions.reduce((sum, item) => sum + (item.avgRate || 0), 0) / otherInstitutions.length
        : 0
      
      if (othersTotal > 0) {
        const othersItem = {
          name: `Outras (${otherInstitutions.length})`,
          value: othersTotal,
          percentage: othersPercentage,
          avgRate: othersAvgRate,
          contracts: otherInstitutions.reduce((sum, item) => sum + (item.contracts || 0), 0),
          isOthersGroup: true,
          institutions: otherInstitutions.map(item => item.name)
        }
        
        return [...topInstitutions, othersItem]
      }
      
      return topInstitutions
    }
    
    return rawData
  }

  const chartData = getChartData()
  const colors = COLORS[activeTab as keyof typeof COLORS] || COLORS.currency

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">{formatPercentage(data.percentage)}</p>
          {data.avgRate && (
            <p className="text-sm">Taxa média: {formatPercentage(data.avgRate)} a.a.</p>
          )}
          {data.utilization && (
            <p className="text-sm">Utilização: {formatPercentage(data.utilization)}</p>
          )}
          {data.contracts && (
            <p className="text-sm">Contratos: {data.contracts}</p>
          )}
          {data.isOthersGroup && data.institutions && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-1">Inclui:</p>
              <div className="text-xs space-y-0.5 max-h-20 overflow-y-auto">
                {data.institutions.map((inst: string, idx: number) => (
                  <div key={idx} className="truncate">{inst}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const renderCenterContent = () => {
    const totalDebt = chartData.reduce((sum, item) => sum + item.value, 0)
    const selectedData = activeIndex !== null ? chartData[activeIndex] : null

    if (selectedData) {
      return (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{selectedData.name}</p>
          <p className="text-2xl font-bold">{formatCurrency(selectedData.value)}</p>
          <p className="text-sm">{formatPercentage(selectedData.percentage)}</p>
        </div>
      )
    }

    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
        <p className="text-sm">{chartData.length} categorias</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Composição do Portfólio
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualize a composição da dívida por diferentes dimensões</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="currency">Moeda</TabsTrigger>
            <TabsTrigger value="rateType">Modalidade</TabsTrigger>
            <TabsTrigger value="institution">Instituição</TabsTrigger>
            <TabsTrigger value="purpose">Finalidade</TabsTrigger>
            <TabsTrigger value="collateral">Garantia</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4 flex flex-col">
            <div className="h-[365px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center content */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {renderCenterContent()}
              </div>
            </div>

            {/* Additional info based on selected tab - with consistent spacing */}
            <div className="mt-auto h-[80px] grid grid-cols-3 gap-4 items-end">
              {activeTab === 'currency' && (
                <>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Taxa média BRL:</span>
                    <span className="ml-2 font-medium">
                      {formatPercentage(composition.byCurrency.find(c => c.currency === 'BRL')?.avgRate || 0)} a.a.
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Taxa média USD:</span>
                    <span className="ml-2 font-medium">
                      {formatPercentage(composition.byCurrency.find(c => c.currency === 'USD')?.avgRate || 0)} a.a.
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Taxa média EUR:</span>
                    <span className="ml-2 font-medium">
                      {formatPercentage(composition.byCurrency.find(c => c.currency === 'EUR')?.avgRate || 0)} a.a.
                    </span>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}