import { DefaultPage } from '@/components/DefaultPage';

export default function TradingPositionsPage() {
  return (
    <DefaultPage
      title='Posições e Contratos'
      description='Gerencie posições de trading e contratos futuros'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Comercialização e Hedge', href: '/trading' },
        { label: 'Posições e Contratos' },
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
