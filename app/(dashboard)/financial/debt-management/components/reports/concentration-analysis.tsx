'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/utils/debt-calculations'
import { InstitutionBreakdown } from '@/types/debt-management'

interface ConcentrationAnalysisProps {
  institutions: InstitutionBreakdown[]
  totalDebt: number
}

export function ConcentrationAnalysis({ institutions, totalDebt }: ConcentrationAnalysisProps) {
  // Calculate concentration metrics
  const topThreeConcentration = institutions
    .slice(0, 3)
    .reduce((sum, inst) => sum + inst.percentage, 0)

  const herfindahlIndex = institutions
    .reduce((sum, inst) => sum + Math.pow(inst.percentage / 100, 2), 0)

  const concentrationRisk = 
    herfindahlIndex > 0.25 ? 'high' :
    herfindahlIndex > 0.15 ? 'medium' : 'low'

  const getRiskColor = (percentage: number) => {
    if (percentage > 30) return 'text-red-600 bg-red-50'
    if (percentage > 20) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">Alto Risco</Badge>
      case 'medium':
        return <Badge variant="secondary">Risco Médio</Badge>
      case 'low':
        return <Badge variant="default">Baixo Risco</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Concentration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Top 3 Concentração
                </p>
                <p className="text-2xl font-bold">
                  {topThreeConcentration.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Limite recomendado: 60%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getRiskColor(topThreeConcentration)}`}>
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Índice Herfindahl
                </p>
                <p className="text-2xl font-bold">
                  {(herfindahlIndex * 10000).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Concentração de mercado
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avaliação de Risco
                </p>
                <div className="mt-2">
                  {getRiskBadge(concentrationRisk)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado na distribuição
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institution Details */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Instituição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {institutions.map((institution, index) => {
            const isOverLimit = institution.percentage > 25
            
            return (
              <div key={institution.institution} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {institution.institution}
                        {isOverLimit && (
                          <Badge variant="destructive" className="text-xs">
                            Acima do limite
                          </Badge>
                        )}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{institution.contracts} contratos</span>
                        <span>Taxa média: {institution.avgRate.toFixed(1)}%</span>
                        <span>Rating: {institution.riskRating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(institution.amount)}</p>
                    <p className={`text-sm font-medium ${
                      isOverLimit ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {institution.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={institution.percentage} 
                    className="h-2"
                  />
                  {isOverLimit && (
                    <div 
                      className="absolute top-0 left-0 h-2 bg-red-500 rounded-full transition-all"
                      style={{ width: `${institution.percentage}%` }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      {institutions.some(inst => inst.percentage > 25) && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Alertas de Concentração:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {institutions
                .filter(inst => inst.percentage > 25)
                .map(inst => (
                  <li key={inst.institution}>
                    {inst.institution}: {inst.percentage.toFixed(1)}% da dívida total 
                    (limite interno: 25%)
                  </li>
                ))
              }
            </ul>
            <p className="mt-3">
              <strong>Recomendações:</strong> Considere diversificar as fontes de financiamento 
              para reduzir riscos de concentração e melhorar o poder de negociação.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Diversification Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Oportunidades de Diversificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Bancos Cooperativos</h4>
                <p className="text-sm text-muted-foreground">
                  Taxas competitivas para produtores rurais associados
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Fundos de Investimento Agrícola</h4>
                <p className="text-sm text-muted-foreground">
                  Alternativa para grandes volumes com prazos flexíveis
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Mercado de Capitais</h4>
                <p className="text-sm text-muted-foreground">
                  CRA e debêntures para projetos de longo prazo
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}