'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

interface SubItem {
  title: string;
  url: string;
  isActive?: boolean;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: SubItem[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      data-active={item.isActive}
                      className={item.isActive ? 'bg-accent' : ''}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      <motion.div
                        className='ml-auto'
                        animate={{ rotate: item.isActive ? 90 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <ChevronRight />
                      </motion.div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeInOut',
                        opacity: { duration: 0.2 },
                      }}
                      className='overflow-hidden'
                    >
                      <SidebarMenuSub>
                        <AnimatePresence>
                          {item.items?.map((subItem, index) => (
                            <motion.div
                              key={subItem.title}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -20, opacity: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.05,
                                ease: 'easeOut',
                              }}
                            >
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  data-active={subItem.isActive}
                                  className={
                                    subItem.isActive ? 'bg-accent' : ''
                                  }
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </SidebarMenuSub>
                    </motion.div>
                  </CollapsibleContent>
                </>
              ) : (
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    data-active={item.isActive}
                    className={item.isActive ? 'bg-accent' : ''}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </motion.div>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
