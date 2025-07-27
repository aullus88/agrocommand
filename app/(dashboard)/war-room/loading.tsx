export default function WarRoomLoading() {
  return (
    <div className='container mx-auto p-6'>
      <div className='space-y-2'>
        <div className='h-8 w-64 bg-muted rounded animate-pulse' />
        <div className='h-4 w-96 bg-muted rounded animate-pulse' />
      </div>
    </div>
  );
}
