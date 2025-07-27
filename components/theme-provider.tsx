'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return children with no theme on server/initial render
    return <>{children}</>
  }

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}