'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoadingBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorMessage?: string
  retryText?: string
  onRetry?: () => void
}

function NetworkAwareError({ 
  error, 
  resetErrorBoundary, 
  errorMessage, 
  retryText = "Try again" 
}: {
  error: Error
  resetErrorBoundary: () => void
  errorMessage?: string
  retryText?: string
}) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        {!isOnline ? (
          <WifiOff className="w-12 h-12 text-muted-foreground mx-auto" />
        ) : (
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {!isOnline ? 'No internet connection' : 'Something went wrong'}
          </h3>
          <p className="text-muted-foreground mt-2">
            {!isOnline 
              ? 'Please check your internet connection and try again.' 
              : errorMessage || 'An error occurred while loading this content.'
            }
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <Alert className="text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <details>
                <summary className="cursor-pointer font-medium">
                  Error details (development only)
                </summary>
                <pre className="mt-2 text-xs overflow-auto bg-muted p-2 rounded">
                  {error.message}
                  {error.stack && `\n${error.stack}`}
                </pre>
              </details>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={resetErrorBoundary} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryText}
          </Button>
          
          {!isOnline && (
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Reload page
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function LoadingBoundary({
  children,
  fallback = <div>Loading...</div>,
  errorMessage,
  retryText,
  onRetry,
}: LoadingBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <NetworkAwareError
          error={error}
          resetErrorBoundary={() => {
            onRetry?.()
            resetErrorBoundary()
          }}
          errorMessage={errorMessage}
          retryText={retryText}
        />
      )}
      onReset={onRetry}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Specialized loading boundaries for common use cases
export function DataLoadingBoundary({
  children,
  skeleton,
  errorMessage = "Failed to load data"
}: {
  children: React.ReactNode
  skeleton?: React.ReactNode
  errorMessage?: string
}) {
  return (
    <LoadingBoundary
      fallback={skeleton}
      errorMessage={errorMessage}
    >
      {children}
    </LoadingBoundary>
  )
}

export function FormLoadingBoundary({
  children,
  fallback,
  onRetry
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  onRetry?: () => void
}) {
  return (
    <LoadingBoundary
      fallback={fallback}
      errorMessage="Failed to load form data"
      retryText="Reload form"
      onRetry={onRetry}
    >
      {children}
    </LoadingBoundary>
  )
}

export function ChartLoadingBoundary({
  children,
  skeleton,
  onRetry
}: {
  children: React.ReactNode
  skeleton?: React.ReactNode
  onRetry?: () => void
}) {
  return (
    <LoadingBoundary
      fallback={skeleton}
      errorMessage="Failed to load chart data"
      retryText="Reload chart"
      onRetry={onRetry}
    >
      {children}
    </LoadingBoundary>
  )
}