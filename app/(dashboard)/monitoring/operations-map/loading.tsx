  

export default function OperationsMapLoading() {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='space-y-2'>
        <div className='h-8 w-64 bg-muted rounded animate-pulse' />
        <div className='h-4 w-96 bg-muted rounded animate-pulse' />
      </div>

      <div className='grid gap-6'>
        {/* Map Section Skeleton */}
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <div className='p-6'>
            <div className='h-6 w-48 bg-muted rounded animate-pulse mb-4' />
            <div className='h-96 bg-muted rounded-lg animate-pulse' />
          </div>
        </div>

        {/* Operations Status Skeleton */}
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <div className='p-6'>
            <div className='h-6 w-48 bg-muted rounded animate-pulse mb-4' />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='p-4 bg-muted rounded-lg animate-pulse'>
                  <div className='h-4 w-24 bg-muted-foreground/20 rounded mb-2' />
                  <div className='h-8 w-12 bg-muted-foreground/20 rounded' />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Locations Skeleton */}
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <div className='p-6'>
            <div className='h-6 w-48 bg-muted rounded animate-pulse mb-4' />
            <div className='space-y-4'>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='space-y-2'>
                    <div className='h-4 w-48 bg-muted rounded animate-pulse' />
                    <div className='h-3 w-32 bg-muted rounded animate-pulse' />
                  </div>
                  <div className='text-right space-y-2'>
                    <div className='h-4 w-16 bg-muted rounded animate-pulse ml-auto' />
                    <div className='h-3 w-24 bg-muted rounded animate-pulse ml-auto' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
