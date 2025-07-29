import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContingencyData } from '@/types/cash-flow'
import { formatCurrency } from '@/utils/debt-calculations'
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Zap,
  TrendingDown,
  Activity,
  FileText,
  Target
} from 'lucide-react'
import {
  Progress
} from '@/components/ui/progress'

interface ContingencyPanelProps {
  contingency: ContingencyData
}

export function ContingencyPanel({ contingency }: ContingencyPanelProps) {
  // Calculate total liquidity available
  const totalLiquidity = contingency.liquiditySources.reduce((sum, source) => sum + source.amount, 0)
  
  // Find fastest access source
  const fastestAccess = contingency.liquiditySources.reduce((fastest, source) => 
    source.timeToAccess < fastest.timeToAccess ? source : fastest
  )

  // Calculate weighted average cost
  const weightedCost = contingency.liquiditySources.reduce((totalCost, source) => 
    totalCost + (source.cost * source.amount)
  , 0) / totalLiquidity

  const getAccessTimeColor = (timeToAccess: string) => {
    if (timeToAccess === 'Imediato') return 'text-green-600'
    if (timeToAccess.includes('dia') && parseInt(timeToAccess) <= 5) return 'text-blue-600'
    if (timeToAccess.includes('dia') && parseInt(timeToAccess) <= 15) return 'text-amber-600'
    return 'text-red-600'
  }

  const getCostColor = (cost: number) => {
    if (cost === 0) return 'text-green-600'
    if (cost <= 0.01) return 'text-blue-600'
    if (cost <= 0.05) return 'text-amber-600'
    return 'text-red-600'
  }

  const getRiskColor = (survivalMonths: number) => {
    if (survivalMonths >= 12) return 'text-green-600'
    if (survivalMonths >= 6) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Painel de Contingência
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Cenários
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Liquidity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Liquidez Total</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(totalLiquidity)}
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Acesso Mais Rápido</div>
            <div className={`text-lg font-semibold ${getAccessTimeColor(fastestAccess.timeToAccess)}`}>
              {fastestAccess.timeToAccess}
            </div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Custo Médio</div>
            <div className={`text-lg font-semibold ${getCostColor(weightedCost)}`}>
              {(weightedCost * 100).toFixed(2)}% a.m.
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Fontes Disponíveis</div>
            <div className="text-lg font-semibold text-purple-600">
              {contingency.liquiditySources.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liquidity Sources */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Fontes de Liquidez Emergencial
            </h4>
            <div className="space-y-3">
              {contingency.liquiditySources.map((source, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{source.source}</h5>
                    <Badge variant="outline">
                      {formatCurrency(source.amount)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">Tempo de Acesso</div>
                      <div className={`font-semibold ${getAccessTimeColor(source.timeToAccess)}`}>
                        {source.timeToAccess}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Custo</div>
                      <div className={`font-semibold ${getCostColor(source.cost)}`}>
                        {source.cost === 0 ? 'Gratuito' : `${(source.cost * 100).toFixed(2)}% a.m.`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar showing portion of total liquidity */}
                  <div className="mt-2">
                    <Progress 
                      value={(source.amount / totalLiquidity) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {((source.amount / totalLiquidity) * 100).toFixed(1)}% do total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stress Scenarios */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Cenários de Stress
            </h4>
            <div className="space-y-3">
              {contingency.stressScenarios.map((scenario, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{scenario.name}</h5>
                    <Badge 
                      variant={scenario.survivalMonths >= 6 ? 'default' : 'destructive'}
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {scenario.survivalMonths}m
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    {scenario.description}
                  </p>
                  
                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-1">Tempo de Sobrevivência</div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(scenario.survivalMonths / 12) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className={`text-xs font-semibold ${getRiskColor(scenario.survivalMonths)}`}>
                        {scenario.survivalMonths} meses
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Ações de Mitigação</div>
                    <div className="space-y-1">
                      {scenario.mitigationActions.slice(0, 3).map((action, actionIndex) => (
                        <div key={actionIndex} className="flex items-center gap-2 text-xs">
                          <Target className="h-3 w-3 text-blue-600" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Action Plan */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Plano de Ação Emergencial
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">Nível 1 - Crítico</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Saldo &lt; R$ 10M ou &lt; 15 dias de caixa
              </div>
              <div className="space-y-1 text-xs">
                <div>• Ativar linha crédito imediata</div>
                <div>• Antecipar todos recebíveis</div>
                <div>• Suspender pagamentos não críticos</div>
                <div>• Acionar seguro-safra</div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-amber-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium text-sm">Nível 2 - Atenção</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Saldo &lt; R$ 25M ou &lt; 30 dias de caixa
              </div>
              <div className="space-y-1 text-xs">
                <div>• Negociar prazos com fornecedores</div>
                <div>• Acelerar cobrança</div>
                <div>• Revisar orçamento</div>
                <div>• Preparar documentação crédito</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Activity className="h-4 w-4" />
                <span className="font-medium text-sm">Nível 3 - Preventivo</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Saldo &lt; R$ 50M ou tendência negativa
              </div>
              <div className="space-y-1 text-xs">
                <div>• Monitorar indicadores</div>
                <div>• Otimizar aplicações</div>
                <div>• Revisar projeções</div>
                <div>• Comunicar stakeholders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-6">
          <Button variant="destructive" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Ativar Plano Emergencial
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório Contingência
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Simular Cenários
          </Button>
        </div>

        {/* Disclaimers */}
        <div className="space-y-2 mt-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Cenários simulados:</strong> Tempos de sobrevivência são estimativas baseadas em padrões históricos. 
              Condições reais podem variar significativamente dependendo de fatores externos e operacionais.
            </AlertDescription>
          </Alert>
          
          <Alert variant="default" className="border-blue-200 bg-blue-50/50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              <strong>Preparação é fundamental:</strong> Mantenha documentação atualizada e relacionamentos bancários ativos. 
              Teste periodicamente o acesso às fontes de liquidez emergencial.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}