import { DefaultPage } from '@/components/DefaultPage';

export default function AlertsPage() {
  return (
    <DefaultPage
      title='Alertas e Contingências'
      description='Gerencie alertas e planos de contingência'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gestão de Riscos', href: '/risk-management' },
        { label: 'Alertas e Contingências' },
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
