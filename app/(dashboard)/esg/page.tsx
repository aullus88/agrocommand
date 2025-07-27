import { DefaultPage } from '@/components/DefaultPage';

export default function ESGPage() {
  return (
    <DefaultPage
      title='ESG e Sustentabilidade'
      description='Acompanhe indicadores ESG e práticas sustentáveis'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'ESG e Sustentabilidade' },
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
