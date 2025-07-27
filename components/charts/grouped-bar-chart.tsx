'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { TrendArrow } from '@/components/charts/trend-indicator'
import { formatCurrency } from '@/utils/financial-calculations'
import { cn } from '@/lib/utils'

interface ChartDataItem {
  [key: string]: string | number | undefined
  efficiency?: number | undefined
  trend?: 'up' | 'down' | 'stable' | undefined
}

interface TooltipPayload {
  value: number
  name: string
  color: string
  dataKey: string
}

interface LegendPayload {
  value: string
  color: string
  type: string
}

interface GroupedBarChartProps {
  data: ChartDataItem[]
  bars: {
    dataKey: string
    name: string
    color: string
    show: boolean
  }[]
  height?: number
  className?: string
  title?: string
  showGrid?: boolean
  showLegend?: boolean
  layout?: 'horizontal' | 'vertical'
  categoryKey?: string
  showEfficiencyIndicators?: boolean
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number, name: string) => [string, string]
}

export function GroupedBarChart({
  data,
  bars,
  height = 400,
  className,
  title,
  showGrid = true,
  showLegend = true,
  layout = 'vertical',
  categoryKey = 'category',
  showEfficiencyIndicators = true,
  yAxisFormatter = (value) => formatCurrency(value, 'thousands'),
  tooltipFormatter = (value, name) => [formatCurrency(value, 'thousands'), name]
}: GroupedBarChartProps) {
  const CustomTooltip = ({ 
    active, 
    payload, 
    label 
  }: {
    active?: boolean
    payload?: TooltipPayload[]
    label?: string
  }) => {
    if (!active || !payload || payload.length === 0) return null

    const categoryData = data.find(item => item[categoryKey] === label)

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-2">
        <p className="font-medium">{label}</p>
        <div className="space-y-1">
          {payload?.map((entry: TooltipPayload, index: number) => (
            <div key={index} className="flex justify-between items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-medium">
                {tooltipFormatter(entry.value, entry.name)[0]}
              </span>
            </div>
          )) || []}
        </div>
        
        {/* Efficiency indicators */}
        {categoryData?.efficiency !== undefined && (
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Eficiência:</span>
              <span className={cn(
                'font-medium',
                categoryData.efficiency > 0 ? 'text-red-600' : 'text-emerald-600'
              )}>
                {categoryData.efficiency > 0 ? '+' : ''}{categoryData.efficiency.toFixed(1)}%
              </span>
            </div>
            {categoryData.trend && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tendência:</span>
                <div className="flex items-center space-x-1">
                  <TrendArrow trend={categoryData.trend} size="sm" />
                  <span className="capitalize">{categoryData.trend}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const CustomLegend = ({ payload }: { payload?: LegendPayload[] }) => {
    if (!showLegend) return null

    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {payload?.map((entry: LegendPayload, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  const visibleBars = bars.filter(bar => bar.show)


  if (layout === 'horizontal') {
    return (
      <div className={cn('w-full', className)}>
        {title && (
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
        )}
        
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="horizontal"
              margin={{ top: 20, right: 80, left: 100, bottom: 5 }}
            >
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              )}
              
              <XAxis 
                type="number"
                tickFormatter={yAxisFormatter}
                fontSize={12}
                className="fill-muted-foreground"
              />
              
              <YAxis 
                type="category"
                dataKey={categoryKey}
                fontSize={12}
                className="fill-muted-foreground"
                width={100}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {showLegend && <Legend content={<CustomLegend />} />}
              
              {visibleBars.map((bar) => (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  name={bar.name}
                  fill={bar.color}
                  radius={[0, 2, 2, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            )}
            
            <XAxis 
              dataKey={categoryKey}
              angle={-45}
              textAnchor="end"
              height={60}
              fontSize={12}
              className="fill-muted-foreground"
            />
            
            <YAxis 
              tickFormatter={yAxisFormatter}
              fontSize={12}
              className="fill-muted-foreground"
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {showLegend && <Legend content={<CustomLegend />} />}
            
            {visibleBars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Efficiency summary */}
      {showEfficiencyIndicators && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-2">Análise de Eficiência</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acima do Orçamento:</span>
              <span className="font-medium text-red-600">
                {data.filter(item => (item.efficiency ?? 0) > 5).length} categorias
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dentro do Orçamento:</span>
              <span className="font-medium text-yellow-600">
                {data.filter(item => Math.abs(item.efficiency ?? 0) <= 5).length} categorias
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Abaixo do Orçamento:</span>
              <span className="font-medium text-emerald-600">
                {data.filter(item => (item.efficiency ?? 0) < -5).length} categorias
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend for efficiency indicators */}
      {showEfficiencyIndicators && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 bg-emerald-500 rounded" />
            <span>Abaixo Orçamento</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 bg-yellow-500 rounded" />
            <span>Dentro Orçamento</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 bg-red-500 rounded" />
            <span>Acima Orçamento</span>
          </div>
        </div>
      )}
    </div>
  )
}