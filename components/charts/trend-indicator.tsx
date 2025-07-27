'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable'
  value: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showIcon?: boolean
  showValue?: boolean
  format?: 'percentage' | 'currency' | 'decimal'
}

export function TrendIndicator({
  trend,
  value,
  label,
  size = 'md',
  className,
  showIcon = true,
  showValue = true,
  format = 'percentage'
}: TrendIndicatorProps) {
  const formatValue = (val: number): string => {
    switch (format) {
      case 'percentage':
        return `${Math.abs(val).toFixed(1)}%`
      case 'currency':
        return `R$ ${Math.abs(val).toLocaleString('pt-BR')}`
      case 'decimal':
        return Math.abs(val).toFixed(2)
      default:
        return Math.abs(val).toString()
    }
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }

  const getVariant = () => {
    switch (trend) {
      case 'up':
        return {
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          icon: TrendingUp
        }
      case 'down':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          icon: TrendingDown
        }
      case 'stable':
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          icon: Minus
        }
    }
  }

  const variant = getVariant()
  const Icon = variant.icon

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-md',
      variant.bgColor,
      variant.color,
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <Icon size={iconSizes[size]} className="flex-shrink-0" />
      )}
      
      <div className="flex items-center gap-1">
        {showValue && (
          <span className="font-medium tabular-nums">
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
            {formatValue(value)}
          </span>
        )}
        {label && (
          <span className="text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

interface TrendArrowProps {
  trend: 'up' | 'down' | 'stable'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TrendArrow({ trend, size = 'md', className }: TrendArrowProps) {
  const sizeMap = {
    sm: 12,
    md: 16,
    lg: 20
  }

  const getArrowProps = () => {
    switch (trend) {
      case 'up':
        return {
          icon: TrendingUp,
          className: 'text-emerald-500 dark:text-emerald-400'
        }
      case 'down':
        return {
          icon: TrendingDown,
          className: 'text-red-500 dark:text-red-400'
        }
      case 'stable':
      default:
        return {
          icon: Minus,
          className: 'text-gray-500 dark:text-gray-400'
        }
    }
  }

  const { icon: Icon, className: trendClassName } = getArrowProps()

  return (
    <Icon 
      size={sizeMap[size]} 
      className={cn(trendClassName, className)} 
    />
  )
}

interface TrendBadgeProps {
  trend: 'up' | 'down' | 'stable'
  value: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  format?: 'percentage' | 'currency' | 'decimal'
}

export function TrendBadge({
  trend,
  value,
  label,
  size = 'md',
  className,
  format = 'percentage'
}: TrendBadgeProps) {
  const formatValue = (val: number): string => {
    switch (format) {
      case 'percentage':
        return `${Math.abs(val).toFixed(1)}%`
      case 'currency':
        return `R$ ${Math.abs(val).toLocaleString('pt-BR')}`
      case 'decimal':
        return Math.abs(val).toFixed(2)
      default:
        return Math.abs(val).toString()
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const getVariant = () => {
    switch (trend) {
      case 'up':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'down':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'stable':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      sizeClasses[size],
      getVariant(),
      className
    )}>
      <TrendArrow trend={trend} size={size === 'lg' ? 'md' : 'sm'} />
      <span className="tabular-nums">
        {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
        {formatValue(value)}
      </span>
      {label && <span className="opacity-80">{label}</span>}
    </span>
  )
}