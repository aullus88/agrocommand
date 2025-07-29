import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ReceivablesData, PayablesData } from '@/types/cash-flow'
import { formatCurrency } from '@/utils/debt-calculations'
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface AgingAnalysisProps {
  receivables: ReceivablesData
  payables: PayablesData
}

export function AgingAnalysis({ receivables, payables }: AgingAnalysisProps) {
  // Prepare data for mirrored chart
  const receivablesData = receivables.aging.map(bucket => ({
    name: bucket.name.replace('A receber ', '').replace('Vencidos ', 'Venc. '),
    amount: bucket.amount / 1000000, // Convert to millions
    count: bucket.count,
    percentage: bucket.percentage,
    type: 'receivables'
  }))

  const payablesData = payables.aging.map(bucket => ({
    name: bucket.name.replace('A vencer ', '').replace('Vencidos ', 'Venc. '),
    amount: -bucket.amount / 1000000, // Negative for mirrored effect
    count: bucket.count,
    percentage: bucket.percentage,
    type: 'payables'
  }))

  // Combine data for chart
  const combinedData = receivablesData.map((item, index) => ({
    category: item.name,
    receivables: item.amount,
    payables: payablesData[index]?.amount || 0,
    receivablesCount: item.count,
    payablesCount: payablesData[index]?.count || 0
  }))

  // Color scheme
  const getBarColor = (value: number, isOverdue: boolean) => {
    if (isOverdue) return '#ef4444' // Red for overdue
    if (Math.abs(value) > 50) return '#f59e0b' // Amber for large amounts
    return value > 0 ? '#22c55e' : '#3b82f6' // Green for receivables, blue for payables
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const receivablesValue = payload.find((p: any) => p.dataKey === 'receivables')?.value || 0
      const payablesValue = payload.find((p: any) => p.dataKey === 'payables')?.value || 0
      const data = payload[0].payload

      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-600">
              Recebíveis: {formatCurrency(Math.abs(receivablesValue) * 1000000)} ({data.receivablesCount} itens)
            </p>
            <p className="text-blue-600">
              Pagáveis: {formatCurrency(Math.abs(payablesValue) * 1000000)} ({data.payablesCount} itens)
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
          <CardTitle className="flex items-center gap-2">
            Análise de Aging - Recebíveis vs Pagáveis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Recebíveis: Mock
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
              Pagáveis: Real
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Recebíveis</h3>
              {!receivables.hasRealData && (
                <Badge variant="secondary" className="text-xs">
                  Estimativa
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(receivables.total)}
            </div>
            <div className="text-sm text-muted-foreground">
              Vencidos: {formatCurrency(receivables.overdue)} • 
              Prazo médio: {receivables.averageDays} dias
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Pagáveis</h3>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs text-green-600">
                  {payables.debtPaymentsPercentage.toFixed(1)}% Dívidas
                </Badge>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(payables.total)}
            </div>
            <div className="text-sm text-muted-foreground">
              Vencendo 7d: {formatCurrency(payables.dueIn7Days)} • 
              Prazo médio: {payables.averageDays} dias
            </div>
          </div>
        </div>

        {/* Mirrored Bar Chart */}
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={combinedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => `R$${Math.abs(value)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Receivables (positive) */}
              <Bar dataKey="receivables" name="Recebíveis">
                {combinedData.map((entry, index) => (
                  <Cell 
                    key={`receivables-${index}`} 
                    fill={getBarColor(entry.receivables, entry.category.includes('Venc.'))} 
                  />
                ))}
              </Bar>
              
              {/* Payables (negative for mirror effect) */}
              <Bar dataKey="payables" name="Pagáveis">
                {combinedData.map((entry, index) => (
                  <Cell 
                    key={`payables-${index}`} 
                    fill={getBarColor(entry.payables, entry.category.includes('Venc.'))} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Aging Buckets Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Receivables Details */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              Detalhes Recebíveis
              {!receivables.hasRealData && <AlertTriangle className="h-3 w-3 text-amber-500" />}
            </h4>
            <div className="space-y-2">
              {receivables.aging.map((bucket, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-green-50 rounded">
                  <div>
                    <div className="font-medium">{bucket.name}</div>
                    <div className="text-xs text-muted-foreground">{bucket.count} itens</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(bucket.amount)}</div>
                    <div className="text-xs text-muted-foreground">{bucket.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payables Details */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              Detalhes Pagáveis
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </h4>
            <div className="space-y-2">
              {payables.aging.map((bucket, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                  <div>
                    <div className="font-medium">{bucket.name}</div>
                    <div className="text-xs text-muted-foreground">{bucket.count} itens</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(bucket.amount)}</div>
                    <div className="text-xs text-muted-foreground">{bucket.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-sm mb-3">Insights Principais</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">Liquidez</div>
                <div className="text-xs text-muted-foreground">
                  Razão R/P: {(receivables.total / payables.total).toFixed(2)}x
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div>
                <div className="font-medium">Vencidos</div>
                <div className="text-xs text-muted-foreground">
                  R: {((receivables.overdue / receivables.total) * 100).toFixed(1)}% •
                  P: {((payables.aging.filter(b => b.name.includes('Vencidos')).reduce((s, b) => s + b.amount, 0) / payables.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium">Dívidas Reais</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(payables.debtPaymentsTotal)} ({payables.debtPaymentsPercentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Alerts */}
        <div className="space-y-2 mt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Pagáveis:</strong> Dados reais incluem {payables.debtPaymentsPercentage.toFixed(1)}% de pagamentos de dívidas do sistema. 
              Demais pagáveis são estimativas baseadas em padrões operacionais.
            </AlertDescription>
          </Alert>
          
          {!receivables.hasRealData && (
            <Alert variant="default" className="border-amber-200 bg-amber-50/50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs">
                <strong>Recebíveis:</strong> Dados estimados baseados em padrões de venda típicos do agronegócio. 
                Para análise precisa, integre dados de vendas/contratos.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}