import { DefaultPage } from '@/components/DefaultPage';

export default function RiskPanelPage() {
  return (
    <DefaultPage
      title='Painel de Riscos'
      description='Monitore e gerencie riscos operacionais e financeiros'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gestão de Riscos', href: '/risk-management' },
        { label: 'Painel de Riscos' },
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
