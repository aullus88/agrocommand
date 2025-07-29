'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Building2,
  FileText,
  DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/utils/debt-calculations'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DBDebtPayment } from '@/hooks/use-real-debt-data'
import { cn } from '@/lib/utils'

interface CashFlowTableProps {
  payments: DBDebtPayment[]
  groupedData: Array<{
    period: string
    startDate: Date
    endDate: Date
    payments: DBDebtPayment[]
    totalAmount: number
    principalAmount: number
    interestAmount: number
    paymentCount: number
  }>
  groupBy: 'week' | 'month'
}

export function CashFlowTable({ payments, groupedData, groupBy }: CashFlowTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showDetails, setShowDetails] = useState(false)

  const toggleGroup = (period: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(period)) {
      newExpanded.delete(period)
    } else {
      newExpanded.add(period)
    }
    setExpandedGroups(newExpanded)
  }

  const getCurrencyBadge = (moeda: string) => {
    const colors: Record<string, string> = {
      'R$': 'bg-green-100 text-green-800',
      'US$': 'bg-blue-100 text-blue-800',
      '€UR': 'bg-purple-100 text-purple-800'
    }
    return colors[moeda] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (payment: DBDebtPayment) => {
    const dueDate = new Date(payment.vencim_parcela)
    const today = new Date()
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (payment.status === 'paid') {
      return <Badge variant="outline" className="text-green-600">Pago</Badge>
    } else if (daysUntil < 0) {
      return <Badge variant="destructive">Vencido</Badge>
    } else if (daysUntil <= 7) {
      return <Badge variant="destructive">Vence em {daysUntil}d</Badge>
    } else if (daysUntil <= 30) {
      return <Badge variant="secondary">Vence em {daysUntil}d</Badge>
    }
    return null
  }

  if (showDetails) {
    // Detailed view - show all payments
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cronograma Detalhado de Pagamentos</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetails(false)}
            >
              Visualização Agrupada
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Venc.</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Juros</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {format(new Date(payment.vencim_parcela), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {payment.agente}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {payment.nr_contrato}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.parc_current}/{payment.parc_total}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getCurrencyBadge(payment.moeda))}>
                        {payment.moeda}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.vlr_capital_parcela)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.juros_parcela)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.tot_capital_juros)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grouped view
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cronograma de Pagamentos</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDetails(true)}
          >
            Visualização Detalhada
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {groupedData.map((group) => {
            const isExpanded = expandedGroups.has(group.period)
            const periodLabel = groupBy === 'week'
              ? `Semana ${format(group.startDate, 'ww', { locale: ptBR })} - ${format(group.startDate, 'dd/MM', { locale: ptBR })} a ${format(group.endDate, 'dd/MM', { locale: ptBR })}`
              : format(group.startDate, 'MMMM yyyy', { locale: ptBR })

            return (
              <Collapsible key={group.period}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                    onClick={() => toggleGroup(group.period)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="text-left">
                        <p className="font-medium">{periodLabel}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.paymentCount} pagamento{group.paymentCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(group.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">
                        Principal: {formatCurrency(group.principalAmount)} | Juros: {formatCurrency(group.interestAmount)}
                      </p>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Instituição</TableHead>
                          <TableHead>Contrato</TableHead>
                          <TableHead>Moeda</TableHead>
                          <TableHead className="text-right">Principal</TableHead>
                          <TableHead className="text-right">Juros</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {format(new Date(payment.vencim_parcela), 'dd/MM', { locale: ptBR })}
                            </TableCell>
                            <TableCell>{payment.agente}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {payment.nr_contrato}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-xs", getCurrencyBadge(payment.moeda))}>
                                {payment.moeda}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(payment.vlr_capital_parcela)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(payment.juros_parcela)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(payment.tot_capital_juros)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(payment)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>

        {/* Interactive Features Note */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Recursos Interativos</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Clique nas semanas/meses para expandir e ver detalhes</li>
            <li>• Use os filtros acima para refinar a visualização</li>
            <li>• Exporte para Excel com fórmulas prontas</li>
            <li>• Configure alertas automáticos para vencimentos próximos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}