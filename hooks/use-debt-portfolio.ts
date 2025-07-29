import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DebtPortfolio, DebtFilters, DebtContract } from '@/types/debt-management'
import { mockDebtPortfolio, mockDefaultDebtFilters } from '@/data/mock-debt-data'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API functions
const fetchDebtPortfolio = async (filters: DebtFilters): Promise<DebtPortfolio> => {
  await delay(1000)
  
  // In a real app, this would apply filters to the data
  // For now, return mock data
  return mockDebtPortfolio
}

const updateContract = async (contractId: string, updates: Partial<DebtContract>): Promise<DebtContract> => {
  await delay(500)
  
  // Find and update the contract in mock data
  const contract = mockDebtPortfolio.contracts.find(c => c.id === contractId)
  if (!contract) throw new Error('Contract not found')
  
  return { ...contract, ...updates }
}

// Main hook for debt portfolio data
export const useDebtPortfolio = (filters?: DebtFilters) => {
  const appliedFilters = filters || mockDefaultDebtFilters
  
  return useQuery({
    queryKey: ['debt-portfolio', appliedFilters],
    queryFn: () => fetchDebtPortfolio(appliedFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  })
}

// Hook for updating a debt contract
export const useUpdateContract = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ contractId, updates }: { contractId: string; updates: Partial<DebtContract> }) => 
      updateContract(contractId, updates),
    onSuccess: (updatedContract) => {
      // Update the cache
      queryClient.setQueryData(['debt-portfolio'], (old: DebtPortfolio | undefined) => {
        if (!old) return old
        
        return {
          ...old,
          contracts: old.contracts.map(c => 
            c.id === updatedContract.id ? updatedContract : c
          )
        }
      })
    }
  })
}

// Hook for covenant monitoring with real-time updates
export const useCovenantMonitoring = () => {
  return useQuery({
    queryKey: ['covenant-monitoring'],
    queryFn: async () => {
      await delay(500)
      return mockDebtPortfolio.covenants
    },
    refetchInterval: 30 * 1000, // Check every 30 seconds
    staleTime: 15 * 1000,
  })
}

// Hook for currency risk data
export const useCurrencyRisk = () => {
  return useQuery({
    queryKey: ['currency-risk'],
    queryFn: async () => {
      await delay(750)
      return mockDebtPortfolio.currencyRisk
    },
    refetchInterval: 5 * 60 * 1000, // Every 5 minutes
    staleTime: 2 * 60 * 1000,
  })
}

// Hook for scenario analysis
export const useScenarioAnalysis = () => {
  return useQuery({
    queryKey: ['scenario-analysis'],
    queryFn: async () => {
      await delay(800)
      return mockDebtPortfolio.scenarios
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for debt KPIs with real-time updates
export const useDebtKPIs = () => {
  return useQuery({
    queryKey: ['debt-kpis'],
    queryFn: async () => {
      await delay(400)
      // In a real app, this would calculate KPIs from the portfolio data
      const { overview } = mockDebtPortfolio
      
      return [
        {
          id: 'total-debt',
          label: 'Dívida Total',
          value: overview.totalDebt,
          unit: 'R$',
          change: 2.3,
          changeType: 'negative' as const,
          status: 'warning' as const
        },
        {
          id: 'usd-exposure',
          label: 'Exposição USD',
          value: overview.usdExposurePercent,
          unit: '%',
          change: -1.5,
          changeType: 'positive' as const,
          status: 'warning' as const
        },
        {
          id: 'avg-rate',
          label: 'Taxa Média',
          value: overview.avgWeightedRate,
          unit: '% a.a.',
          change: 0.3,
          changeType: 'negative' as const,
          status: 'warning' as const
        },
        {
          id: 'dscr',
          label: 'DSCR',
          value: overview.dscr,
          unit: 'x',
          change: -0.05,
          changeType: 'negative' as const,
          status: 'good' as const
        },
        {
          id: 'debt-ebitda',
          label: 'Dívida/EBITDA',
          value: overview.debtToEbitda,
          unit: 'x',
          change: 0.08,
          changeType: 'negative' as const,
          status: 'good' as const
        },
        {
          id: 'next-payment',
          label: 'Próximo Pgto',
          value: overview.nextPayment.amount,
          unit: 'R$',
          change: overview.nextPayment.daysUntil,
          changeType: 'neutral' as const,
          status: 'warning' as const
        }
      ]
    },
    refetchInterval: 30 * 1000, // Every 30 seconds
    staleTime: 15 * 1000,
  })
}