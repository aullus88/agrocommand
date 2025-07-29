'use client'

import { useState } from 'react'
import { DefaultPage } from '@/components/DefaultPage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DataImportComponent } from '../components/data-import'
import { useDebtSummaryByInstitution, useMonthlyPaymentSchedule } from '@/hooks/use-real-debt-data'
import { formatCurrency } from '@/utils/debt-calculations'
import { 
  Settings, 
  Database, 
  BarChart3, 
  FileText,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function DebtManagementAdminPage() {
  const [useRealData, setUseRealData] = useState(false)
  
  const { data: institutionSummary, isLoading: loadingInstitutions } = useDebtSummaryByInstitution()
  const { data: monthlySchedule, isLoading: loadingSchedule } = useMonthlyPaymentSchedule()

  return (
    <DefaultPage
      title="Administração - Gestão de Dívidas"
      description="Configurações e importação de dados do sistema de gestão de dívidas"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Financeiro', href: '/financial' },
        { label: 'Gestão de Dívidas', href: '/financial/debt-management' },
        { label: 'Administração' }
      ]}
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="real-data"
                checked={useRealData}
                onCheckedChange={setUseRealData}
              />
              <Label htmlFor="real-data">
                Usar dados reais (Supabase) ao invés de dados simulados
              </Label>
              <Badge variant={useRealData ? 'default' : 'secondary'}>
                {useRealData ? 'Dados Reais' : 'Dados Simulados'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Importar Dados
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="institutions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Instituições
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cronograma
            </TabsTrigger>
          </TabsList>

          {/* Data Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <DataImportComponent />
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Pagamentos</p>
                      <p className="text-lg font-semibold">
                        {monthlySchedule?.reduce((sum, month) => sum + month.payment_count, 0) || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pagamentos Realizados</p>
                      <p className="text-lg font-semibold">
                        {monthlySchedule?.reduce((sum, month) => sum + month.paid_count, 0) || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
                      <p className="text-lg font-semibold">
                        {monthlySchedule?.reduce((sum, month) => sum + month.pending_count, 0) || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pagamentos Atrasados</p>
                      <p className="text-lg font-semibold">
                        {monthlySchedule?.reduce((sum, month) => sum + month.overdue_count, 0) || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Amount Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total de Pagamentos</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(monthlySchedule?.reduce((sum, month) => sum + month.total_payment, 0) || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Principal</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(monthlySchedule?.reduce((sum, month) => sum + month.total_principal, 0) || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Juros</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(monthlySchedule?.reduce((sum, month) => sum + month.total_interest, 0) || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Institutions Tab */}
          <TabsContent value="institutions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Instituição</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInstitutions ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {institutionSummary?.map((institution) => (
                      <div key={institution.agente} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{institution.agente}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{institution.total_payments} pagamentos</span>
                            <span>{institution.future_payments} futuros</span>
                            {institution.overdue_payments > 0 && (
                              <Badge variant="destructive">
                                {institution.overdue_payments} atrasados
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(institution.total_amount)}</p>
                          <div className="text-sm text-muted-foreground">
                            <span>Futuro: {formatCurrency(institution.future_amount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cronograma Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSchedule ? (
                  <div className="space-y-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {monthlySchedule?.map((month) => (
                      <div key={`${month.ano}-${month.mes}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-medium">{month.mes.toString().padStart(2, '0')}/{month.ano}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{month.payment_count} pagamentos</span>
                            <Badge variant="outline">{month.paid_count} pagos</Badge>
                            <Badge variant="secondary">{month.pending_count} pendentes</Badge>
                            {month.overdue_count > 0 && (
                              <Badge variant="destructive">{month.overdue_count} atrasados</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(month.total_payment)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DefaultPage>
  )
}