import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConversionCycleData } from '@/types/cash-flow'
import { RotateCcw, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react'

interface ConversionCycleVisualProps {
  conversionCycle: ConversionCycleData
}

export function ConversionCycleVisual({ conversionCycle }: ConversionCycleVisualProps) {
  // Calculate cycle components percentages for circular visualization
  const totalDays = conversionCycle.daysInventory + conversionCycle.daysSalesOutstanding + Math.abs(conversionCycle.daysPayableOutstanding)
  const inventoryAngle = (conversionCycle.daysInventory / totalDays) * 360
  const salesAngle = (conversionCycle.daysSalesOutstanding / totalDays) * 360
  const payableAngle = (Math.abs(conversionCycle.daysPayableOutstanding) / totalDays) * 360

  // SVG circle parameters
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const center = 100

  // Calculate stroke dash arrays for segments
  const inventoryDash = (inventoryAngle / 360) * circumference
  const salesDash = (salesAngle / 360) * circumference
  const payableDash = (payableAngle / 360) * circumference

  const improvementColor = conversionCycle.yearOverYearChange < 0 ? 'text-green-600' : 'text-red-600'
  const improvementIcon = conversionCycle.yearOverYearChange < 0 ? TrendingDown : TrendingUp
  const ImprovementIcon = improvementIcon

  const benchmarkComparison = conversionCycle.totalDays < conversionCycle.benchmarkDays ? 'Melhor' : 'Pior'
  const benchmarkColor = conversionCycle.totalDays < conversionCycle.benchmarkDays ? 'text-green-600' : 'text-amber-600'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Ciclo de Conversão de Caixa
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Estimativa
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Circular Visualization */}
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="12"
              />
              
              {/* Inventory segment */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray={`${inventoryDash} ${circumference}`}
                strokeDashoffset="0"
                opacity="0.8"
              />
              
              {/* Sales segment */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#22c55e"
                strokeWidth="12"
                strokeDasharray={`${salesDash} ${circumference}`}
                strokeDashoffset={-inventoryDash}
                opacity="0.8"
              />
              
              {/* Payable segment */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeDasharray={`${payableDash} ${circumference}`}
                strokeDashoffset={-(inventoryDash + salesDash)}
                opacity="0.8"
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{conversionCycle.totalDays}</div>
              <div className="text-sm text-muted-foreground">dias</div>
              <div className={`text-xs flex items-center gap-1 ${improvementColor}`}>
                <ImprovementIcon className="h-3 w-3" />
                {Math.abs(conversionCycle.yearOverYearChange)}d
              </div>
            </div>
          </div>

          {/* Metrics Details */}
          <div className="flex-1 space-y-4">
            {/* Cycle Components */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Componentes do Ciclo</h4>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Estoque (DIO)</div>
                    <div className="text-xs text-muted-foreground">Insumos → Produção</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{conversionCycle.daysInventory} dias</div>
                  <div className="text-xs text-muted-foreground">
                    {((conversionCycle.daysInventory / conversionCycle.totalDays) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Vendas (DSO)</div>
                    <div className="text-xs text-muted-foreground">Venda → Recebimento</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{conversionCycle.daysSalesOutstanding} dias</div>
                  <div className="text-xs text-muted-foreground">
                    {((conversionCycle.daysSalesOutstanding / conversionCycle.totalDays) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">Pagamentos (DPO)</div>
                    <div className="text-xs text-muted-foreground">Compra → Pagamento</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{conversionCycle.daysPayableOutstanding} dias</div>
                  <div className="text-xs text-muted-foreground">Reduz o ciclo</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">vs Ano Anterior</div>
                <div className={`text-lg font-semibold ${improvementColor} flex items-center justify-center gap-1`}>
                  <ImprovementIcon className="h-4 w-4" />
                  {conversionCycle.yearOverYearChange > 0 ? '+' : ''}{conversionCycle.yearOverYearChange} dias
                </div>
                <Badge variant={conversionCycle.yearOverYearChange < 0 ? 'default' : 'destructive'}>
                  {conversionCycle.yearOverYearChange < 0 ? 'Melhorou' : 'Piorou'}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">vs Benchmark Setor</div>
                <div className={`text-lg font-semibold ${benchmarkColor}`}>
                  {conversionCycle.benchmarkDays} dias
                </div>
                <Badge variant={conversionCycle.totalDays < conversionCycle.benchmarkDays ? 'default' : 'secondary'}>
                  {benchmarkComparison} que média
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Opportunities */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-sm mb-3">Oportunidades de Melhoria</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Gestão de Estoque</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Otimizar timing de compra de insumos e reduzir tempo de armazenagem
              </div>
              <div className="text-xs font-medium text-blue-600 mt-1">
                Potencial: -10 dias
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Cobrança</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Implementar antecipação de recebíveis e melhorar processo de cobrança
              </div>
              <div className="text-xs font-medium text-green-600 mt-1">
                Potencial: -5 dias
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Fornecedores</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Negociar melhores prazos de pagamento com fornecedores estratégicos
              </div>
              <div className="text-xs font-medium text-amber-600 mt-1">
                Potencial: +15 dias
              </div>
            </div>
          </div>
        </div>

        {/* Formula Explanation */}
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Cálculo:</strong> Ciclo = DIO (Dias Inventário) + DSO (Dias Vendas) - DPO (Dias Pagamento) = 
            {conversionCycle.daysInventory} + {conversionCycle.daysSalesOutstanding} - {Math.abs(conversionCycle.daysPayableOutstanding)} = {conversionCycle.totalDays} dias
            <br />
            <strong>Interpretação:</strong> Tempo médio entre investimento em insumos até recebimento das vendas.
          </AlertDescription>
        </Alert>

        {/* Data Source Warning */}
        <Alert className="mt-2" variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Dados estimados</strong> baseados em padrões típicos do agronegócio brasileiro. 
            Para análise precisa, integre dados de: gestão de estoque, vendas e compras, 
            além de prazos reais de fornecedores e clientes.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}