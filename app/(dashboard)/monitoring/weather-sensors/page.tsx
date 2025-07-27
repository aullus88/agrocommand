import { DefaultPage } from '@/components/DefaultPage';

export default function WeatherSensorsPage() {
  return (
    <DefaultPage
      title='Clima e Sensores'
      description='Monitore condições climáticas e dados dos sensores em tempo real'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Monitoramento', href: '/monitoring' },
        { label: 'Clima e Sensores' },
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
