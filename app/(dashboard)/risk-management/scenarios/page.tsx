import { DefaultPage } from '@/components/DefaultPage';

export default function ScenariosPage() {
  return (
    <DefaultPage
      title='Cenários e Simulações'
      description='Simule diferentes cenários e seus impactos na operação'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gestão de Riscos', href: '/risk-management' },
        { label: 'Cenários e Simulações' },
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
