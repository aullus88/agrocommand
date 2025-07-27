import { DefaultPage } from '@/components/DefaultPage';

export default function LogisticsPage() {
  return (
    <DefaultPage
      title='Logística e Armazenagem'
      description='Gerencie logística, armazenagem e transporte'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Logística e Armazenagem' },
      ]}
    >
      <div className='text-center'>
        <h2 className='text-2xl font-semibold text-muted-foreground'>
          Página em construção
        </h2>
      </div>
    </DefaultPage>
  );
}
