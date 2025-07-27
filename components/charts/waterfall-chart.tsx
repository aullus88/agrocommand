'use client'

import { useState } from 'react'
import { 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { formatCurrency } from '@/utils/financial-calculations'
import { cn } from '@/lib/utils'

interface WaterfallData {
  category: string
  value: number
  cumulative: number
  type: 'positive' | 'negative' | 'total'
  budgetValue?: number
  color: string
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    payload: WaterfallData & {
      start: number
      barValue: number
      height: number
      budgetCumulative?: number
      color: string
    }
  }>
  label?: string
}

interface CustomBarProps {
  payload?: WaterfallData & {
    start: number
    barValue: number
    height: number
    budgetCumulative?: number
    color: string
    value: number
    type: 'positive' | 'negative' | 'total'
  }
  x?: number
  y?: number
  width?: number
  height?: number
  index?: number
}

interface WaterfallChartProps {
  data: WaterfallData[]
  height?: number
  className?: string
  showBudgetComparison?: boolean
  showGrid?: boolean
  title?: string
}

export function WaterfallChart({
  data,
  height = 400,
  className,
  showBudgetComparison = true,
  showGrid = true,
  title
}: WaterfallChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Transform data for waterfall visualization
  const chartData = data.map((item, index) => {
    const prevCumulative = index > 0 ? data[index - 1].cumulative : 0
    
    // For waterfall charts, we need to position bars correctly:
    // - Positive bars start from previous cumulative and go up
    // - Negative bars start from previous cumulative and go down  
    // - Total bars start from zero
    
    let startValue, barValue
    
    if (item.type === 'total') {
      startValue = 0
      barValue = item.value
    } else if (item.type === 'positive') {
      startValue = prevCumulative
      barValue = item.value
    } else { // negative
      startValue = item.cumulative
      barValue = Math.abs(item.value)
    }
    
    return {
      ...item,
      // For positioning the bars
      start: startValue,
      barValue: barValue,
      height: Math.abs(item.value),
      // Budget comparison line
      budgetCumulative: item.budgetValue ? 
        (index > 0 ? (data.slice(0, index + 1).reduce((sum, d) => sum + (d.budgetValue || 0), 0)) : item.budgetValue) : 
        undefined,
      // Ensure color is preserved
      color: item.color
    }
  })


  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0]?.payload
    if (!data) return null

    const getTypeLabel = (type: string) => {
      switch (type) {
        case 'positive': return 'Receita'
        case 'negative': return 'Custo/Despesa'
        case 'total': return 'Total'
        default: return 'Item'
      }
    }

    const getVariationStatus = (value: number, budget: number) => {
      const variance = ((value - budget) / budget) * 100
      if (Math.abs(variance) < 5) return { color: 'text-yellow-600', label: 'Dentro do esperado', icon: '≈' }
      return variance > 0 
        ? { color: 'text-emerald-600', label: 'Acima do orçamento', icon: '↑' }
        : { color: 'text-red-600', label: 'Abaixo do orçamento', icon: '↓' }
    }

    const variation = data.budgetValue ? getVariationStatus(data.value, data.budgetValue) : null

    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl p-4 space-y-3 min-w-72">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-base">{label}</p>
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            data.type === 'positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 
            data.type === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          )}>
            {getTypeLabel(data.type)}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
              Valor:
            </span>
            <span className={cn(
              'font-bold text-lg tabular-nums',
              data.type === 'positive' ? 'text-emerald-600' : 
              data.type === 'negative' ? 'text-red-600' : 
              'text-blue-600'
            )}>
              {data.type === 'negative' ? '-' : ''}
              {formatCurrency(Math.abs(data.value), 'millions')}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Acumulado:</span>
            <span className="font-semibold text-base tabular-nums">
              {formatCurrency(data.cumulative, 'millions')}
            </span>
          </div>
          
          {data.budgetValue && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Orçado:</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(data.budgetValue, 'millions')}
                </span>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Variação:</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('font-bold tabular-nums', variation?.color)}>
                      {variation?.icon} {data.value > data.budgetValue ? '+' : ''}
                      {formatCurrency(data.value - data.budgetValue, 'millions')}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {variation?.label}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const CustomBar = (props: CustomBarProps) => {
    const { payload, x, y, width, height } = props
    
    if (!payload) return null

    const isActive = activeIndex === props.index
    const opacity = isActive ? 1 : 0.85
    const strokeWidth = isActive ? 2 : 0

    // Use the color from the data payload
    const barColor = payload.color || '#64748b'
    const gradientId = `gradient-${payload.type}-${props.index}`
    const strokeColor = payload.type === 'positive' ? '#059669' : 
                       payload.type === 'negative' ? '#dc2626' : '#1d4ed8'

    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={barColor} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        
        {/* Main bar with gradient */}
        <rect
          x={(x ?? 0) + 1}
          y={y ?? 0}
          width={(width ?? 0) - 2}
          height={Math.abs(height ?? 0)}
          fill={`url(#${gradientId})`}
          stroke={isActive ? strokeColor : 'none'}
          strokeWidth={strokeWidth}
          opacity={opacity}
          className="transition-all duration-300 hover:opacity-100 cursor-pointer"
          rx={3}
          ry={3}
        />
        
        {/* Subtle border for definition */}
        <rect
          x={(x ?? 0) + 1}
          y={y ?? 0}
          width={(width ?? 0) - 2}
          height={Math.abs(height ?? 0)}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={0.5}
          rx={3}
          ry={3}
        />
        
        {/* Value label with better styling */}
        <text
          x={(x ?? 0) + (width ?? 0) / 2}
          y={payload.type === 'negative' ? (y ?? 0) - 8 : (y ?? 0) + Math.abs(height ?? 0) + 16}
          textAnchor="middle"
          fontSize={11}
          fontWeight="600"
          fill={payload.type === 'negative' ? '#7c2d12' : '#0f172a'}
          className="transition-opacity duration-200"
          opacity={isActive ? 1 : 0.8}
        >
          {formatCurrency(Math.abs(payload.value), 'millions')}
        </text>
      </g>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            )}
            
            <XAxis 
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={60}
              fontSize={12}
              className="fill-muted-foreground"
            />
            
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, 'millions')}
              fontSize={12}
              className="fill-muted-foreground"
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line at zero */}
            <ReferenceLine y={0} stroke="currentColor" className="stroke-muted-foreground" />
            
            {/* Waterfall bars - invisible positioning bars */}
            <Bar
              dataKey="start"
              stackId="waterfall"
              fill="transparent"
            />
            
            {/* Waterfall bars - visible bars */}
            <Bar
              dataKey="barValue"
              stackId="waterfall"
              shape={<CustomBar />}
            />
            
            {/* Budget comparison line */}
            {showBudgetComparison && (
              <Line
                type="monotone"
                dataKey="budgetCumulative"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#64748b', strokeWidth: 0, r: 3 }}
                connectNulls={false}
              />
            )}
            
            {/* Cumulative line */}
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#0f172a"
              strokeWidth={4}
              dot={{ fill: '#0f172a', strokeWidth: 2, stroke: '#ffffff', r: 5 }}
              activeDot={{ r: 7, stroke: '#0f172a', strokeWidth: 3, fill: '#ffffff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Enhanced Legend */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded shadow-sm" />
            <span className="font-medium">Receitas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-b from-red-500 to-red-600 rounded shadow-sm" />
            <span className="font-medium">Custos/Despesas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded shadow-sm" />
            <span className="font-medium">Totais</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-3 border-gray-800 rounded-full bg-white shadow-sm" />
            <span className="font-medium">Acumulado</span>
          </div>
          {showBudgetComparison && (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-0.5 bg-gray-500 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-60" style={{ 
                  backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 3px, #64748b 3px, #64748b 6px)' 
                }} />
              </div>
              <span className="font-medium">Orçamento</span>
            </div>
          )}
        </div>
        
        {/* Summary info */}
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground text-center">
          <span>💡 Passe o mouse sobre as barras para ver detalhes • A linha conecta os valores acumulados</span>
        </div>
      </div>
    </div>
  )
}