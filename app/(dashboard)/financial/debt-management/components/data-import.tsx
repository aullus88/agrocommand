'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Database,
  RefreshCw
} from 'lucide-react'
import { parseAndImportCSV } from '@/utils/debt-import'
import { toast } from 'sonner'

interface ImportStats {
  rawCount: number
  processedCount: number
  imported: number
  pastGenerated?: number
  errors?: string[]
}

export function DataImportComponent() {
  const [isImporting, setIsImporting] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setError(null)
      } else {
        setError('Por favor, selecione um arquivo CSV válido.')
        setSelectedFile(null)
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo CSV primeiro.')
      return
    }

    setIsImporting(true)
    setError(null)
    
    try {
      // Read file content
      const fileContent = await selectedFile.text()
      
      // Parse and import data
      const result = await parseAndImportCSV(fileContent)
      
      if (result.success) {
        setImportStats({
          rawCount: result.rawCount || 0,
          processedCount: result.processedCount || 0,
          imported: result.imported || 0
        })
        
        toast.success(`Dados importados com sucesso! ${result.imported} pagamentos processados.`)
      } else {
        setError(result.error || 'Erro desconhecido durante a importação.')
        toast.error('Erro durante a importação dos dados.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error('Erro durante a importação dos dados.')
    } finally {
      setIsImporting(false)
    }
  }

  const resetImport = () => {
    setSelectedFile(null)
    setImportStats(null)
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Importação de Dados de Dívidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="csv-file">Selecionar Arquivo CSV</Label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isImporting}
            />
            {selectedFile && (
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {selectedFile.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Import Button */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Importar Dados
              </>
            )}
          </Button>
          
          {(importStats || error) && (
            <Button variant="outline" onClick={resetImport}>
              Novo Import
            </Button>
          )}
        </div>

        {/* Progress */}
        {isImporting && (
          <div className="space-y-2">
            <Label>Processando dados...</Label>
            <Progress value={50} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Stats */}
        {importStats && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-green-800">Importação concluída com sucesso!</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Registros lidos:</span>
                    <span className="ml-2 font-medium">{importStats.rawCount}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Processados:</span>
                    <span className="ml-2 font-medium">{importStats.processedCount}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Importados:</span>
                    <span className="ml-2 font-medium">{importStats.imported}</span>
                  </div>
                  {importStats.pastGenerated && (
                    <div>
                      <span className="text-green-700">Pagamentos passados gerados:</span>
                      <span className="ml-2 font-medium">{importStats.pastGenerated}</span>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Instruções:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• O arquivo deve estar no formato CSV com separador ";"</li>
            <li>• As colunas devem seguir o padrão: AGENTE, MODALIDADE, NR.CONTRATO, etc.</li>
            <li>• O sistema irá processar automaticamente os valores monetários</li>
            <li>• Pagamentos passados serão inferidos com base na coluna PARC</li>
            <li>• Duplicatas serão ignoradas baseadas no contrato + parcela + vencimento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}