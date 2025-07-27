import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FormSkeletonProps {
  fields?: number
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

export function FormSkeleton({
  fields = 3,
  showHeader = true,
  showFooter = true,
  className
}: FormSkeletonProps) {
  return (
    <Card className={cn('w-full max-w-md mx-auto animate-pulse', className)}>
      {showHeader && (
        <CardHeader>
          <CardTitle>
            <div className="h-7 bg-muted rounded w-32" />
          </CardTitle>
          <CardDescription>
            <div className="h-4 bg-muted rounded w-48" />
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Form Fields */}
        <div className="space-y-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-10 bg-muted rounded" />
            </div>
          ))}
        </div>
        
        {showFooter && (
          <>
            {/* Submit Button */}
            <div className="h-10 bg-muted rounded" />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2">
                  <div className="h-3 bg-muted rounded w-24" />
                </span>
              </div>
            </div>
            
            {/* Alternative Action */}
            <div className="h-10 bg-muted rounded" />
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized form skeletons
export function LoginFormSkeleton() {
  return (
    <FormSkeleton
      fields={2}
      showHeader={true}
      showFooter={true}
    />
  )
}

export function SignUpFormSkeleton() {
  return (
    <FormSkeleton
      fields={3}
      showHeader={true}
      showFooter={true}
    />
  )
}

export function ContactFormSkeleton() {
  return (
    <FormSkeleton
      fields={4}
      showHeader={true}
      showFooter={false}
      className="max-w-lg"
    />
  )
}

export function SearchFormSkeleton() {
  return (
    <div className="flex items-center space-x-2 animate-pulse">
      <div className="h-10 bg-muted rounded flex-1" />
      <div className="h-10 bg-muted rounded w-20" />
    </div>
  )
}