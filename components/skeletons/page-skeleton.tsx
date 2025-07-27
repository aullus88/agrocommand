import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PageSkeletonProps {
  showHeader?: boolean
  showSidebar?: boolean
  layout?: 'single' | 'two-column' | 'three-column'
  className?: string
}

export function PageSkeleton({
  showHeader = true,
  showSidebar = false,
  layout = 'single',
  className
}: PageSkeletonProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header Skeleton */}
      {showHeader && <HeaderSkeleton />}
      
      <div className="flex">
        {/* Sidebar Skeleton */}
        {showSidebar && <SidebarSkeleton />}
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {layout === 'single' && <SingleColumnSkeleton />}
          {layout === 'two-column' && <TwoColumnSkeleton />}
          {layout === 'three-column' && <ThreeColumnSkeleton />}
        </main>
      </div>
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <header className="bg-card border-b animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-6 bg-muted rounded w-20" />
            <div className="h-9 bg-muted rounded w-9" />
            <div className="h-9 bg-muted rounded w-20" />
          </div>
        </div>
      </div>
    </header>
  )
}

function SidebarSkeleton() {
  return (
    <aside className="w-64 bg-card border-r p-4 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-24" />
        <nav className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2 rounded">
              <div className="w-4 h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-24" />
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}

function SingleColumnSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48" />
      <Card>
        <CardHeader>
          <CardTitle><div className="h-6 bg-muted rounded w-32" /></CardTitle>
          <CardDescription><div className="h-4 bg-muted rounded w-48" /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function TwoColumnSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-48 animate-pulse" />
      <div className="grid grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ThreeColumnSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-48 animate-pulse" />
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-8 bg-muted rounded w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Pre-configured page skeletons
export function DashboardSkeleton() {
  return <PageSkeleton showHeader={true} layout="two-column" />
}

export function ProfileSkeleton() {
  return <PageSkeleton showHeader={true} showSidebar={true} layout="single" />
}

export function SettingsSkeleton() {
  return <PageSkeleton showHeader={true} showSidebar={true} layout="single" />
}