'use client'

import { useState } from 'react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts'
import { formatPercentage } from '@/utils/financial-calculations'
import { cn } from '@/lib/utils'

// Chart data interfaces
interface ChartDataPoint {
  [key: string]: string | number | Record<string, number> | undefined
  period?: string
  sectorBenchmark?: Record<string, number>
}

interface TooltipPayloadEntry {
  color: string
  name: string
  value: number
  dataKey: string
  payload: ChartDataPoint
}

interface TooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}

interface LegendPayloadEntry {
  value: string
  color: string
  dataKey: string
}

interface LegendProps {
  payload?: LegendPayloadEntry[]
}

interface MultiLineChartProps {
  data: ChartDataPoint[]
  lines: {
    dataKey: string
    name: string
    color: string
    strokeWidth?: number
    strokeDasharray?: string
    show: boolean
  }[]
  height?: number
  className?: string
  title?: string
  showGrid?: boolean
  showLegend?: boolean
  showConfidenceInterval?: boolean
  showBenchmark?: boolean
  benchmarkKey?: string
  xAxisKey?: string
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number, name: string) => [string, string]
}

export function MultiLineChart({
  data,
  lines,
  height = 400,
  className,
  title,
  showGrid = true,
  showLegend = true,
  showConfidenceInterval = false,
  showBenchmark = true,
  benchmarkKey = 'sectorBenchmark',
  xAxisKey = 'period',
  yAxisFormatter = (value) => formatPercentage(value),
  tooltipFormatter = (value, name) => [formatPercentage(value), name]
}: MultiLineChartProps) {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())
  const [highlightedLine, setHighlightedLine] = useState<string | null>(null)

  const toggleLine = (dataKey: string) => {
    const newHiddenLines = new Set(hiddenLines)
    if (newHiddenLines.has(dataKey)) {
      newHiddenLines.delete(dataKey)
    } else {
      newHiddenLines.add(dataKey)
    }
    setHiddenLines(newHiddenLines)
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-2">
        <p className="font-medium">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: TooltipPayloadEntry, index: number) => (
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
          ))}
        </div>
        
        {/* Show benchmark if available */}
        {payload[0]?.payload[benchmarkKey] && (
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-muted-foreground mb-1">Benchmark do Setor</div>
            {Object.entries(payload[0].payload[benchmarkKey] as Record<string, number>).map(([key, value]: [string, number]) => (
              <div key={key} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-medium">{formatPercentage(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const CustomLegend = ({ payload }: LegendProps) => {
    if (!showLegend) return null

    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {payload?.map((entry: LegendPayloadEntry, index: number) => {
          const isHidden = hiddenLines.has(entry.dataKey)
          const isHighlighted = highlightedLine === entry.dataKey
          
          return (
            <button
              key={index}
              className={cn(
                "flex items-center space-x-2 text-sm transition-opacity hover:opacity-100",
                isHidden ? "opacity-50" : "opacity-100",
                isHighlighted ? "font-semibold" : ""
              )}
              onClick={() => toggleLine(entry.dataKey)}
              onMouseEnter={() => setHighlightedLine(entry.dataKey)}
              onMouseLeave={() => setHighlightedLine(null)}
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.value}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const visibleLines = lines.filter(line => line.show && !hiddenLines.has(line.dataKey))

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            )}
            
            <XAxis 
              dataKey={xAxisKey}
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
            
            {/* Confidence interval areas */}
            {showConfidenceInterval && visibleLines.map((line, index) => (
              <Area
                key={`${line.dataKey}-confidence`}
                dataKey={`${line.dataKey}ConfidenceUpper`}
                stackId={`confidence-${index}`}
                fill={line.color}
                fillOpacity={0.1}
                stroke="none"
              />
            ))}
            
            {/* Reference line at zero */}
            <ReferenceLine y={0} stroke="currentColor" className="stroke-muted-foreground opacity-50" />
            
            {/* Main lines */}
            {visibleLines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={highlightedLine === line.dataKey ? (line.strokeWidth || 2) + 1 : line.strokeWidth || 2}
                strokeDasharray={line.strokeDasharray}
                dot={{ 
                  fill: line.color, 
                  strokeWidth: 0, 
                  r: highlightedLine === line.dataKey ? 5 : 4,
                  className: "transition-all duration-200"
                }}
                activeDot={{ 
                  r: 6, 
                  stroke: line.color, 
                  strokeWidth: 2, 
                  fill: '#ffffff' 
                }}
                opacity={highlightedLine && highlightedLine !== line.dataKey ? 0.3 : 1}
                className="transition-opacity duration-200"
              />
            ))}
            
            {/* Benchmark lines */}
            {showBenchmark && data[0]?.[benchmarkKey] && Object.keys(data[0][benchmarkKey]).map((key) => {
              const benchmarkLine = visibleLines.find(line => line.dataKey === key)
              if (!benchmarkLine) return null
              
              return (
                <Line
                  key={`benchmark-${key}`}
                  type="monotone"
                  dataKey={`${benchmarkKey}.${key}`}
                  stroke={benchmarkLine.color}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  opacity={0.6}
                />
              )
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart controls */}
      <div className="flex flex-wrap items-center justify-between mt-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>💡 Dica: Clique nas legendas para ocultar/exibir linhas</span>
        </div>
        <div className="flex items-center space-x-4">
          {showBenchmark && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-gray-400" style={{ backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, #9ca3af 2px, #9ca3af 4px)' }} />
              <span>Benchmark Setor</span>
            </div>
          )}
          {showConfidenceInterval && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-200 rounded" />
              <span>Intervalo Confiança</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary statistics */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {visibleLines.map((line) => {
            if (hiddenLines.has(line.dataKey)) return null
            
            const values = data.map(d => d[line.dataKey]).filter(v => v != null && typeof v === 'number') as number[]
            const latest = values[values.length - 1]
            const previous = values[values.length - 2]
            const change = previous ? ((latest - previous) / previous) * 100 : 0
            
            return (
              <div key={line.dataKey}>
                <div className="flex items-center space-x-2 mb-1">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: line.color }}
                  />
                  <span className="text-muted-foreground">{line.name}</span>
                </div>
                <div className="font-medium">
                  {formatPercentage(latest as number)}
                  <span className={cn(
                    'ml-2 text-xs',
                    change >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {change >= 0 ? '+' : ''}{formatPercentage(change, 1, false)}pp
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}