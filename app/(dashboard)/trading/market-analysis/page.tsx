import { DefaultPage } from '@/components/DefaultPage';

export default function MarketAnalysisPage() {
  return (
    <DefaultPage
      title='Análise de Mercado'
      description='Acompanhe tendências e análises de mercado para commodities'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Comercialização e Hedge', href: '/trading' },
        { label: 'Análise de Mercado' },
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
