'use client'

// import { useState } from 'react'
import { 

  Calendar,
  Filter,

} from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// import { 
//   useExportFinancialData,
//   useShareDashboard,
//   useSaveAlert,
//   useRefreshFinancialData
// } from '@/hooks/use-financial-data'
import { FinancialFilters } from '@/types/financial'

interface FinancialHeaderProps {
  filters: FinancialFilters
  onFiltersChange: (filters: FinancialFilters) => void
  lastUpdated?: Date
}

export function FinancialHeader({
  filters,
  onFiltersChange,
  // lastUpdated
}: FinancialHeaderProps) {
  // const [isExporting, setIsExporting] = useState(false)
  
  // const exportMutation = useExportFinancialData()
  // const shareMutation = useShareDashboard()
  // const alertMutation = useSaveAlert()
  // const { refreshAll, isRefreshing } = useRefreshFinancialData()

  // const handleExport = async (format: 'pdf' | 'excel') => {
  //   setIsExporting(true)
  //   try {
  //     await exportMutation.mutateAsync({
  //       format,
  //       sections: ['kpis', 'income-statement', 'cost-breakdown', 'margins', 'indicators'],
  //       period: filters.period,
  //       includeCharts: true,
  //       includeComparison: !!filters.comparison
  //     })
  //   } finally {
  //     setIsExporting(false)
  //   }
  // }

  // const handleShare = async () => {
  //   await shareMutation.mutateAsync({
  //     sections: ['all'],
  //     filters
  //   })
  // }

  // const handleCreateAlert = async () => {
  //   await alertMutation.mutateAsync({
  //     name: 'Monitoramento Financeiro',
  //     metric: 'ebitda',
  //     condition: 'below',
  //     threshold: 140000000, // R$ 140M
  //     enabled: true,
  //     notifications: ['email', 'dashboard']
  //   })
  // }

  const handlePeriodChange = (periodType: string) => {
    // This would update the selected period
    // For now, just update the filter type
    const updatedFilters = {
      ...filters,
      period: {
        ...filters.period,
        type: periodType as 'monthly' | 'quarterly' | 'harvest' | 'annual'
      }
    }
    onFiltersChange(updatedFilters)
  }

  const handleComparisonChange = (comparisonType: string) => {
    if (comparisonType === 'none') {
      onFiltersChange({
        ...filters,
        comparison: undefined
      })
    } else {
      onFiltersChange({
        ...filters,
        comparison: {
          type: comparisonType as 'previous_harvest' | 'budget' | 'three_year_average',
          period: filters.period // Use same period for comparison
        }
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Análise Financeira - Safra 2024/25
          </h1>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Fazenda de 50.000 hectares</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Última atualização: {lastUpdated?.toLocaleString('pt-BR') || 'Carregando...'}</span>
            {isRefreshing && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center space-x-1">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Atualizando...</span>
                </div>
              </>
            )}
          </div>
        </div> */}

        {/* Action Buttons */}
        {/* <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Atualizar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download size={16} />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Exportar Relatório</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                Relatório PDF
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('excel')}
                disabled={isExporting}
              >
                Dados Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={shareMutation.isPending}
          >
            <Share2 size={16} />
            Compartilhar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateAlert}
            disabled={alertMutation.isPending}
          >
            <Bell size={16} />
            Alertas
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Configurações</DropdownMenuLabel>
              <DropdownMenuItem>
                Personalizar Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configurar Notificações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Exportar Configurações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Período:</span>
          <Select value={filters.period.type} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="harvest">Safra</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Comparar com:</span>
          <Select 
            value={filters.comparison?.type || 'none'} 
            onValueChange={handleComparisonChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem comparação</SelectItem>
              <SelectItem value="previous_harvest">Safra anterior</SelectItem>
              <SelectItem value="budget">Orçamento</SelectItem>
              <SelectItem value="three_year_average">Média 3 anos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Cultura:</span>
          <Select value={filters.culture} onValueChange={(value) => 
            onFiltersChange({ ...filters, culture: value as 'soybean' | 'corn' | 'all' })
          }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="soybean">Soja</SelectItem>
              <SelectItem value="corn">Milho</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {filters.period.label}
          </Badge>
          {filters.comparison && (
            <Badge variant="outline" className="text-xs">
              vs {filters.comparison.type === 'previous_harvest' ? 'Safra Anterior' : 
                   filters.comparison.type === 'budget' ? 'Orçamento' : 'Média 3 Anos'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}