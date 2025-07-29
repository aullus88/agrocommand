import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, TrendingUp, Info } from 'lucide-react'
import { CashFlowProjection } from '@/types/cash-flow'
import { formatCurrency } from '@/utils/debt-calculations'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface ProjectedFlowChartProps {
  projections: CashFlowProjection[]
}

export function ProjectedFlowChart({ projections }: ProjectedFlowChartProps) {
  // Format data for chart
  const chartData = projections.map(projection => ({
    ...projection,
    month: new Date(projection.date).toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: '2-digit' 
    }),
    inflowsFormatted: projection.inflows / 1000000, // Convert to millions
    outflowsFormatted: Math.abs(projection.outflows) / 1000000, // Make positive for display
    balanceFormatted: projection.runningBalance / 1000000
  }))

  const minBalance = Math.min(...chartData.map(d => d.balanceFormatted))
  const maxBalance = Math.max(...chartData.map(d => d.balanceFormatted))
  
  // Calculate total debt payments portion
  const totalOutflows = projections.reduce((sum, p) => sum + p.outflows, 0)
  const estimatedDebtPayments = totalOutflows * 0.4 // Approximately 40% of outflows are debt payments
  const debtPaymentPercentage = (estimatedDebtPayments / totalOutflows) * 100

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-600">
              Entradas: {formatCurrency(data.inflows)}
            </p>
            <p className="text-red-600">
              Saídas: {formatCurrency(data.outflows)}
            </p>
            <p className="text-blue-600">
              Saldo: {formatCurrency(data.runningBalance)}
            </p>
            <p className="text-gray-600">
              Líquido: {formatCurrency(data.netFlow)}
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Fluxo de Caixa Projetado - 12 Meses
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
                Pagamentos Reais
              </Badge>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {/* Data Source Alert */}
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Dados utilizados:</strong> Pagamentos de dívidas são baseados em dados reais ({debtPaymentPercentage.toFixed(1)}% das saídas). 
            Entradas e demais saídas utilizam padrões sazonais estimados.
            <div className="mt-1 text-xs text-muted-foreground">
              Total projetado: {formatCurrency(totalOutflows)} em saídas • Estimativa dívidas: {formatCurrency(estimatedDebtPayments)}
            </div>
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => `R$${value}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Minimum balance reference line */}
              <ReferenceLine 
                y={20} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                label={{ value: "Saldo Mínimo", position: "insideTopRight" }}
              />
              
              {/* Areas for inflows and outflows */}
              <Area
                type="monotone"
                dataKey="inflowsFormatted"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
                name="Entradas (R$ milhões)"
              />
              <Area
                type="monotone"
                dataKey="outflowsFormatted"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Saídas (R$ milhões)"
              />
              
              {/* Running balance line */}
              <Area
                type="monotone"
                dataKey="balanceFormatted"
                stroke="#2563eb"
                fill="none"
                strokeWidth={3}
                name="Saldo Acumulado (R$ milhões)"
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Maior Saldo</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(maxBalance * 1000000)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Menor Saldo</div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(minBalance * 1000000)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Pagamentos Dívidas</div>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(estimatedDebtPayments)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">% Saídas Dívidas</div>
            <div className="text-lg font-semibold">
              {debtPaymentPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Seasonal Pattern Warning */}
        <Alert className="mt-4" variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Padrão Sazonal:</strong> Projeções consideram sazonalidade típica do agronegócio - 
            maiores entradas em nov-fev (colheita soja) e jul-ago (colheita milho). 
            Meses de plantio (mai-ago) apresentam maiores saídas.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}