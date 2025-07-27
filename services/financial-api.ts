import { 
  FinancialOverviewData, 
  FinancialApiResponse, 
  FinancialFilters,
  ExportOptions,
  AlertConfig
} from '@/types/financial'
import { 
  mockFinancialOverviewData,
  simulateApiCall
} from '@/data/mock-financial-data'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const API_TIMEOUT = 10000

class FinancialApiService {
  private baseUrl: string

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Fetch financial overview data
   */
  async getFinancialOverview(
    filters?: Partial<FinancialFilters>
  ): Promise<FinancialApiResponse<FinancialOverviewData>> {
    try {
      // In production, this would be a real API call
      // const response = await fetch(`${this.baseUrl}/financial/overview`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ filters }),
      //   signal: AbortSignal.timeout(API_TIMEOUT)
      // })
      
      // For now, simulate API call with mock data
      const data = await simulateApiCall(mockFinancialOverviewData, 800)
      
      return {
        data: {
          ...data,
          filters: {
            ...data.filters,
            ...filters
          }
        },
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching financial overview:', error)
      throw new Error('Failed to fetch financial overview data')
    }
  }

  /**
   * Fetch KPI data only
   */
  async getKPIs(filters?: Partial<FinancialFilters>) {
    try {
      const data = await simulateApiCall(mockFinancialOverviewData.kpis, 300)
      
      return {
        data,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error)
      throw new Error('Failed to fetch KPI data')
    }
  }

  /**
   * Fetch income statement data
   */
  async getIncomeStatement(filters?: Partial<FinancialFilters>) {
    try {
      const data = await simulateApiCall(mockFinancialOverviewData.incomeStatement, 400)
      
      return {
        data,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching income statement:', error)
      throw new Error('Failed to fetch income statement data')
    }
  }

  /**
   * Fetch cost breakdown data
   */
  async getCostBreakdown(filters?: Partial<FinancialFilters>) {
    try {
      const data = await simulateApiCall(mockFinancialOverviewData.costBreakdown, 500)
      
      return {
        data,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching cost breakdown:', error)
      throw new Error('Failed to fetch cost breakdown data')
    }
  }

  /**
   * Fetch margin evolution data
   */
  async getMarginEvolution(filters?: Partial<FinancialFilters>) {
    try {
      const data = await simulateApiCall(mockFinancialOverviewData.marginEvolution, 600)
      
      return {
        data,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching margin evolution:', error)
      throw new Error('Failed to fetch margin evolution data')
    }
  }

  /**
   * Fetch cost per hectare data
   */
  async getCostPerHectare(filters?: Partial<FinancialFilters>) {
    try {
      const data = await simulateApiCall(mockFinancialOverviewData.costPerHectare, 350)
      
      return {
        data,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching cost per hectare:', error)
      throw new Error('Failed to fetch cost per hectare data')
    }
  }

  /**
   * Fetch financial indicators
   */
  async getFinancialIndicators(filters?: Partial<FinancialFilters>) {
    try {
      const data = await simulateApiCall(mockFinancialOverviewData.financialIndicators, 450)
      
      return {
        data,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching financial indicators:', error)
      throw new Error('Failed to fetch financial indicators data')
    }
  }

  /**
   * Export financial data
   */
  async exportData(options: ExportOptions): Promise<FinancialApiResponse<{ downloadUrl: string }>> {
    try {
      // Simulate export processing
      await simulateApiCall(null, 2000)
      
      // In production, this would return a real download URL
      const downloadUrl = `/api/exports/financial-${options.format}-${Date.now()}.${options.format}`
      
      return {
        data: { downloadUrl },
        success: true,
        message: `Export ${options.format.toUpperCase()} generated successfully`,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      throw new Error('Failed to export financial data')
    }
  }

  /**
   * Save alert configuration
   */
  async saveAlert(alert: Omit<AlertConfig, 'id'>): Promise<FinancialApiResponse<AlertConfig>> {
    try {
      // Simulate API call
      await simulateApiCall(null, 500)
      
      const savedAlert: AlertConfig = {
        ...alert,
        id: `alert_${Date.now()}`
      }
      
      return {
        data: savedAlert,
        success: true,
        message: 'Alert saved successfully',
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error saving alert:', error)
      throw new Error('Failed to save alert configuration')
    }
  }

  /**
   * Share dashboard
   */
  async shareDashboard(
    sections: string[],
    filters: FinancialFilters
  ): Promise<FinancialApiResponse<{ shareUrl: string }>> {
    try {
      // Simulate API call
      await simulateApiCall(null, 800)
      
      // Generate a share URL (in production, this would be a real shareable link)
      const shareId = btoa(JSON.stringify({ sections, filters })).slice(0, 16)
      const shareUrl = `${window.location.origin}/shared/financial/${shareId}`
      
      return {
        data: { shareUrl },
        success: true,
        message: 'Dashboard shared successfully',
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error sharing dashboard:', error)
      throw new Error('Failed to share dashboard')
    }
  }

  /**
   * Get detailed drill-down data for a specific metric
   */
  async getDrillDownData(
    metricId: string,
    filters?: Partial<FinancialFilters>
  ): Promise<FinancialApiResponse<any>> {
    try {
      // Simulate drill-down data based on metric
      let drillDownData: any = {}
      
      switch (metricId) {
        case 'total_revenue':
          drillDownData = {
            byMonth: [
              { month: 'Jan', soybean: 0, corn: 0 },
              { month: 'Feb', soybean: 125000000, corn: 18750000 },
              { month: 'Mar', soybean: 210000000, corn: 31500000 },
              { month: 'Apr', soybean: 153000000, corn: 22950000 },
              { month: 'May', soybean: 0, corn: 0 }
            ],
            byPlot: [
              { plot: 'Talhão A1', area: 12500, revenue: 139750000 },
              { plot: 'Talhão A2', area: 15000, revenue: 167700000 },
              { plot: 'Talhão B1', area: 22500, revenue: 251550000 }
            ]
          }
          break
        case 'production_costs':
          drillDownData = {
            byCategory: mockFinancialOverviewData.costBreakdown,
            byMonth: [
              { month: 'Sep', value: 45000000 },
              { month: 'Oct', value: 52000000 },
              { month: 'Nov', value: 38000000 },
              { month: 'Dec', value: 28000000 }
            ]
          }
          break
        default:
          drillDownData = { message: 'No drill-down data available for this metric' }
      }
      
      const data = await simulateApiCall(drillDownData, 600)
      
      return {
        data,
        success: true,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error fetching drill-down data:', error)
      throw new Error('Failed to fetch drill-down data')
    }
  }
}

// Export singleton instance
export const financialApi = new FinancialApiService()

// Query keys for TanStack Query
export const financialQueryKeys = {
  all: ['financial'] as const,
  overview: (filters?: Partial<FinancialFilters>) => 
    ['financial', 'overview', filters] as const,
  kpis: (filters?: Partial<FinancialFilters>) => 
    ['financial', 'kpis', filters] as const,
  incomeStatement: (filters?: Partial<FinancialFilters>) => 
    ['financial', 'income-statement', filters] as const,
  costBreakdown: (filters?: Partial<FinancialFilters>) => 
    ['financial', 'cost-breakdown', filters] as const,
  marginEvolution: (filters?: Partial<FinancialFilters>) => 
    ['financial', 'margin-evolution', filters] as const,
  costPerHectare: (filters?: Partial<FinancialFilters>) => 
    ['financial', 'cost-per-hectare', filters] as const,
  financialIndicators: (filters?: Partial<FinancialFilters>) => 
    ['financial', 'indicators', filters] as const,
  drillDown: (metricId: string, filters?: Partial<FinancialFilters>) => 
    ['financial', 'drill-down', metricId, filters] as const,
}