import { Button } from '@/components/ui/button'
import { Download, Share2, Settings, FileText, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function CashFlowHeader() {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
        <p className="text-muted-foreground">
          Gestão e projeção de fluxo de caixa - Safra 2024/25
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">
            Home → Análise Financeira → Fluxo de Caixa
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Relatório PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Planilha Excel
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="h-4 w-4 mr-2" />
              Programar Relatório
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </Button>
      </div>
    </div>
  )
}