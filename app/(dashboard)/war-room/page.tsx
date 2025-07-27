import { DefaultPage } from '@/components/DefaultPage';

export default function WarRoomPage() {
  return (
    <DefaultPage
      title='Centro de Comando (War Room)'
      description='Painel executivo para tomada de decisões críticas'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Centro de Comando' },
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
