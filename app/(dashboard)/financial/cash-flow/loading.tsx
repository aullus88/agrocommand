import { DefaultPage } from '@/components/DefaultPage';

export default function CashFlowLoading() {
  return (
    <DefaultPage
      title="Fluxo de Caixa"
      description="Carregando dados de fluxo de caixa..."
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Análise Financeira', href: '/financial' },
        { label: 'Fluxo de Caixa' },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    </DefaultPage>
  );
}
