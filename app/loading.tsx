export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Loading Spinner */}
        <div className="w-8 h-8 border-4 border-primary/20 border-l-primary rounded-full animate-spin mx-auto" />
        
        {/* Loading Text */}
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-20 mx-auto animate-pulse" />
          <div className="h-3 bg-muted/60 rounded w-32 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}