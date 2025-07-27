import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CardSkeletonProps {
  showHeader?: boolean
  showFooter?: boolean
  headerLines?: number
  contentLines?: number
  className?: string
}

export function CardSkeleton({
  showHeader = true,
  showFooter = false,
  headerLines = 2,
  contentLines = 3,
  className
}: CardSkeletonProps) {
  return (
    <Card className={cn('animate-pulse', className)}>
      {showHeader && (
        <CardHeader>
          <div className="space-y-2">
            {Array.from({ length: headerLines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-4 bg-muted rounded',
                  i === 0 ? 'w-3/4' : 'w-1/2'
                )}
              />
            ))}
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: contentLines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-3 bg-muted rounded',
                i === contentLines - 1 ? 'w-2/3' : 'w-full'
              )}
            />
          ))}
        </div>
      </CardContent>
      
      {showFooter && (
        <div className="p-6 pt-0">
          <div className="h-8 bg-muted rounded w-24" />
        </div>
      )}
    </Card>
  )
}

// Specialized card skeletons
export function StatsCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-5 bg-muted rounded w-5" />
      </CardHeader>
      <CardContent>
        <div className="h-7 bg-muted rounded w-16 mb-2" />
        <div className="h-3 bg-muted rounded w-32" />
      </CardContent>
    </Card>
  )
}

export function UserCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-muted rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-48" />
          </div>
          <div className="h-8 bg-muted rounded w-20" />
        </div>
      </CardContent>
    </Card>
  )
}