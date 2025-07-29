'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/utils/debt-calculations'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart3 } from 'lucide-react'

interface CashFlowChartProps {
  data: Array<{
    period: string
    startDate: Date
    endDate: Date
    totalAmount: number
    principalAmount: number
    interestAmount: number
    paymentCount: number
  }>
  groupBy: 'week' | 'month'
}

export function CashFlowChart({ data, groupBy }: CashFlowChartProps) {
  // Prepare chart data
  const chartData = data.map(item => ({
    period: groupBy === 'week' 
      ? `S${format(item.startDate, 'ww', { locale: ptBR })}`
      : format(item.startDate, 'MMM/yy', { locale: ptBR }),
    fullPeriod: groupBy === 'week'
      ? `${format(item.startDate, 'dd/MM', { locale: ptBR })} - ${format(item.endDate, 'dd/MM', { locale: ptBR })}`
      : format(item.startDate, 'MMMM yyyy', { locale: ptBR }),
    principal: item.principalAmount,
    interest: item.interestAmount,
    total: item.totalAmount,
    count: item.paymentCount
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2">{data.fullPeriod}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Principal: {formatCurrency(data.principal)}
            </p>
            <p className="text-orange-600">
              Juros: {formatCurrency(data.interest)}
            </p>
            <p className="font-medium">
              Total: {formatCurrency(data.total)}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {data.count} pagamento{data.count > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribuição de Vencimentos por {groupBy === 'week' ? 'Semana' : 'Mês'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="period" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `R$ ${(value / 1000000).toFixed(1)}M`
                  } else if (value >= 1000) {
                    return `R$ ${(value / 1000).toFixed(0)}K`
                  }
                  return `R$ ${value}`
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    principal: 'Principal',
                    interest: 'Juros'
                  }
                  return labels[value] || value
                }}
              />
              <Bar 
                dataKey="principal" 
                stackId="a" 
                fill="#3b82f6" 
                name="principal"
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="interest" 
                stackId="a" 
                fill="#f97316" 
                name="interest"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total Principal</p>
            <p className="text-lg font-medium">
              {formatCurrency(data.reduce((sum, item) => sum + item.principalAmount, 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Juros</p>
            <p className="text-lg font-medium">
              {formatCurrency(data.reduce((sum, item) => sum + item.interestAmount, 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Média por Período</p>
            <p className="text-lg font-medium">
              {formatCurrency(
                data.length > 0 
                  ? data.reduce((sum, item) => sum + item.totalAmount, 0) / data.length
                  : 0
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Períodos com Pagamento</p>
            <p className="text-lg font-medium">
              {data.length} {groupBy === 'week' ? 'semanas' : 'meses'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}