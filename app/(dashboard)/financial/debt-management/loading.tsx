import { DefaultPage } from '@/components/DefaultPage'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DebtManagementLoading() {
  return (
    <DefaultPage
      title="Gestão de Dívidas"
      description="Controle completo do portfólio de dívidas e covenants financeiros"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Financeiro', href: '/financial' },
        { label: 'Gestão de Dívidas' }
      ]}
    >
      <div className="space-y-6">
        {/* Header skeleton */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-[500px]">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
          <Card className="h-[500px]">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Table skeleton */}
        <Card className="h-[600px]">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-[500px] w-full" />
          </CardContent>
        </Card>

        {/* Bottom charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-[400px]">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-[320px] w-full" />
            </CardContent>
          </Card>
          <Card className="h-[400px]">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-[320px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultPage>
  )
}
