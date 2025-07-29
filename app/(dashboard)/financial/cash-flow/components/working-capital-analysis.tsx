import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WorkingCapitalData } from '@/types/cash-flow'
import { formatCurrency } from '@/utils/debt-calculations'
import { TrendingUp, AlertTriangle, Info } from 'lucide-react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

interface WorkingCapitalAnalysisProps {
  workingCapital: WorkingCapitalData
}

export function WorkingCapitalAnalysis({ workingCapital }: WorkingCapitalAnalysisProps) {
  // Format data for chart
  const chartData = workingCapital.monthlyRequirements.map(item => ({
    month: item.month,
    requirement: item.requirement / 1000000, // Convert to millions
    available: item.available / 1000000,
    gap: item.gap / 1000000,
    utilization: item.available > 0 ? Math.max(0, (item.requirement / item.available) * 100) : 0
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const requirement = data.requirement * 1000000
      const available = data.available * 1000000
      const gap = data.gap * 1000000
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Necessidade: {formatCurrency(requirement)}
            </p>
            <p className="text-green-600">
              Disponível: {formatCurrency(available)}
            </p>
            <p className={gap < 0 ? 'text-red-600' : 'text-green-600'}>
              {gap < 0 ? 'Gap' : 'Sobra'}: {formatCurrency(Math.abs(gap))}
            </p>
            <p className="text-gray-600">
              Utilização: {data.utilization.toFixed(1)}%
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Calculate summary metrics
  const totalRequirement = workingCapital.monthlyRequirements.reduce((sum, item) => sum + item.requirement, 0)
  const totalAvailable = workingCapital.monthlyRequirements.reduce((sum, item) => sum + item.available, 0)
  const totalGap = workingCapital.monthlyRequirements.reduce((sum, item) => sum + item.gap, 0)
  const monthsWithGap = workingCapital.monthlyRequirements.filter(item => item.gap < 0).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Análise de Capital de Giro
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Estimativa
            </Badge>
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Necessidade Total</div>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(totalRequirement)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Capital Disponível</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(totalAvailable)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Gap Total</div>
            <div className={`text-lg font-semibold ${totalGap < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(totalGap))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Meses Críticos</div>
            <div className="text-lg font-semibold text-amber-600">
              {monthsWithGap}/3
            </div>
          </div>
        </div>

        {/* Combined Chart */}
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => `R$${value}M`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar 
                yAxisId="left"
                dataKey="requirement" 
                fill="#3b82f6" 
                name="Necessidade (R$ milhões)"
                opacity={0.8}
              />
              <Bar 
                yAxisId="left"
                dataKey="available" 
                fill="#22c55e" 
                name="Disponível (R$ milhões)"
                opacity={0.8}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="utilization" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Utilização (%)"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Requirements Table */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Detalhamento Mensal</h4>
          {workingCapital.monthlyRequirements.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.month}</div>
                <div className="text-sm text-muted-foreground">{item.action}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-right">
                <div>
                  <div className="text-muted-foreground">Necessidade</div>
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(item.requirement)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Disponível</div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(item.available)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    {item.gap < 0 ? 'Gap' : 'Sobra'}
                  </div>
                  <div className={`font-semibold ${item.gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(item.gap))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Ratios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Índices de Liquidez</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Liquidez Corrente</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{workingCapital.currentRatio.toFixed(2)}</span>
                  <Badge variant={workingCapital.currentRatio >= 1.3 ? 'default' : 'destructive'}>
                    {workingCapital.currentRatio >= 1.3 ? 'Bom' : 'Baixo'}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Liquidez Seca</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{workingCapital.quickRatio.toFixed(2)}</span>
                  <Badge variant={workingCapital.quickRatio >= 1.0 ? 'default' : 'secondary'}>
                    {workingCapital.quickRatio >= 1.0 ? 'Adequado' : 'Atenção'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recomendações</h4>
            <div className="space-y-2 text-sm">
              {monthsWithGap > 0 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Ativar linhas de crédito em {monthsWithGap} meses críticos</span>
                </div>
              )}
              {totalGap > 0 && (
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Considerar aplicações de curto prazo para excedentes</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>Monitorar sazonalidade agrícola para otimização</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Alert */}
        <Alert className="mt-4" variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Metodologia:</strong> Análise baseada em padrões sazonais típicos do agronegócio brasileiro. 
            Necessidades estimadas considerando ciclos de plantio, insumos e colheita. 
            Para precisão máxima, integre dados de orçamento e fluxo de caixa operacional.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}