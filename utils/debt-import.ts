import { createClient } from '@/utils/supabase/client'

// Interface for raw CSV data
export interface RawDebtPayment {
  AGENTE: string
  MODALIDADE: string
  'NR.CONTRATO': string
  'TX. JUR.': string
  'OBJETO FINANCIADO': string
  'DATA CONTRATO': string
  MOE: string
  PARC: string
  'VENCIM. PARCELA': string
  ANO: string
  MÊS: string
  DIA: string
  'VLR. CAPITAL PARCELA': string
  'JUROS PARCELA': string
  'TOT. CAPITAL + JUROS': string
  'SALDO(Capital) Parc.': string
  'SALDO(Juros) Parc.': string
  'SALDO A PAGAR': string
  'ROLAGEM?': string
  CAMBIO: string
  'VALOR A PAGAR EM REAIS': string
  DOCUMENTO: string
}

// Interface for processed debt payment
export interface DebtPayment {
  agente: string
  modalidade: string
  nr_contrato: string
  tx_jur: number | null
  objeto_financiado: string
  data_contrato: string | null
  moeda: string
  documento: string
  parc_current: number
  parc_total: number
  vencim_parcela: string
  ano: number
  mes: number
  dia: number
  vlr_capital_parcela: number
  juros_parcela: number
  tot_capital_juros: number
  saldo_capital_parc: number
  saldo_juros_parc: number
  saldo_a_pagar: number
  rolagem: boolean
  cambio: number | null
  valor_pagar_reais: number | null
  status: 'pending' | 'paid' | 'overdue'
}

// Utility functions for data cleaning
export const cleanCurrencyValue = (value: string): number => {
  if (!value || value.trim() === '' || value === '-') return 0
  
  // Remove currency symbols, spaces, and convert commas to dots
  const cleaned = value
    .replace(/R\$\s*/g, '')
    .replace(/\s+/g, '')
    .replace(/\./g, '') // Remove thousand separators
    .replace(/,/g, '.') // Convert decimal separator
  
  const numValue = parseFloat(cleaned)
  return isNaN(numValue) ? 0 : numValue
}

export const cleanPercentageValue = (value: string): number | null => {
  if (!value || value.trim() === '' || value === '-') return null
  
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
  const numValue = parseFloat(cleaned)
  return isNaN(numValue) ? null : numValue
}

export const parseInstallment = (parc: string): { current: number; total: number } => {
  // Parse strings like "(2/8)", "(1/1)", "(22/36)"
  const match = parc.match(/\((\d+)\/(\d+)\)/)
  if (match) {
    return {
      current: parseInt(match[1]),
      total: parseInt(match[2])
    }
  }
  return { current: 1, total: 1 }
}

export const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null
  
  // Parse DD/MM/YYYY format
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (match) {
    const [, day, month, year] = match
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  return null
}

export const determinePaymentStatus = (dueDate: string): 'pending' | 'paid' | 'overdue' => {
  const today = new Date()
  const due = new Date(dueDate)
  
  if (due > today) {
    return 'pending'
  } else {
    // For past dates, we'll assume overdue unless we have payment confirmation
    return 'overdue'
  }
}

// Process raw CSV data into structured format
export const processDebtPayment = (raw: RawDebtPayment): DebtPayment => {
  const installment = parseInstallment(raw.PARC)
  const dueDate = parseDate(raw['VENCIM. PARCELA'])
  
  return {
    agente: raw.AGENTE?.trim() || '',
    modalidade: raw.MODALIDADE?.trim() || '',
    nr_contrato: raw['NR.CONTRATO']?.trim() || '',
    tx_jur: cleanPercentageValue(raw['TX. JUR.']),
    objeto_financiado: raw['OBJETO FINANCIADO']?.trim() || '',
    data_contrato: parseDate(raw['DATA CONTRATO']),
    moeda: raw.MOE?.trim() || 'R$',
    documento: raw.DOCUMENTO?.trim() || '',
    parc_current: installment.current,
    parc_total: installment.total,
    vencim_parcela: dueDate || '',
    ano: parseInt(raw.ANO) || 2025,
    mes: parseInt(raw.MÊS) || 1,
    dia: parseInt(raw.DIA) || 1,
    vlr_capital_parcela: cleanCurrencyValue(raw['VLR. CAPITAL PARCELA']),
    juros_parcela: cleanCurrencyValue(raw['JUROS PARCELA']),
    tot_capital_juros: cleanCurrencyValue(raw['TOT. CAPITAL + JUROS']),
    saldo_capital_parc: cleanCurrencyValue(raw['SALDO(Capital) Parc.']),
    saldo_juros_parc: cleanCurrencyValue(raw['SALDO(Juros) Parc.']),
    saldo_a_pagar: cleanCurrencyValue(raw['SALDO A PAGAR']),
    rolagem: raw['ROLAGEM?']?.trim().toLowerCase() === 'sim',
    cambio: cleanPercentageValue(raw.CAMBIO),
    valor_pagar_reais: cleanCurrencyValue(raw['VALOR A PAGAR EM REAIS']) || null,
    status: dueDate ? determinePaymentStatus(dueDate) : 'pending'
  }
}

// Import debt payments to Supabase
export const importDebtPayments = async (payments: DebtPayment[]) => {
  const supabase = createClient()
  
  try {
    // Clear existing data (optional - you might want to keep historical data)
    // await supabase.from('debt_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Insert new data in batches
    const batchSize = 100
    const results = []
    
    for (let i = 0; i < payments.length; i += batchSize) {
      const batch = payments.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('debt_payments')
        .upsert(batch, {
          onConflict: 'nr_contrato,parc_current,vencim_parcela',
          ignoreDuplicates: false
        })
      
      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error)
        throw error
      }
      
      results.push(data)
    }
    
    return {
      success: true,
      imported: payments.length,
      results
    }
  } catch (error) {
    console.error('Error importing debt payments:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Parse CSV content and import to database
export const parseAndImportCSV = async (csvContent: string) => {
  const lines = csvContent.split('\n')
  const headers = lines[0].split(';')
  
  const rawPayments: RawDebtPayment[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split(';')
    const payment: any = {}
    
    headers.forEach((header, index) => {
      payment[header.trim()] = values[index]?.trim() || ''
    })
    
    rawPayments.push(payment as RawDebtPayment)
  }
  
  // Process raw data
  const processedPayments = rawPayments.map(processDebtPayment)
  
  // Import to database
  const result = await importDebtPayments(processedPayments)
  
  return {
    ...result,
    rawCount: rawPayments.length,
    processedCount: processedPayments.length
  }
}

// Generate past payments based on PARC column
export const generatePastPayments = (futurePayments: DebtPayment[]): DebtPayment[] => {
  const pastPayments: DebtPayment[] = []
  
  // Group by contract
  const contractGroups = futurePayments.reduce((acc, payment) => {
    if (!acc[payment.nr_contrato]) {
      acc[payment.nr_contrato] = []
    }
    acc[payment.nr_contrato].push(payment)
    return acc
  }, {} as Record<string, DebtPayment[]>)
  
  // For each contract, generate past payments
  Object.entries(contractGroups).forEach(([contractNumber, payments]) => {
    const firstPayment = payments[0]
    if (!firstPayment) return
    
    // Generate past payments based on the pattern
    for (let parc = 1; parc < firstPayment.parc_current; parc++) {
      // Calculate past due date (assuming monthly payments)
      const baseDate = new Date(firstPayment.vencim_parcela)
      const pastDate = new Date(baseDate)
      pastDate.setMonth(pastDate.getMonth() - (firstPayment.parc_current - parc))
      
      const pastPayment: DebtPayment = {
        ...firstPayment,
        parc_current: parc,
        vencim_parcela: pastDate.toISOString().split('T')[0],
        ano: pastDate.getFullYear(),
        mes: pastDate.getMonth() + 1,
        dia: pastDate.getDate(),
        status: 'paid' // Assume past payments were made
      }
      
      pastPayments.push(pastPayment)
    }
  })
  
  return pastPayments
}