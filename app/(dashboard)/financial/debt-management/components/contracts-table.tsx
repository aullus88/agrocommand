'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DebtContract } from '@/types/debt-management'
import { formatCurrency, formatPercentage, calculateDaysUntil } from '@/utils/debt-calculations'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Search,
  Filter,
  Download,
  FileText,
  Edit,
  Calendar,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { convertToBRL } from '@/utils/currency-service'

interface ContractsTableProps {
  contracts: DebtContract[]
}

// Contract Details Component for expanded view
interface PaymentData {
  [key: string]: unknown
  convertedAmount: number
  convertedPrincipal: number
  convertedInterest: number
  exchangeRate: number
  saldo_a_pagar: number
  vlr_capital_parcela: number
  juros_parcela: number
  moeda: string
  parc_current: number
  parc_total: number
  vencim_parcela: string
  tx_jur: number
  status: string
}

function ContractDetails({ contract }: { contract: DebtContract }) {
  const [paymentsData, setPaymentsData] = React.useState<PaymentData[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const processPayments = async () => {
      const contractWithPayments = contract as DebtContract & { allPayments?: PaymentData[] }
      if (!contractWithPayments.allPayments) {
        setLoading(false)
        return
      }

      const payments = contractWithPayments.allPayments
      const processedPayments = await Promise.all(
        payments.map(async (payment: PaymentData) => {
          const conversionResult = await convertToBRL(payment.saldo_a_pagar, payment.moeda || 'R$')
          const principalConversion = await convertToBRL(payment.vlr_capital_parcela, payment.moeda || 'R$')
          const interestConversion = await convertToBRL(payment.juros_parcela, payment.moeda || 'R$')
          
          return {
            ...payment,
            convertedAmount: conversionResult.result,
            convertedPrincipal: principalConversion.result,
            convertedInterest: interestConversion.result,
            exchangeRate: conversionResult.rate
          }
        })
      )
      
      setPaymentsData(processedPayments)
      setLoading(false)
    }

    processPayments()
  }, [contract])

  const totalPrincipal = paymentsData.reduce((sum, p) => sum + p.convertedPrincipal, 0)
  const totalInterest = paymentsData.reduce((sum, p) => sum + p.convertedInterest, 0)

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-sm text-muted-foreground">Carregando detalhes do contrato...</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Contract Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Taxa de Juros</p>
          <p className="text-sm font-medium">{formatPercentage(contract.currentRate)} a.a.</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Moeda Original</p>
          <p className="text-sm font-medium">{(contract as DebtContract & { originalCurrency?: string }).originalCurrency || contract.currency}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total Principal</p>
          <p className="text-sm font-medium">{formatCurrency(totalPrincipal)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total Juros</p>
          <p className="text-sm font-medium">{formatCurrency(totalInterest)}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Cronograma de Pagamentos</h4>
          <Badge variant="outline" className="text-xs">
            {paymentsData.length} pagamentos
          </Badge>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">Parcela</TableHead>
                <TableHead className="text-xs">Vencimento</TableHead>
                <TableHead className="text-xs">Valor Original</TableHead>
                <TableHead className="text-xs">Valor em R$</TableHead>
                <TableHead className="text-xs">Principal</TableHead>
                <TableHead className="text-xs">Juros</TableHead>
                <TableHead className="text-xs">Taxa</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsData.map((payment, idx) => (
                <TableRow key={idx} className={cn(
                  "text-xs",
                  payment.status === 'overdue' && "bg-red-50",
                  payment.status === 'paid' && "bg-green-50"
                )}>
                  <TableCell className="font-mono">
                    {payment.parc_current}/{payment.parc_total}
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.vencim_parcela), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="font-mono">
                    <div>{formatCurrency(payment.saldo_a_pagar)} {payment.moeda}</div>
                    {payment.exchangeRate > 1 && (
                      <div className="text-xs text-muted-foreground">
                        Taxa: {payment.exchangeRate.toFixed(4)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(payment.convertedAmount)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(payment.convertedPrincipal)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(payment.convertedInterest)}
                  </TableCell>
                  <TableCell>
                    {formatPercentage(payment.tx_jur || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      payment.status === 'paid' ? 'default' :
                      payment.status === 'overdue' ? 'destructive' : 'secondary'
                    } className="text-xs">
                      {payment.status === 'paid' ? 'Pago' :
                       payment.status === 'overdue' ? 'Vencido' : 'Pendente'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof DebtContract>('currentBalance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const toggleRow = (contractId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId)
    } else {
      newExpanded.add(contractId)
    }
    setExpandedRows(newExpanded)
  }

  const filteredContracts = contracts.filter(contract => 
    contract.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue)
    }
    
    return 0
  })

  const getStatusBadge = (status: DebtContract['status']) => {
    const variants: Record<DebtContract['status'], { label: string; className: string }> = {
      active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      grace: { label: 'Carência', className: 'bg-yellow-100 text-yellow-800' },
      default: { label: 'Inadimplente', className: 'bg-red-100 text-red-800' },
      paid: { label: 'Quitado', className: 'bg-gray-100 text-gray-800' }
    }
    
    const variant = variants[status]
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  const getCovenantStatus = (contract: DebtContract) => {
    const hasBreaches = contract.covenants.some(c => c.status === 'breach')
    const hasWarnings = contract.covenants.some(c => c.status === 'warning')
    
    if (hasBreaches) {
      return <Badge className="bg-red-100 text-red-800">Quebra</Badge>
    }
    if (hasWarnings) {
      return <Badge className="bg-yellow-100 text-yellow-800">Alerta</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">OK</Badge>
  }

  const handleSort = (field: keyof DebtContract) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contratos de Dívida</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('institution')}
                >
                  Instituição
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('currentBalance')}
                >
                  Saldo Devedor
                </TableHead>
                <TableHead>Moeda</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('currentRate')}
                >
                  Taxa
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('maturityDate')}
                >
                  Vencimento
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('nextPaymentAmount')}
                >
                  Próx. Pagamento
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Covenant</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.map((contract) => (
                <React.Fragment key={contract.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(contract.id)}
                      >
                        {expandedRows.has(contract.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{contract.institution}</div>
                        <div className="text-xs text-muted-foreground">{contract.contractNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(contract.currentBalance)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{contract.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      {contract.rateType === 'PreFixed' 
                        ? formatPercentage(contract.currentRate) 
                        : `${contract.rateType}+${formatPercentage(contract.spread || 0)}`}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-sm">
                          {contract.maturityDate ? format(
                            contract.maturityDate instanceof Date ? contract.maturityDate : new Date(contract.maturityDate), 
                            'dd/MM/yyyy'
                          ) : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {contract.maturityDate ? calculateDaysUntil(
                            contract.maturityDate instanceof Date ? contract.maturityDate : new Date(contract.maturityDate)
                          ) : 0} dias
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatCurrency(contract.nextPaymentAmount || 0)}</span>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 ml-2">
                            {(contract as DebtContract & { paymentProgress?: string; currentPaymentNumber?: number; totalPayments?: number }).paymentProgress || 
                             `${(contract as DebtContract & { currentPaymentNumber?: number }).currentPaymentNumber || 1}/${(contract as DebtContract & { totalPayments?: number }).totalPayments || 1}`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {contract.nextPaymentDate ? format(
                            contract.nextPaymentDate instanceof Date ? contract.nextPaymentDate : new Date(contract.nextPaymentDate), 
                            'dd/MM'
                          ) : '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell>{getCovenantStatus(contract)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Cronograma
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Registrar Pagamento
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(contract.id) && (
                    <TableRow>
                      <TableCell colSpan={10} className="bg-muted/30">
                        <ContractDetails contract={contract} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>{sortedContracts.length} contratos encontrados</p>
          <p>Total: {formatCurrency(sortedContracts.reduce((sum, c) => sum + c.currentBalance, 0))}</p>
        </div>
      </CardContent>
    </Card>
  )
}