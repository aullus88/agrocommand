'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/utils/debt-calculations'
import { DebtPortfolio } from '@/types/debt-management'

interface DebtCompositionChartsProps {
  portfolio: DebtPortfolio
}

const COLORS = {
  currency: {
    BRL: '#22c55e',
    USD: '#3b82f6',
    EUR: '#8b5cf6'
  },
  institution: [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#6b7280'
  ],
  purpose: {
    'Working Capital': '#3b82f6',
    'Equipment': '#10b981',
    'Infrastructure': '#f59e0b',
    'Land Acquisition': '#ef4444',
    'Refinancing': '#8b5cf6'
  }
}

export function DebtCompositionCharts({ portfolio }: DebtCompositionChartsProps) {
  const { composition } = portfolio

  // Prepare data for charts
  const currencyData = composition.byCurrency.map(item => ({
    name: item.currency,
    value: item.amount,
    percentage: item.percentage,
    avgRate: item.avgRate
  }))

  const institutionData = composition.byInstitution
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(item => ({
      name: item.institution,
      value: item.amount,
      percentage: item.percentage,
      contracts: item.contracts
    }))

  // Add "Others" if there are more than 5 institutions
  if (composition.byInstitution.length > 5) {
    const othersAmount = composition.byInstitution
      .slice(5)
      .reduce((sum, inst) => sum + inst.amount, 0)
    const othersPercentage = composition.byInstitution
      .slice(5)
      .reduce((sum, inst) => sum + inst.percentage, 0)
    
    institutionData.push({
      name: 'Outros',
      value: othersAmount,
      percentage: othersPercentage,
      contracts: composition.byInstitution.length - 5
    })
  }

  const purposeData = composition.byPurpose.map(item => ({
    name: translatePurpose(item.purpose),
    value: item.amount,
    percentage: item.percentage
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">{data.payload.percentage.toFixed(1)}%</p>
          {data.payload.avgRate && (
            <p className="text-sm text-muted-foreground">
              Taxa média: {data.payload.avgRate.toFixed(1)}%
            </p>
          )}
          {data.payload.contracts && (
            <p className="text-sm text-muted-foreground">
              {data.payload.contracts} contratos
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Currency Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Composição por Moeda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currencyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS.currency[entry.name as keyof typeof COLORS.currency] || '#6b7280'} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Currency Details */}
          <div className="mt-4 space-y-2">
            {currencyData.map((currency, index) => (
              <div key={`currency-${index}-${currency.name}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS.currency[currency.name as keyof typeof COLORS.currency] || '#6b7280' }}
                  />
                  <span>{currency.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(currency.value)}</p>
                  <p className="text-xs text-muted-foreground">Taxa: {currency.avgRate.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Institution Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 5 Instituições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={institutionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {institutionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS.institution[index % COLORS.institution.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Institution Details */}
          <div className="mt-4 space-y-2">
            {institutionData.map((inst, index) => (
              <div key={`institution-${index}-${inst.name}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS.institution[index % COLORS.institution.length] }}
                  />
                  <span className="truncate max-w-[120px]">{inst.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(inst.value)}</p>
                  <p className="text-xs text-muted-foreground">{inst.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Purpose Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Por Modalidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={purposeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {purposeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={Object.values(COLORS.purpose)[index % Object.values(COLORS.purpose).length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Purpose Details */}
          <div className="mt-4 space-y-2">
            {purposeData.map((purpose, index) => (
              <div key={`purpose-${index}-${purpose.name}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: Object.values(COLORS.purpose)[index % Object.values(COLORS.purpose).length] }}
                  />
                  <span>{purpose.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(purpose.value)}</p>
                  <p className="text-xs text-muted-foreground">{purpose.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function translatePurpose(purpose: string): string {
  const translations: Record<string, string> = {
    'Working Capital': 'Capital de Giro',
    'Equipment': 'Equipamentos',
    'Infrastructure': 'Infraestrutura',
    'Land Acquisition': 'Aquisição de Terra',
    'Refinancing': 'Refinanciamento'
  }
  return translations[purpose] || purpose
}