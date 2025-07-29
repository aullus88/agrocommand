'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatCurrency } from '@/utils/debt-calculations'
import { TrendingUp } from 'lucide-react'

interface DebtEvolutionChartProps {
  totalDebt: number
}

export function DebtEvolutionChart({ totalDebt }: DebtEvolutionChartProps) {
  // Mock historical data - in real implementation, this would come from the database
  const historicalData = [
    { month: 'Jul/24', value: 500000000, event: null },
    { month: 'Ago/24', value: 520000000, event: null },
    { month: 'Set/24', value: 605000000, event: 'Financiamento nova frota' },
    { month: 'Out/24', value: 610000000, event: null },
    { month: 'Nov/24', value: 615000000, event: null },
    { month: 'Dez/24', value: 620000000, event: null },
    { month: 'Jan/25', value: 740000000, event: 'Custeio safra 24/25' },
    { month: 'Fev/25', value: 735000000, event: null },
    { month: 'Mar/25', value: 730000000, event: null },
    { month: 'Abr/25', value: 725000000, event: null },
    { month: 'Mai/25', value: 680000000, event: 'Liquidação antecipada BB' },
    { month: 'Jun/25', value: 690000000, event: null },
    { month: 'Jul/25', value: totalDebt, event: 'Atual' }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const point = historicalData.find(d => d.month === label)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm font-medium">{formatCurrency(data.value)}</p>
          {point?.event && (
            <p className="text-xs text-blue-600 mt-1">{point.event}</p>
          )}
        </div>
      )
    }
    return null
  }

  const minValue = Math.min(...historicalData.map(d => d.value))
  const maxValue = Math.max(...historicalData.map(d => d.value))
  const yAxisMin = Math.floor(minValue * 0.9 / 50000000) * 50000000
  const yAxisMax = Math.ceil(maxValue * 1.1 / 50000000) * 50000000

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução da Dívida - Últimos 12 Meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={historicalData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                className="text-xs"
                domain={[yAxisMin, yAxisMax]}
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickFormatter={(value) => {
                  if (value >= 1000000000) {
                    return `R$ ${(value / 1000000000).toFixed(1)}B`
                  }
                  return `R$ ${(value / 1000000).toFixed(0)}M`
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Event markers */}
              {historicalData
                .filter(d => d.event && d.event !== 'Atual')
                .map((event, index) => (
                  <ReferenceLine
                    key={index}
                    x={event.month}
                    stroke="#3b82f6"
                    strokeDasharray="3 3"
                  />
                ))
              }
              
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props: any) => {
                  const point = historicalData.find(d => d.month === props.payload.month)
                  if (point?.event) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={6}
                        fill="#3b82f6"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                  }
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="#3b82f6"
                    />
                  )
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Events */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm">Marcos Importantes:</h4>
          {historicalData
            .filter(d => d.event && d.event !== 'Atual')
            .map((event, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                <div>
                  <span className="font-medium">{event.month}:</span>{' '}
                  <span className="text-muted-foreground">{event.event}</span>
                  {event.value > (historicalData[historicalData.findIndex(d => d.month === event.month) - 1]?.value || 0) ? (
                    <span className="text-green-600 ml-2">
                      +{formatCurrency(event.value - (historicalData[historicalData.findIndex(d => d.month === event.month) - 1]?.value || 0))}
                    </span>
                  ) : (
                    <span className="text-red-600 ml-2">
                      {formatCurrency(event.value - (historicalData[historicalData.findIndex(d => d.month === event.month) - 1]?.value || 0))}
                    </span>
                  )}
                </div>
              </div>
            ))
          }
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Variação Total</p>
            <p className="text-lg font-medium">
              {((totalDebt - historicalData[0].value) / historicalData[0].value * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pico Histórico</p>
            <p className="text-lg font-medium">
              {formatCurrency(maxValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Menor Valor</p>
            <p className="text-lg font-medium">
              {formatCurrency(minValue)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}