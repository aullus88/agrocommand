import { cn } from '@/lib/utils'

interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  showActions?: boolean
  className?: string
}

export function ListSkeleton({ 
  items = 5, 
  showAvatar = false, 
  showActions = false,
  className 
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 animate-pulse">
          {showAvatar && (
            <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
          )}
          
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-8" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Specialized list skeletons
export function AppointmentListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50 animate-pulse">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-3 bg-muted rounded w-32" />
          </div>
          <div className="text-right space-y-2">
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-6 bg-muted rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 animate-pulse">
          <div className="w-2 h-2 bg-muted rounded-full" />
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-64" />
        </div>
      ))}
    </div>
  )
}

export function MenuListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2 rounded animate-pulse">
          <div className="w-4 h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
      ))}
    </div>
  )
}