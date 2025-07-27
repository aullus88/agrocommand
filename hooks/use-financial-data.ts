'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  FinancialFilters, 
  ExportOptions, 
  AlertConfig 
} from '@/types/financial'
import { 
  financialApi, 
  financialQueryKeys 
} from '@/services/financial-api'

/**
 * Hook for fetching complete financial overview data
 */
export const useFinancialOverview = (filters?: Partial<FinancialFilters>) => {
  return useQuery({
    queryKey: financialQueryKeys.overview(filters),
    queryFn: () => financialApi.getFinancialOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching KPI data
 */
export const useFinancialKPIs = (filters?: Partial<FinancialFilters>) => {
  return useQuery({
    queryKey: financialQueryKeys.kpis(filters),
    queryFn: () => financialApi.getKPIs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

/**
 * Hook for fetching income statement data
 */
export const useIncomeStatement = (filters?: Partial<FinancialFilters>) => {
  return useQuery({
    queryKey: financialQueryKeys.incomeStatement(filters),
    queryFn: () => financialApi.getIncomeStatement(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook for fetching cost breakdown data
 */
export const useCostBreakdown = (filters?: Partial<FinancialFilters>) => {
  return useQuery({
    queryKey: financialQueryKeys.costBreakdown(filters),
    queryFn: () => financialApi.getCostBreakdown(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook for fetching margin evolution data
 */
export const useMarginEvolution = (filters?: Partial<FinancialFilters>) => {
  return useQuery({
    queryKey: financialQueryKeys.marginEvolution(filters),
    queryFn: () => financialApi.getMarginEvolution(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes (historical data changes less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 2,
  })
}

/**
 * Hook for fetching cost per hectare data
 */
export const useCostPerHectare = (filters?: Partial<FinancialFilters>) => {
  return useQuery({
    queryKey: financialQueryKeys.costPerHectare(filters),
    queryFn: () => financialApi.getCostPerHectare(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook for fetching financial indicators
 */
export const useFinancialIndicators = (filters?: Partial<FinancialFilters>) => {
  return useQuery({
    queryKey: financialQueryKeys.financialIndicators(filters),
    queryFn: () => financialApi.getFinancialIndicators(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook for fetching drill-down data
 */
export const useDrillDownData = (
  metricId: string, 
  filters?: Partial<FinancialFilters>,
  enabled = true
) => {
  return useQuery({
    queryKey: financialQueryKeys.drillDown(metricId, filters),
    queryFn: () => financialApi.getDrillDownData(metricId, filters),
    enabled: enabled && !!metricId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

/**
 * Hook for exporting financial data
 */
export const useExportFinancialData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options: ExportOptions) => financialApi.exportData(options),
    onSuccess: (response) => {
      toast.success(response.message || 'Export generated successfully', {
        description: 'Your file will be downloaded shortly',
        action: {
          label: 'Download',
          onClick: () => window.open(response.data.downloadUrl, '_blank')
        }
      })
    },
    onError: (error) => {
      toast.error('Export failed', {
        description: error.message || 'Failed to generate export file'
      })
    }
  })
}

/**
 * Hook for saving alert configurations
 */
export const useSaveAlert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alert: Omit<AlertConfig, 'id'>) => financialApi.saveAlert(alert),
    onSuccess: (response) => {
      toast.success('Alert saved successfully', {
        description: `Alert "${response.data.name}" has been configured`
      })
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: (error) => {
      toast.error('Failed to save alert', {
        description: error.message || 'Could not save alert configuration'
      })
    }
  })
}

/**
 * Hook for sharing dashboard
 */
export const useShareDashboard = () => {
  return useMutation({
    mutationFn: ({ sections, filters }: { 
      sections: string[]
      filters: FinancialFilters 
    }) => financialApi.shareDashboard(sections, filters),
    onSuccess: (response) => {
      // Copy to clipboard
      navigator.clipboard.writeText(response.data.shareUrl)
      
      toast.success('Dashboard shared successfully', {
        description: 'Share link has been copied to clipboard',
        action: {
          label: 'Open',
          onClick: () => window.open(response.data.shareUrl, '_blank')
        }
      })
    },
    onError: (error) => {
      toast.error('Failed to share dashboard', {
        description: error.message || 'Could not generate share link'
      })
    }
  })
}

/**
 * Hook for invalidating all financial data
 */
export const useRefreshFinancialData = () => {
  const queryClient = useQueryClient()

  const refreshAll = () => {
    queryClient.invalidateQueries({ 
      queryKey: financialQueryKeys.all 
    })
    toast.success('Financial data refreshed', {
      description: 'All financial data has been updated'
    })
  }

  const refreshSection = (section: keyof typeof financialQueryKeys) => {
    if (section === 'all') {
      refreshAll()
      return
    }

    // Type-safe invalidation for specific sections
    queryClient.invalidateQueries({ 
      queryKey: [financialQueryKeys.all[0], section] 
    })
    toast.success('Section refreshed', {
      description: `${section} data has been updated`
    })
  }

  return {
    refreshAll,
    refreshSection,
    isRefreshing: queryClient.isFetching({ 
      queryKey: financialQueryKeys.all 
    }) > 0
  }
}

/**
 * Combined hook for all financial data with loading states
 */
export const useFinancialDashboard = (filters?: Partial<FinancialFilters>) => {
  const overview = useFinancialOverview(filters)
  const kpis = useFinancialKPIs(filters)
  const incomeStatement = useIncomeStatement(filters)
  const costBreakdown = useCostBreakdown(filters)
  const marginEvolution = useMarginEvolution(filters)
  const costPerHectare = useCostPerHectare(filters)
  const financialIndicators = useFinancialIndicators(filters)

  const isLoading = 
    overview.isLoading || 
    kpis.isLoading || 
    incomeStatement.isLoading || 
    costBreakdown.isLoading || 
    marginEvolution.isLoading || 
    costPerHectare.isLoading || 
    financialIndicators.isLoading

  const isError = 
    overview.isError || 
    kpis.isError || 
    incomeStatement.isError || 
    costBreakdown.isError || 
    marginEvolution.isError || 
    costPerHectare.isError || 
    financialIndicators.isError

  const error = 
    overview.error || 
    kpis.error || 
    incomeStatement.error || 
    costBreakdown.error || 
    marginEvolution.error || 
    costPerHectare.error || 
    financialIndicators.error

  return {
    // Individual query results
    overview,
    kpis,
    incomeStatement,
    costBreakdown,
    marginEvolution,
    costPerHectare,
    financialIndicators,
    
    // Combined states
    isLoading,
    isError,
    error,
    
    // Data access
    data: {
      overview: overview.data?.data,
      kpis: kpis.data?.data,
      incomeStatement: incomeStatement.data?.data,
      costBreakdown: costBreakdown.data?.data,
      marginEvolution: marginEvolution.data?.data,
      costPerHectare: costPerHectare.data?.data,
      financialIndicators: financialIndicators.data?.data
    }
  }
}