'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CovenantStatus } from '@/types/debt-management'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  HelpCircle,
  Database,
  ExternalLink
} from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CovenantMonitoringProps {
  covenants: CovenantStatus
}

export function CovenantMonitoringReal({ covenants }: CovenantMonitoringProps) {
  const getStatusIcon = (status: 'compliant' | 'warning' | 'breach' | 'good' | 'unknown') => {
    switch (status) {
      case 'compliant':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'breach':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'unknown':
        return <HelpCircle className="h-4 w-4 text-gray-600" />
      default:
        return <HelpCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: 'compliant' | 'warning' | 'breach' | 'good' | 'unknown') => {
    const variants = {
      compliant: 'bg-green-100 text-green-800',
      good: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      breach: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      compliant: 'Conforme',
      good: 'Conforme',
      warning: 'Alerta',
      breach: 'Quebra',
      unknown: 'Sem Dados'
    }
    
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const covenantMetrics = [
    {
      id: 'dscr',
      label: 'DSCR (Debt Service Coverage Ratio)',
      ...covenants.dscr,
      description: 'Capacidade de pagamento do serviço da dívida'
    },
    {
      id: 'debt-ebitda',
      label: 'Dívida/EBITDA',
      ...covenants.debtToEbitda,
      description: 'Endividamento em relação ao EBITDA'
    },
    {
      id: 'current-ratio',
      label: 'Índice de Liquidez Corrente',
      ...covenants.currentRatio,
      description: 'Capacidade de honrar obrigações de curto prazo'
    }
  ]

  // If no covenant data is available, show warning
  if (!covenants.hasData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitoramento de Covenants
          </CardTitle>
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <Database className="h-3 w-3 mr-1" />
            Sem Dados
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dados de Covenants Indisponíveis</strong>
              <br />
              {covenants.dataWarning}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {covenantMetrics.map((metric) => (
              <div key={metric.id} className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{metric.description}</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Atual: <strong>N/A</strong></span>
                    <span>Mínimo: <strong>{metric.required?.toFixed(2) || metric.minimum?.toFixed(2) || 'N/A'}</strong></span>
                  </div>
                  
                  {metric.warning && (
                    <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                      {metric.warning}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Próximos Passos</h4>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Para habilitar o monitoramento de covenants:</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Importar dados de EBITDA e demonstrativos financeiros</li>
                  <li>• Configurar métricas de balanço patrimonial</li>
                  <li>• Definir limites específicos dos contratos de dívida</li>
                </ul>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Configurar Dados Financeiros
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If we have data (this shouldn't happen with current implementation, but future-proofing)
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Monitoramento de Covenants
        </CardTitle>
        <Badge variant="default" className="bg-green-100 text-green-800">
          Com Dados
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {covenantMetrics.map((metric) => (
            <div key={metric.id} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{metric.description}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
                {getStatusIcon(metric.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Atual: <strong>{metric.current?.toFixed(2) || 'N/A'}</strong></span>
                  <span>Limite: <strong>{metric.required?.toFixed(2) || metric.minimum?.toFixed(2) || metric.maximum?.toFixed(2) || 'N/A'}</strong></span>
                </div>
                
                {getStatusBadge(metric.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Última atualização: {new Date(covenants.lastUpdated).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  )
}