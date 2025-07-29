'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  FileText, 
  Download, 
  Mail, 
  Calendar as CalendarIcon, 
  Settings,
  BarChart3,
  Shield,
  DollarSign,
  Clock,
  Eye,
  Printer,
  Share2,
  Filter,
  PieChart
} from 'lucide-react'
import { formatCurrency } from '@/utils/debt-calculations'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CashFlowReport } from '../reports/cash-flow-report'
import { DebtPositionReport } from '../reports/debt-position-report'

export function ReportsTab() {
  const [selectedReportType, setSelectedReportType] = useState('cash-flow-report')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReportView, setShowReportView] = useState(false)

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  // Report templates
  const reportTemplates = [
    {
      id: 'cash-flow-report',
      name: 'Fluxo de Vencimentos',
      description: 'Cronograma detalhado dos compromissos financeiros futuros',
      icon: CalendarIcon,
      sections: ['Resumo Executivo', 'Gráfico de Barras', 'Cronograma Detalhado', 'Alertas'],
      estimatedPages: 15,
      generationTime: '1-2 min',
      format: ['PDF', 'Excel'],
      component: 'cash-flow'
    },
    {
      id: 'debt-position-report',
      name: 'Posição de Endividamento',
      description: 'Snapshot completo da estrutura de dívidas atual',
      icon: PieChart,
      sections: ['Visão Executiva', 'Composição', 'Evolução', 'Benchmarking'],
      estimatedPages: 20,
      generationTime: '2-3 min',
      format: ['PDF', 'Excel', 'PPT'],
      component: 'debt-position'
    },
    {
      id: 'comprehensive',
      name: 'Relatório Abrangente',
      description: 'Análise completa da posição de dívidas e covenants',
      icon: FileText,
      sections: ['Visão Geral', 'Análise de Risco', 'Covenants', 'Projeções'],
      estimatedPages: 25,
      generationTime: '3-5 min',
      format: ['PDF', 'Excel'],
      component: 'legacy'
    },
    {
      id: 'covenant-compliance',
      name: 'Compliance de Covenants',
      description: 'Relatório focado no status dos covenants financeiros',
      icon: Shield,
      sections: ['Status Atual', 'Histórico', 'Projeções', 'Alertas'],
      estimatedPages: 12,
      generationTime: '1-2 min',
      format: ['PDF'],
      component: 'legacy'
    },
    {
      id: 'risk-analysis',
      name: 'Análise de Risco',
      description: 'Avaliação de riscos cambiais e de mercado',
      icon: BarChart3,
      sections: ['VaR', 'Sensibilidade', 'Hedge', 'Recomendações'],
      estimatedPages: 18,
      generationTime: '2-4 min',
      format: ['PDF'],
      component: 'legacy'
    }
  ]

  // Recent reports
  const recentReports = [
    {
      id: '1',
      name: 'Fluxo de Vencimentos - Julho 2025',
      type: 'Cash Flow Report',
      generatedAt: new Date('2025-07-29'),
      size: '1.8 MB',
      format: 'PDF',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Posição de Endividamento - Q2 2025',
      type: 'Debt Position Report',
      generatedAt: new Date('2025-07-28'),
      size: '2.1 MB',
      format: 'PDF',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Fluxo de Vencimentos - 90 dias',
      type: 'Cash Flow Report',
      generatedAt: new Date('2025-07-25'),
      size: '3.2 MB',
      format: 'Excel',
      status: 'completed'
    },
    {
      id: '4',
      name: 'Relatório Abrangente - Junho 2025',
      type: 'Comprehensive',
      generatedAt: new Date('2025-06-30'),
      size: '2.4 MB',
      format: 'PDF',
      status: 'completed'
    }
  ]

  // Scheduled reports
  const scheduledReports = [
    {
      id: '1',
      name: 'Relatório Mensal - Covenants',
      frequency: 'Mensal',
      nextGeneration: new Date('2025-01-01'),
      recipients: ['cfo@agrocommand.com', 'treasury@agrocommand.com'],
      active: true
    },
    {
      id: '2',
      name: 'Análise Trimestral - Risco',
      frequency: 'Trimestral',
      nextGeneration: new Date('2025-03-01'),
      recipients: ['risk@agrocommand.com', 'board@agrocommand.com'],
      active: true
    },
    {
      id: '3',
      name: 'Relatório Anual - Compliance',
      frequency: 'Anual',
      nextGeneration: new Date('2025-12-31'),
      recipients: ['audit@agrocommand.com', 'legal@agrocommand.com'],
      active: false
    }
  ]

  const currentTemplate = reportTemplates.find(t => t.id === selectedReportType) || reportTemplates[0]

  const generateReport = async () => {
    const currentTemplate = reportTemplates.find(t => t.id === selectedReportType) || reportTemplates[0]
    
    if (currentTemplate.component === 'cash-flow' || currentTemplate.component === 'debt-position') {
      // Show the interactive report view for new report types
      setShowReportView(true)
    } else {
      // Legacy report generation
      setIsGenerating(true)
      await new Promise(resolve => setTimeout(resolve, 3000))
      setIsGenerating(false)
      console.log('Report generated:', currentTemplate.name)
    }
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'ppt') => {
    try {
      setIsGenerating(true)
      
      // Get current report data (this would come from the actual report component)
      const reportData = {
        reportType: selectedReportType,
        dateRange,
        // Additional data would be collected from the report components
      }

      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: selectedReportType.replace('-report', ''),
          format,
          data: reportData,
          options: {
            includeCharts: true,
            includeRawData: format === 'excel',
            dateRange
          }
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const result = await response.json()
      
      // Trigger download
      if (result.success && result.data.downloadUrl) {
        window.open(result.data.downloadUrl, '_blank')
      }
      
    } catch (error) {
      console.error('Export error:', error)
      // Could show an error toast here
    } finally {
      setIsGenerating(false)
    }
  }

  // Show interactive report view for new reports
  if (showReportView) {
    const currentTemplate = reportTemplates.find(t => t.id === selectedReportType) || reportTemplates[0]
    
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <motion.div 
          variants={itemVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReportView(false)}
              >
                ← Voltar
              </Button>
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <currentTemplate.icon className="h-6 w-6" />
                  {currentTemplate.name}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {currentTemplate.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Render the appropriate report component */}
        {currentTemplate.component === 'cash-flow' && (
          <CashFlowReport 
            startDate={dateRange.from}
            endDate={dateRange.to}
            onExport={handleExport}
          />
        )}
        
        {currentTemplate.component === 'debt-position' && (
          <DebtPositionReport 
            onExport={handleExport}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Relatórios e Exportação
            </h2>
            <p className="text-muted-foreground mt-1">
              Gere relatórios personalizados e configure exportações automáticas
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="recent">Relatórios Recentes</TabsTrigger>
          <TabsTrigger value="scheduled">Relatórios Programados</TabsTrigger>
        </TabsList>

        {/* Generate Reports Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Template Selection */}
            <motion.div 
              variants={itemVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Selecionar Modelo de Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={selectedReportType} onValueChange={setSelectedReportType}>
                    {reportTemplates.map((template) => (
                      <div key={template.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <template.icon className="h-5 w-5" />
                            <Label htmlFor={template.id} className="font-medium cursor-pointer">
                              {template.name}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline">{template.estimatedPages} páginas</Badge>
                            <Badge variant="outline">{template.generationTime}</Badge>
                            {template.format.map(fmt => (
                              <Badge key={fmt} variant="secondary">{fmt}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            {/* Report Configuration */}
            <motion.div 
              variants={itemVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label>Período do Relatório</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                            )
                          ) : (
                            <span>Selecionar período</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={(range: any) => setDateRange(range)}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Format Selection */}
                  <div className="space-y-2">
                    <Label>Formato de Exportação</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentTemplate.format.map(fmt => (
                          <SelectItem key={fmt} value={fmt.toLowerCase()}>
                            {fmt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sections */}
                  <div className="space-y-2">
                    <Label>Seções Incluídas</Label>
                    <div className="space-y-2">
                      {currentTemplate.sections.map((section) => (
                        <div key={section} className="flex items-center space-x-2">
                          <Checkbox id={section} defaultChecked />
                          <Label htmlFor={section} className="text-sm">
                            {section}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={generateReport} 
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Recent Reports Tab */}
        <TabsContent value="recent" className="space-y-6">
          <motion.div 
            variants={itemVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Relatórios Recentes</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{format(report.generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            <span>{report.size}</span>
                            <Badge variant="outline">{report.format}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <motion.div 
            variants={itemVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Relatórios Programados</CardTitle>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledReports.map((scheduled) => (
                    <div key={scheduled.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          scheduled.active ? 'bg-green-50' : 'bg-gray-50'
                        }`}>
                          <Clock className={`h-5 w-5 ${
                            scheduled.active ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{scheduled.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Frequência: {scheduled.frequency}</span>
                            <span>Próximo: {format(scheduled.nextGeneration, "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {scheduled.recipients.length} destinatário{scheduled.recipients.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={scheduled.active ? 'default' : 'secondary'}>
                          {scheduled.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}