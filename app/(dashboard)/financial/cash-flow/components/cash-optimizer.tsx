import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OptimizationOpportunity } from '@/types/cash-flow'
import { formatCurrency } from '@/utils/debt-calculations'
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Calculator,
  Target,
  ArrowRight
} from 'lucide-react'

interface CashOptimizerProps {
  opportunities: OptimizationOpportunity[]
}

export function CashOptimizer({ opportunities }: CashOptimizerProps) {
  // Calculate total potential benefit
  const totalBenefit = opportunities.reduce((sum, opp) => sum + opp.potentialBenefit, 0)
  const totalCost = opportunities.reduce((sum, opp) => sum + opp.implementationCost, 0)
  const netBenefit = totalBenefit - totalCost
  const averageROI = opportunities.reduce((sum, opp) => sum + opp.roi, 0) / opportunities.length

  const getOpportunityIcon = (type: OptimizationOpportunity['type']) => {
    switch (type) {
      case 'receivables_factoring':
        return <DollarSign className="h-4 w-4" />
      case 'payment_terms':
        return <Clock className="h-4 w-4" />
      case 'excess_investment':
        return <TrendingUp className="h-4 w-4" />
      case 'debt_restructure':
        return <Calculator className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getOpportunityColor = (type: OptimizationOpportunity['type']) => {
    switch (type) {
      case 'receivables_factoring':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'payment_terms':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'excess_investment':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'debt_restructure':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRoiColor = (roi: number) => {
    if (roi === Infinity) return 'text-green-600'
    if (roi > 10) return 'text-green-600'
    if (roi > 5) return 'text-blue-600'
    if (roi > 0) return 'text-amber-600'
    return 'text-red-600'
  }

  const formatROI = (roi: number) => {
    if (roi === Infinity) return '∞'
    return `${roi.toFixed(1)}x`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Otimizador de Caixa
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Simulação
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Benefício Total</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(totalBenefit)}
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Custo Implementação</div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(totalCost)}
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Benefício Líquido</div>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(netBenefit)}
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-sm text-muted-foreground">ROI Médio</div>
            <div className={`text-lg font-semibold ${getRoiColor(averageROI)}`}>
              {formatROI(averageROI)}
            </div>
          </div>
        </div>

        {/* Optimization Opportunities */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Oportunidades Identificadas</h4>
          
          {opportunities.map((opportunity, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-2 ${getOpportunityColor(opportunity.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getOpportunityIcon(opportunity.type)}
                    <h5 className="font-medium">{opportunity.title}</h5>
                    {!opportunity.hasRealData && (
                      <Badge variant="secondary" className="text-xs">
                        Estimativa
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {opportunity.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Benefício</div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(opportunity.potentialBenefit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Custo</div>
                      <div className="font-semibold text-red-600">
                        {formatCurrency(opportunity.implementationCost)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Prazo</div>
                      <div className="font-semibold">
                        {opportunity.timeframe}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">ROI</div>
                      <div className={`font-semibold ${getRoiColor(opportunity.roi)}`}>
                        {formatROI(opportunity.roi)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <Button size="sm" variant="outline">
                    Simular
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What-if Simulator */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-sm mb-3">Simulador What-If</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium mb-2">Cenário Conservador</div>
              <div className="text-xs text-muted-foreground mb-2">
                Implementar apenas oportunidades de baixo risco
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Benefício:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(totalBenefit * 0.3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Risco:</span>
                  <Badge variant="default" className="text-xs">Baixo</Badge>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Cenário Moderado</div>
              <div className="text-xs text-muted-foreground mb-2">
                Implementar maioria das oportunidades
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Benefício:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(totalBenefit * 0.7)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Risco:</span>
                  <Badge variant="secondary" className="text-xs">Médio</Badge>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Cenário Agressivo</div>
              <div className="text-xs text-muted-foreground mb-2">
                Implementar todas as oportunidades
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Benefício:</span>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(totalBenefit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Risco:</span>
                  <Badge variant="destructive" className="text-xs">Alto</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-6">
          <Button className="flex-1">
            <Calculator className="h-4 w-4 mr-2" />
            Executar Simulação Completa
          </Button>
          <Button variant="outline">
            Exportar Análise
          </Button>
        </div>

        {/* Disclaimers */}
        <div className="space-y-2 mt-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Simulações baseadas em estimativas:</strong> Resultados reais podem variar. 
              Fatores como condições de mercado, sazonalidade e capacidade operacional devem ser considerados.
            </AlertDescription>
          </Alert>
          
          <Alert variant="default" className="border-blue-200 bg-blue-50/50">
            <Target className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              <strong>Recomendação:</strong> Priorize oportunidades com ROI {'>'} 5x e prazo de implementação {'<'} 30 dias. 
              Considere impacto operacional e disponibilidade de recursos para execução.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}