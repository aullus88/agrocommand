'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/utils/debt-calculations'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CashFlowMetricsProps {
  metrics: {
    totalAmount: number
    paymentCount: number
    maxPayment: number
    maxPaymentDate: Date | null
    maxPaymentInstitution?: string
    concentrationInstitution?: string
    concentrationPercent: number
    peakPeriod?: {
      period: string
      totalAmount: number
      paymentCount: number
    }
    avgPayment: number
  }
  period: number
}

export function CashFlowMetrics({ metrics, period }: CashFlowMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Period Amount */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total {period} dias
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(metrics.totalAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.paymentCount} pagamentos
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Largest Payment */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Maior Vencimento
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(metrics.maxPayment)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.maxPaymentDate 
                  ? format(metrics.maxPaymentDate, 'dd/MM', { locale: ptBR })
                  : '-'} 
                {metrics.maxPaymentInstitution && ` - ${metrics.maxPaymentInstitution}`}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concentration Alert */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Concentração
              </p>
              <p className="text-2xl font-bold">
                {metrics.concentrationPercent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.concentrationInstitution || 'N/A'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              metrics.concentrationPercent > 35 
                ? 'bg-yellow-50' 
                : 'bg-green-50'
            }`}>
              <AlertTriangle className={`h-6 w-6 ${
                metrics.concentrationPercent > 35 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              }`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Period */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pico de Pagamentos
              </p>
              <p className="text-2xl font-bold">
                {metrics.peakPeriod 
                  ? formatCurrency(metrics.peakPeriod.totalAmount)
                  : formatCurrency(0)
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.peakPeriod?.paymentCount || 0} pagamentos
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}