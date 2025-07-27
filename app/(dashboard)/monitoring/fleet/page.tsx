import { DefaultPage } from '@/components/DefaultPage';

export default function FleetPage() {
  return (
    <DefaultPage
      title='Frota e Equipamentos'
      description='Gerencie sua frota de máquinas e equipamentos agrícolas'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Monitoramento', href: '/monitoring' },
        { label: 'Frota e Equipamentos' },
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
