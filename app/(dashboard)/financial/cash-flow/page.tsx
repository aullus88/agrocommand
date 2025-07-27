import { DefaultPage } from '@/components/DefaultPage';

export default function CashFlowPage() {
  return (
    <DefaultPage
      title='Fluxo de Caixa'
      description='Acompanhe entradas, saídas e projeções de caixa'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Análise Financeira', href: '/financial' },
        { label: 'Fluxo de Caixa' },
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
