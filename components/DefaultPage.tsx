'use client'

import { ReactNode } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DefaultPageProps {
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  children: ReactNode
  headerActions?: ReactNode
  className?: string
}

export function DefaultPage({
  title,
  description,
  breadcrumbs = [],
  children,
  headerActions,
  className = '',
}: DefaultPageProps) {
  return (
    <>
      {/* Fixed Header */}
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />

          {breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink href={item.href}>
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>

        {headerActions && <div className="ml-auto px-4">{headerActions}</div>}
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`@container/main p-6 ${className}`}>
          {/* Page Header */}
          {(title || description) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              )}
              {description && (
                <p className="text-muted-foreground mt-2">{description}</p>
              )}
            </div>
          )}

          {/* Page Content */}
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </>
  )
}
