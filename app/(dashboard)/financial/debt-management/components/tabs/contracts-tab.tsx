'use client'

import { motion } from 'framer-motion'
import { DebtContract } from '@/types/debt-management'
import { ContractsTable } from '../contracts-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign,
  Building,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/utils/debt-calculations'

interface ContractsTabProps {
  contracts: DebtContract[]
}

export function ContractsTab({ contracts }: ContractsTabProps) {
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  // Calculate summary statistics
  const totalContracts = contracts.length
  const activeContracts = contracts.filter(c => c.status === 'active').length
  const totalBalance = contracts.reduce((sum, c) => sum + c.currentBalance, 0)
  const upcomingPayments = contracts.filter(c => {
    if (!c.nextPaymentDate) return false
    const paymentDate = c.nextPaymentDate instanceof Date ? c.nextPaymentDate : new Date(c.nextPaymentDate)
    const daysUntil = Math.ceil((paymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 30
  }).length

  const contractStats = [
    {
      id: 'total',
      label: 'Total de Contratos',
      value: totalContracts,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 'active',
      label: 'Contratos Ativos',
      value: activeContracts,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 'balance',
      label: 'Saldo Total',
      value: formatCurrency(totalBalance),
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      id: 'upcoming',
      label: 'Pagamentos (30 dias)',
      value: upcomingPayments,
      icon: Clock,
      color: 'text-orange-600'
    }
  ]



  // Group contracts by institution for quick overview
  const contractsByInstitution = contracts.reduce((acc, contract) => {
    if (!acc[contract.institution]) {
      acc[contract.institution] = {
        count: 0,
        totalBalance: 0,
        contracts: []
      }
    }
    acc[contract.institution].count++
    acc[contract.institution].totalBalance += contract.currentBalance
    acc[contract.institution].contracts.push(contract)
    return acc
  }, {} as Record<string, { count: number; totalBalance: number; contracts: DebtContract[] }>)

  const institutionSummary = Object.entries(contractsByInstitution)
    .sort((a, b) => b[1].totalBalance - a[1].totalBalance)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contractStats.map((stat) => (
            <Card key={stat.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Institution Summary - Full Width */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Resumo por Instituição
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {Object.keys(contractsByInstitution).length} instituições
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {institutionSummary.map(([institution, data]) => (
                <div key={institution} className="group relative p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/30 hover:border-border transition-all duration-200">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate" title={institution}>
                          {institution}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {data.count} {data.count === 1 ? 'contrato' : 'contratos'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(data.totalBalance)}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        {data.contracts.some(c => c.covenants?.some(cov => cov.status !== 'compliant')) ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Alerta
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            OK
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {((data.totalBalance / totalBalance) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover overlay for more info */}
                  <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>
              ))}
            </div>
            
            {/* Show remaining institutions if there are more than 5 */}
            {Object.keys(contractsByInstitution).length > 5 && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground text-center">
                  + {Object.keys(contractsByInstitution).length - 5} outras instituições
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Contracts Table */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <ContractsTable contracts={contracts} />
      </motion.div>
    </div>
  )
}