import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Sign Up Form Skeleton */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>
              <div className="h-7 bg-muted rounded w-32 animate-pulse" />
            </CardTitle>
            <CardDescription>
              <div className="h-4 bg-muted rounded w-56 animate-pulse" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form Fields Skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-28 animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
              
              {/* Sign Up Button Skeleton */}
              <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
            
            {/* Divider Skeleton */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2">
                  <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                </span>
              </div>
            </div>
            
            {/* Google Button Skeleton */}
            <div className="h-10 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
        
        {/* Sign in link skeleton */}
        <div className="text-center">
          <div className="h-4 bg-muted rounded w-44 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}