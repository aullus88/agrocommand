import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  className?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="rounded-md border animate-pulse">
        {/* Table Header */}
        {showHeader && (
          <div className="border-b bg-muted/50">
            <div className="flex">
              {Array.from({ length: columns }).map((_, i) => (
                <div key={i} className="flex-1 p-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Table Body */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1 p-4">
                  <div 
                    className={cn(
                      'h-4 bg-muted rounded',
                      colIndex === 0 ? 'w-full' : 'w-3/4'
                    )}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Specialized table skeletons
export function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="flex space-x-2">
          <div className="h-10 bg-muted rounded w-24" />
          <div className="h-10 bg-muted rounded w-10" />
        </div>
      </div>
      
      {/* Table */}
      <TableSkeleton rows={8} columns={5} />
      
      {/* Pagination */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="flex space-x-2">
          <div className="h-8 bg-muted rounded w-20" />
          <div className="h-8 bg-muted rounded w-8" />
          <div className="h-8 bg-muted rounded w-8" />
          <div className="h-8 bg-muted rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function SimpleTableSkeleton() {
  return <TableSkeleton rows={3} columns={3} showHeader={false} />
}

export function InvoiceTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center animate-pulse">
        <div className="h-6 bg-muted rounded w-32" />
        <div className="h-8 bg-muted rounded w-24" />
      </div>
      <TableSkeleton rows={6} columns={4} />
      <div className="flex justify-end animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-6 bg-muted rounded w-24" />
        </div>
      </div>
    </div>
  )
}