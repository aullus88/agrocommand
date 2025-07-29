import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DebtFilters } from '@/types/debt-management'
import { 
  Calendar,
  Download,
  Upload,
  Filter,
  RefreshCw,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface DebtHeaderProps {
  filters: DebtFilters
  onFiltersChange: (filters: DebtFilters) => void
  lastUpdated?: Date
}

export function DebtHeader({ filters, lastUpdated }: DebtHeaderProps) {
  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting debt portfolio as ${format}`)
  }

  const handleImport = () => {
    console.log('Importing debt data')
  }

  const handleRefresh = () => {
    console.log('Refreshing debt data')
  }

  const handleViewChange = (view: string) => {
    console.log('Changing view to:', view)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Title and status */}
          <div className="flex items-start gap-4">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                Portfólio de Dívidas
                <Badge variant="secondary" className="ml-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2" />
                  Atualizado
                </Badge>
              </h2>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">
                  Última atualização: {format(lastUpdated, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View selector */}
            <Select defaultValue="overview" onValueChange={handleViewChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione a visão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Visão Geral</SelectItem>
                <SelectItem value="by-institution">Por Instituição</SelectItem>
                <SelectItem value="by-currency">Por Moeda</SelectItem>
                <SelectItem value="by-maturity">Por Vencimento</SelectItem>
                <SelectItem value="covenants">Covenants</SelectItem>
              </SelectContent>
            </Select>

            {/* Period filter */}
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Período
            </Button>

            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {(filters.currencies.length > 0 || filters.institutions.length > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.currencies.length + filters.institutions.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="text-sm">Moeda</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="text-sm">Instituição</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="text-sm">Tipo de Taxa</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="text-sm">Status</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Limpar filtros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              {/* Reports */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Relatórios
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Gerar Relatório</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Análise de Endividamento
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Relatório de Covenants
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="h-4 w-4 mr-2" />
                    Cronograma de Pagamentos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Exportar</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    Exportar como PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    Exportar como Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Import */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleImport}
              >
                <Upload className="h-4 w-4" />
              </Button>

              {/* Refresh */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}