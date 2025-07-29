'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MaturityProfile as MaturityProfileType } from '@/types/debt-management'
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'
import { formatCurrency } from '@/utils/debt-calculations'
import { Button } from '@/components/ui/button'
import { Info, Download, Maximize2 } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

interface MaturityProfileProps {
  maturityProfile: MaturityProfileType[]
}

export function MaturityProfile({ maturityProfile }: MaturityProfileProps) {
  const [view, setView] = useState('5years')
  const [showCapacity, setShowCapacity] = useState(true)

  // Filter data based on selected view
  const getFilteredData = () => {
    const quarters = view === '5years' ? 20 : view === '3years' ? 12 : 40
    return maturityProfile.slice(0, quarters)
  }

  const data = getFilteredData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t text-sm">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            {payload[0].payload.dscr && (
              <div className="flex justify-between mt-1">
                <span>DSCR:</span>
                <span className={`font-medium ${payload[0].payload.dscr >= 1.25 ? 'text-green-600' : 'text-red-600'}`}>
                  {payload[0].payload.dscr.toFixed(2)}x
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const totalDebt = maturityProfile.reduce((sum, item) => sum + item.total, 0)
  
  // Calculate next 12 months from current date
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3)
  
  const next12MonthsDebt = maturityProfile
    .filter(item => {
      // Include current quarter and next 3 quarters (12 months total)
      if (item.year === currentYear) {
        return item.quarter >= currentQuarter && item.quarter <= currentQuarter + 3
      } else if (item.year === currentYear + 1) {
        return item.quarter <= (currentQuarter + 3) - 4 // Overflow to next year
      }
      return false
    })
    .reduce((sum, item) => sum + item.total, 0)
  
  const nearTermPercentage = totalDebt > 0 ? ((next12MonthsDebt / totalDebt) * 100).toFixed(1) : '0.0'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Perfil de Vencimento</CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Cronograma de pagamentos de principal e juros</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowCapacity(!showCapacity)}
          >
            {showCapacity ? 'Ocultar' : 'Mostrar'} Capacidade
          </Button>
          <Button variant="ghost" size="sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={setView}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="3years">3 Anos</TabsTrigger>
            <TabsTrigger value="5years">5 Anos</TabsTrigger>
            <TabsTrigger value="10years">10 Anos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={view} className="mt-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="principalBRL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="principalUSD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="interest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFBB28" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                    interval={view === '10years' ? 3 : view === '5years' ? 1 : 0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value / 1000000) + 'M'}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        principalBRL: 'Principal BRL',
                        principalUSD: 'Principal USD',
                        interest: 'Juros'
                      }
                      return labels[value] || value
                    }}
                  />
                  
                  <Area
                    type="monotone"
                    dataKey="principalBRL"
                    stackId="1"
                    stroke="#0088FE"
                    fillOpacity={1}
                    fill="url(#principalBRL)"
                  />
                  <Area
                    type="monotone"
                    dataKey="principalUSD"
                    stackId="1"
                    stroke="#00C49F"
                    fillOpacity={1}
                    fill="url(#principalUSD)"
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    stackId="1"
                    stroke="#FFBB28"
                    fillOpacity={1}
                    fill="url(#interest)"
                  />
                  
                  {showCapacity && (
                    <ReferenceLine 
                      y={data[0]?.paymentCapacity || 0} 
                      stroke="#82CA9D" 
                      strokeDasharray="5 5"
                      label={{ value: "Capacidade de Pagamento", position: "top" }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Summary metrics */}
            <div className="mt-4 h-[80px] grid grid-cols-3 gap-4 text-sm">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">Total a Pagar</p>
                <p className="text-lg font-semibold">{formatCurrency(totalDebt)}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">Próximos 12 meses</p>
                <p className="text-lg font-semibold">{formatCurrency(next12MonthsDebt)}</p>
                <p className="text-xs text-muted-foreground">{nearTermPercentage}% do total</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground">DSCR Médio</p>
                <p className="text-lg font-semibold">
                  {(data.reduce((sum, item) => sum + item.dscr, 0) / data.length).toFixed(2)}x
                </p>
                <p className="text-xs text-green-600">Acima do mínimo</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}