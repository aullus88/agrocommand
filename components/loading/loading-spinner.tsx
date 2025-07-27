import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  color?: 'primary' | 'secondary' | 'muted'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  muted: 'text-muted-foreground'
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text,
  color = 'primary' 
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color],
          className
        )} 
      />
      {text && (
        <span className={cn('text-sm', colorClasses[color])}>
          {text}
        </span>
      )}
    </div>
  )
}

// Specialized loading spinners
export function ButtonSpinner({ size = 'sm', ...props }: LoadingSpinnerProps) {
  return <LoadingSpinner size={size} {...props} />
}

export function PageSpinner({ size = 'lg', text = 'Loading...', ...props }: LoadingSpinnerProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <LoadingSpinner size={size} text={text} {...props} />
    </div>
  )
}

export function InlineSpinner({ size = 'sm', ...props }: LoadingSpinnerProps) {
  return <LoadingSpinner size={size} {...props} />
}

// Custom spinner with dots animation
export function DotsSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  )
}

// Pulse animation loader
export function PulseLoader({ 
  className, 
  count = 3 
}: { 
  className?: string
  count?: number 
}) {
  return (
    <div className={cn('flex space-x-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 bg-primary rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.15}s`
          }}
        />
      ))}
    </div>
  )
}

// Progress bar loader
interface ProgressLoaderProps {
  progress?: number
  className?: string
  showPercentage?: boolean
}

export function ProgressLoader({ 
  progress, 
  className, 
  showPercentage = false 
}: ProgressLoaderProps) {
  const isIndeterminate = progress === undefined
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Loading...</span>
        {showPercentage && progress !== undefined && (
          <span className="text-sm text-muted-foreground">{progress}%</span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full bg-primary transition-all duration-300',
            isIndeterminate && 'animate-pulse'
          )}
          style={{
            width: isIndeterminate ? '100%' : `${progress}%`
          }}
        />
      </div>
    </div>
  )
}