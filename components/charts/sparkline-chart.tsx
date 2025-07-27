'use client'

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { cn } from '@/lib/utils'

interface SparklineChartProps {
  data: number[]
  className?: string
  color?: string
  strokeWidth?: number
  height?: number
  showDots?: boolean
}

export function SparklineChart({
  data,
  className,
  color = '#10b981',
  strokeWidth = 2,
  height = 40,
  showDots = false
}: SparklineChartProps) {
  // Transform data for Recharts
  const chartData = data.map((value, index) => ({
    index,
    value
  }))

  // Calculate min and max for better scaling
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const padding = (maxValue - minValue) * 0.1

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <YAxis 
            hide 
            domain={[minValue - padding, maxValue + padding]} 
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={showDots ? { fill: color, strokeWidth: 0, r: 2 } : false}
            activeDot={false}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface SparklineBarChartProps {
  data: number[]
  className?: string
  color?: string
  height?: number
}

export function SparklineBarChart({
  data,
  className,
  color = '#3b82f6',
  height = 40
}: SparklineBarChartProps) {
  const maxValue = Math.max(...data)
  
  return (
    <div className={cn('flex items-end space-x-0.5', className)} style={{ height }}>
      {data.map((value, index) => (
        <div
          key={index}
          className="flex-1 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
          style={{
            height: `${(value / maxValue) * 100}%`,
            backgroundColor: color,
            minHeight: '2px'
          }}
        />
      ))}
    </div>
  )
}