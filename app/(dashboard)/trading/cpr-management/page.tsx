import { DefaultPage } from '@/components/DefaultPage';

export default function CPRManagementPage() {
  return (
    <DefaultPage
      title='Gestão CPR'
      description='Gerencie Cédulas de Produto Rural e financiamentos'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Comercialização e Hedge', href: '/trading' },
        { label: 'Gestão CPR' },
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
