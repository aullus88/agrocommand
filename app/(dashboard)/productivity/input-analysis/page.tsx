import { DefaultPage } from '@/components/DefaultPage';

export default function InputAnalysisPage() {
  return (
    <DefaultPage
      title='Análise de Insumos'
      description='Analise o uso e eficiência de insumos agrícolas'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Produtividade e Qualidade', href: '/productivity' },
        { label: 'Análise de Insumos' },
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
