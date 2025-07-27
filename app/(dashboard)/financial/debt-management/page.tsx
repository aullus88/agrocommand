import { DefaultPage } from '@/components/DefaultPage';

export default function DebtManagementPage() {
  return (
    <DefaultPage
      title='Gestão de Dívidas'
      description='Gerencie e acompanhe todas as dívidas e obrigações financeiras'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Análise Financeira', href: '/financial' },
        { label: 'Gestão de Dívidas' },
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
