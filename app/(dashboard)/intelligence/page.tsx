import { DefaultPage } from '@/components/DefaultPage';

export default function IntelligencePage() {
  return (
    <DefaultPage
      title='Inteligência Competitiva'
      description='Acompanhe concorrentes e tendências do mercado'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Inteligência Competitiva' },
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
