import { DefaultPage } from '@/components/DefaultPage';

export default function FieldPerformancePage() {
  return (
    <DefaultPage
      title='Performance por Talhão'
      description='Acompanhe a produtividade e performance de cada talhão'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Produtividade e Qualidade', href: '/productivity' },
        { label: 'Performance por Talhão' },
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
