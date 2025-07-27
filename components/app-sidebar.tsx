'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Factory,
  HelpCircle,
  Home,
  Leaf,
  Search,
  Settings,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface SubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: SubItem[];
}

const navigationData: NavItem[] = [
  {
    title: 'Visão Executiva',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Monitoramento Operacional',
    url: '/monitoring',
    icon: Factory,
    items: [
      {
        title: 'Mapa de Operações',
        url: '/monitoring/operations-map',
      },
      {
        title: 'Frota e Equipamentos',
        url: '/monitoring/fleet',
      },
      {
        title: 'Clima e Sensores',
        url: '/monitoring/weather-sensors',
      },
    ],
  },
  {
    title: 'Análise Financeira',
    url: '/financial',
    icon: DollarSign,
    items: [
      {
        title: 'Visão Geral Financeira',
        url: '/financial/overview',
      },
      {
        title: 'Gestão de Dívidas',
        url: '/financial/debt-management',
      },
      {
        title: 'Fluxo de Caixa',
        url: '/financial/cash-flow',
      },
    ],
  },
  {
    title: 'Comercialização e Hedge',
    url: '/trading',
    icon: TrendingUp,
    items: [
      {
        title: 'Posições e Contratos',
        url: '/trading/positions',
      },
      {
        title: 'Análise de Mercado',
        url: '/trading/market-analysis',
      },
      {
        title: 'Gestão CPR',
        url: '/trading/cpr-management',
      },
    ],
  },
  {
    title: 'Produtividade e Qualidade',
    url: '/productivity',
    icon: Sprout,
    items: [
      {
        title: 'Performance por Talhão',
        url: '/productivity/field-performance',
      },
      {
        title: 'Análise de Insumos',
        url: '/productivity/input-analysis',
      },
      {
        title: 'Histórico e Benchmarks',
        url: '/productivity/benchmarks',
      },
    ],
  },
  {
    title: 'Gestão de Riscos',
    url: '/risk-management',
    icon: ShieldCheck,
    items: [
      {
        title: 'Painel de Riscos',
        url: '/risk-management/risk-panel',
      },
      {
        title: 'Cenários e Simulações',
        url: '/risk-management/scenarios',
      },
      {
        title: 'Alertas e Contingências',
        url: '/risk-management/alerts',
      },
    ],
  },
  {
    title: 'Logística e Armazenagem',
    url: '/logistics',
    icon: Warehouse,
  },
  {
    title: 'ESG e Sustentabilidade',
    url: '/esg',
    icon: Leaf,
  },
  {
    title: 'Inteligência Competitiva',
    url: '/intelligence',
    icon: BarChart3,
  },
  {
    title: 'Centro de Comando (War Room)',
    url: '/war-room',
    icon: AlertTriangle,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Function to check if a navigation item is active
  const isItemActive = (item: NavItem) => {
    if (item.url === pathname) return true;
    if (item.items) {
      return item.items.some((subItem) => subItem.url === pathname);
    }
    return false;
  };

  // Function to check if a sub-item is active
  const isSubItemActive = (subItem: SubItem) => {
    return subItem.url === pathname;
  };

  // Process navigation data with active states
  const navMain = navigationData.map((item) => ({
    ...item,
    isActive: isItemActive(item),
    items: item.items?.map((subItem) => ({
      ...subItem,
      isActive: isSubItemActive(subItem),
    })),
  }));

  const data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '/avatars/shadcn.jpg',
    },
    navMain,
    navSecondary: [
      {
        title: 'Configurações',
        url: '#',
        icon: Settings,
      },
      {
        title: 'Suporte',
        url: '#',
        icon: HelpCircle,
      },
      {
        title: 'Pesquisar',
        url: '#',
        icon: Search,
      },
    ],
    projects: [],
  };

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/dashboard'>
                <div className='text-sidebar-primary-foreground flex aspect-square size-14 items-center justify-center rounded-lg'>
                  <Image
                    src='/icon.png'
                    alt='Agro Command Logo'
                    width={128}
                    height={128}
                    className='size-14'
                  />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Agro Command</span>
                  <span className='truncate text-xs'>Plataforma Agrícola</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
