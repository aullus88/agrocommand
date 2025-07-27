import { DefaultPage } from '@/components/DefaultPage';

export default function BenchmarksPage() {
  return (
    <DefaultPage
      title='Histórico e Benchmarks'
      description='Compare performance histórica e benchmarks do setor'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Produtividade e Qualidade', href: '/productivity' },
        { label: 'Histórico e Benchmarks' },
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
