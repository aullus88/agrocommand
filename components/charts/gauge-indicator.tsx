'use client'

import { cn } from '@/lib/utils'

interface GaugeIndicatorProps {
  value: number
  min?: number
  max?: number
  target?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showValue?: boolean
  showTarget?: boolean
  colors?: {
    background?: string
    fill?: string
    target?: string
  }
}

export function GaugeIndicator({
  value,
  min = 0,
  max = 100,
  target,
  size = 'md',
  className,
  showValue = true,
  showTarget = true,
  colors = {}
}: GaugeIndicatorProps) {
  const {
    background = '#e2e8f0',
    fill = '#3b82f6',
    target: targetColor = '#ef4444'
  } = colors

  // Calculate dimensions based on size
  const dimensions = {
    sm: { size: 60, strokeWidth: 4, fontSize: 'text-xs' },
    md: { size: 80, strokeWidth: 6, fontSize: 'text-sm' },
    lg: { size: 100, strokeWidth: 8, fontSize: 'text-base' }
  }

  const { size: svgSize, strokeWidth, fontSize } = dimensions[size]
  const radius = (svgSize - strokeWidth) / 2
  const center = svgSize / 2
  
  // Calculate percentage (0 to 1)
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1)
  
  // For a semicircle gauge (180 degrees)
  const startAngle = 180 // Start from left (180 degrees)
  const endAngle = 0     // End at right (0 degrees)
  const angle = startAngle - (startAngle - endAngle) * percentage
  
  // Calculate path coordinates
  const startX = center - radius * Math.cos((startAngle * Math.PI) / 180)
  const startY = center - radius * Math.sin((startAngle * Math.PI) / 180)
  const endX = center - radius * Math.cos((endAngle * Math.PI) / 180)
  const endY = center - radius * Math.sin((endAngle * Math.PI) / 180)
  
  const valueX = center - radius * Math.cos((angle * Math.PI) / 180)
  const valueY = center - radius * Math.sin((angle * Math.PI) / 180)
  
  // Target position
  const targetPercentage = target ? Math.min(Math.max((target - min) / (max - min), 0), 1) : 0
  const targetAngle = startAngle - (startAngle - endAngle) * targetPercentage
  const targetX = center - radius * Math.cos((targetAngle * Math.PI) / 180)
  const targetY = center - radius * Math.sin((targetAngle * Math.PI) / 180)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={svgSize}
        height={svgSize / 2 + 20}
        viewBox={`0 0 ${svgSize} ${svgSize / 2 + 20}`}
      >
        {/* Background arc */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 0 ${endX} ${endY}`}
          fill="none"
          stroke={background}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        {percentage > 0 && (
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${percentage > 0.5 ? 1 : 0} 0 ${valueX} ${valueY}`}
            fill="none"
            stroke={fill}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        )}
        
        {/* Target indicator */}
        {target && showTarget && targetPercentage > 0 && (
          <circle
            cx={targetX}
            cy={targetY}
            r={strokeWidth / 2 + 1}
            fill={targetColor}
            stroke="white"
            strokeWidth={1}
          />
        )}
      </svg>
      
      {/* Value display */}
      {showValue && (
        <div className={cn(
          'absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center',
          fontSize
        )}>
          <span className="font-semibold tabular-nums">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          {target && showTarget && (
            <span className="text-xs text-muted-foreground">
              /{target}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface LinearGaugeProps {
  value: number
  min?: number
  max?: number
  target?: number
  className?: string
  showValue?: boolean
  height?: number
  colors?: {
    background?: string
    fill?: string
    target?: string
  }
}

export function LinearGauge({
  value,
  min = 0,
  max = 100,
  target,
  className,
  showValue = true,
  height = 8,
  colors = {}
}: LinearGaugeProps) {
  const {
    background = 'hsl(var(--muted))',
    fill = 'hsl(var(--primary))',
    target: targetColor = 'hsl(var(--destructive))'
  } = colors

  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1) * 100
  const targetPercentage = target ? Math.min(Math.max((target - min) / (max - min), 0), 1) * 100 : 0

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Background */}
        <div
          className="w-full rounded-full"
          style={{ height, backgroundColor: background }}
        />
        
        {/* Progress */}
        <div
          className="absolute top-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            height,
            width: `${percentage}%`,
            backgroundColor: fill
          }}
        />
        
        {/* Target indicator */}
        {target && (
          <div
            className="absolute top-0 w-1 rounded-full"
            style={{
              height,
              left: `${targetPercentage}%`,
              backgroundColor: targetColor,
              transform: 'translateX(-50%)'
            }}
          />
        )}
      </div>
      
      {/* Value display */}
      {showValue && (
        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
          <span>{min}</span>
          <span className="font-medium text-foreground">
            {typeof value === 'number' ? value.toFixed(1) : value}
            {target && ` / ${target}`}
          </span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}