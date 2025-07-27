import { DefaultPage } from '@/components/DefaultPage';

export default function OperationsMapPage() {
  return (
    <DefaultPage
      title='Mapa de Operações'
      description='Visualize e monitore todas as operações em campo em tempo real'
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Monitoramento', href: '/monitoring' },
        { label: 'Mapa de Operações' },
      ]}
    >
      <div className='grid gap-6'>
        {/* Map Section */}
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <div className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Mapa Interativo</h2>
            <div className='h-96 bg-muted rounded-lg flex items-center justify-center'>
              <p className='text-muted-foreground'>
                Mapa de operações será implementado aqui
              </p>
            </div>
          </div>
        </div>

        {/* Operations Status */}
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <div className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Status das Operações</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='p-4 bg-green-50 dark:bg-green-950 rounded-lg'>
                <h3 className='font-medium text-green-800 dark:text-green-200'>
                  Em Andamento
                </h3>
                <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  12
                </p>
              </div>
              <div className='p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg'>
                <h3 className='font-medium text-yellow-800 dark:text-yellow-200'>
                  Pendentes
                </h3>
                <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                  5
                </p>
              </div>
              <div className='p-4 bg-blue-50 dark:bg-blue-950 rounded-lg'>
                <h3 className='font-medium text-blue-800 dark:text-blue-200'>
                  Concluídas
                </h3>
                <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  28
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Locations */}
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <div className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>
              Localização dos Equipamentos
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <h3 className='font-medium'>Trator John Deere 5075E</h3>
                  <p className='text-sm text-muted-foreground'>
                    Talhão A-12 • Operação: Plantio
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-green-600'>Ativo</p>
                  <p className='text-xs text-muted-foreground'>
                    Última atualização: 2 min atrás
                  </p>
                </div>
              </div>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <h3 className='font-medium'>Pulverizador Case IH</h3>
                  <p className='text-sm text-muted-foreground'>
                    Talhão B-08 • Operação: Aplicação
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-yellow-600'>
                    Manutenção
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Última atualização: 15 min atrás
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPage>
  );
}
