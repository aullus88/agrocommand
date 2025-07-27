'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProgressiveLoaderProps {
  stages: {
    id: string
    component: React.ComponentType
    skeleton: React.ComponentType
    priority?: number
    delay?: number
  }[]
  onStageLoad?: (stageId: string) => void
  onComplete?: () => void
}

export function ProgressiveLoader({ 
  stages, 
  onStageLoad, 
  onComplete 
}: ProgressiveLoaderProps) {
  const [loadedStages, setLoadedStages] = useState<Set<string>>(new Set())
  const mountedRef = useRef(false)

  // Sort stages by priority (lower number = higher priority)
  const sortedStages = [...stages].sort((a, b) => 
    (a.priority || 0) - (b.priority || 0)
  )

  useEffect(() => {
    mountedRef.current = true
    
    // Load stages progressively
    sortedStages.forEach((stage, index) => {
      const delay = stage.delay || (index * 100) // Stagger by 100ms if no delay specified
      
      setTimeout(() => {
        if (!mountedRef.current) return
        
        setLoadedStages(prev => {
          const newSet = new Set(prev)
          newSet.add(stage.id)
          
          onStageLoad?.(stage.id)
          
          // Check if all stages are loaded
          if (newSet.size === stages.length) {
            onComplete?.()
          }
          
          return newSet
        })
      }, delay)
    })

    return () => {
      mountedRef.current = false
    }
  }, [stages, onStageLoad, onComplete, sortedStages])

  return (
    <div className="space-y-6">
      {sortedStages.map((stage) => {
        const isLoaded = loadedStages.has(stage.id)
        const Component = stage.component
        const Skeleton = stage.skeleton

        return (
          <AnimatePresence mode="wait" key={stage.id}>
            {!isLoaded ? (
              <motion.div
                key={`skeleton-${stage.id}`}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Skeleton />
              </motion.div>
            ) : (
              <motion.div
                key={`component-${stage.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Component />
              </motion.div>
            )}
          </AnimatePresence>
        )
      })}
    </div>
  )
}

// Hook for managing progressive loading state
export function useProgressiveLoading<T>(
  loaders: Array<{
    id: string
    loader: () => Promise<T>
    priority?: number
  }>
) {
  const [data, setData] = useState<Record<string, T>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, Error>>({})

  const load = async (id: string) => {
    const loader = loaders.find(l => l.id === id)
    if (!loader) return

    setLoading(prev => ({ ...prev, [id]: true }))
    setErrors(prev => ({ ...prev, [id]: undefined as unknown as Error }))

    try {
      const result = await loader.loader()
      setData(prev => ({ ...prev, [id]: result }))
    } catch (error) {
      setErrors(prev => ({ ...prev, [id]: error as Error }))
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const loadAll = async () => {
    // Sort by priority and load
    const sortedLoaders = [...loaders].sort((a, b) => 
      (a.priority || 0) - (b.priority || 0)
    )

    for (const loader of sortedLoaders) {
      await load(loader.id)
    }
  }

  return {
    data,
    loading,
    errors,
    load,
    loadAll,
    isLoading: (id: string) => loading[id] || false,
    hasError: (id: string) => !!errors[id],
    hasData: (id: string) => !!data[id]
  }
}

// Utility component for stale-while-revalidate pattern
interface StaleWhileRevalidateProps<T> {
  data: T | null
  isStale?: boolean
  children: (data: T) => React.ReactNode
  fallback: React.ReactNode
  staleIndicator?: React.ReactNode
}

export function StaleWhileRevalidate<T>({
  data,
  isStale = false,
  children,
  fallback,
  staleIndicator
}: StaleWhileRevalidateProps<T>) {
  if (!data) {
    return <>{fallback}</>
  }

  return (
    <div className="relative">
      {isStale && staleIndicator && (
        <div className="absolute top-0 right-0 z-10">
          {staleIndicator}
        </div>
      )}
      <div className={isStale ? 'opacity-75' : ''}>
        {children(data)}
      </div>
    </div>
  )
}