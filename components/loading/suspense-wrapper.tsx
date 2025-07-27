import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface SuspenseWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
}

function DefaultErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Failed to load this section. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm font-medium">
              Error details (dev only)
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <Button onClick={resetErrorBoundary} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}

export function SuspenseWrapper({
  children,
  fallback = <div>Loading...</div>,
  errorFallback: ErrorFallback = DefaultErrorFallback,
  onError,
  onReset
}: SuspenseWrapperProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={onError}
      onReset={onReset}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Convenience wrapper with common patterns
export function AsyncComponent({
  children,
  skeleton,
  ...props
}: SuspenseWrapperProps & {
  skeleton?: React.ReactNode
}) {
  return (
    <SuspenseWrapper
      fallback={skeleton}
      {...props}
    >
      {children}
    </SuspenseWrapper>
  )
}

// Hook for programmatic error boundaries
export function useErrorBoundary() {
  return {
    captureError: (error: Error) => {
      throw error
    }
  }
}