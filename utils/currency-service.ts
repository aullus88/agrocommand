// Currency exchange rate service using ExchangeRate-API
// https://exchangerate-api.com/ - Free tier: 1,500 requests/month

export interface ExchangeRates {
  base: string
  date: string
  rates: Record<string, number>
  success: boolean
  timestamp: number
}

export interface CurrencyConversion {
  from: string
  to: string
  amount: number
  result: number
  rate: number
  date: string
}

// Cache for exchange rates (5 minute cache to avoid API limits)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
let cachedRates: { data: ExchangeRates; timestamp: number } | null = null

/**
 * Fetch latest exchange rates from ExchangeRate-API
 * Base currency is USD
 */
export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  // Check cache first
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    return cachedRates.data
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ExchangeRates = await response.json()

    if (!data.success && data.success !== undefined) {
      throw new Error('API returned error response')
    }

    // Cache the result
    cachedRates = {
      data,
      timestamp: Date.now()
    }

    return data
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    
    // Return fallback rates if API fails (using approximate current rates)
    return {
      base: 'USD',
      date: new Date().toISOString().split('T')[0],
      rates: {
        BRL: 5.50, // USD to BRL
        EUR: 0.92, // USD to EUR
        USD: 1.00  // USD to USD
      },
      success: false,
      timestamp: Date.now()
    }
  }
}

/**
 * Convert amount from one currency to BRL
 */
export const convertToBRL = async (amount: number, fromCurrency: string): Promise<CurrencyConversion> => {
  if (fromCurrency === 'BRL' || fromCurrency === 'R$') {
    return {
      from: fromCurrency,
      to: 'BRL',
      amount,
      result: amount,
      rate: 1.0,
      date: new Date().toISOString().split('T')[0]
    }
  }

  try {
    const rates = await fetchExchangeRates()
    
    let rate: number
    
    if (fromCurrency === 'USD' || fromCurrency === 'US$') {
      // USD to BRL
      rate = rates.rates.BRL || 5.50
    } else if (fromCurrency === 'EUR' || fromCurrency === '€UR') {
      // EUR to BRL (via USD)
      const eurToUsd = 1 / (rates.rates.EUR || 0.92)
      const usdToBrl = rates.rates.BRL || 5.50
      rate = eurToUsd * usdToBrl
    } else {
      throw new Error(`Unsupported currency: ${fromCurrency}`)
    }

    const result = amount * rate

    return {
      from: fromCurrency,
      to: 'BRL',
      amount,
      result,
      rate,
      date: rates.date
    }
  } catch (error) {
    console.error('Error converting currency:', error)
    
    // Fallback rates
    const fallbackRates: Record<string, number> = {
      'USD': 5.50,
      'US$': 5.50,
      'EUR': 6.00,
      '€UR': 6.00
    }
    
    const rate = fallbackRates[fromCurrency] || 1.0
    const result = amount * rate

    return {
      from: fromCurrency,
      to: 'BRL',
      amount,
      result,
      rate,
      date: new Date().toISOString().split('T')[0]
    }
  }
}

/**
 * Convert multiple currency amounts to BRL
 */
export const convertMultipleToBRL = async (
  items: Array<{ amount: number; currency: string }>
): Promise<Array<CurrencyConversion & { originalIndex: number }>> => {
  try {
    const rates = await fetchExchangeRates()
    
    return await Promise.all(
      items.map(async (item, index) => {
        const conversion = await convertToBRL(item.amount, item.currency)
        return {
          ...conversion,
          originalIndex: index
        }
      })
    )
  } catch (error) {
    console.error('Error converting multiple currencies:', error)
    throw error
  }
}

/**
 * Get current exchange rates for display
 */
export const getCurrentRates = async (): Promise<{
  usdToBrl: number
  eurToBrl: number
  lastUpdated: string
  source: string
}> => {
  try {
    const rates = await fetchExchangeRates()
    
    // Calculate EUR to BRL via USD
    const eurToUsd = 1 / (rates.rates.EUR || 0.92)
    const usdToBrl = rates.rates.BRL || 5.50
    const eurToBrl = eurToUsd * usdToBrl

    return {
      usdToBrl,
      eurToBrl,
      lastUpdated: rates.date,
      source: 'ExchangeRate-API'
    }
  } catch (error) {
    console.error('Error getting current rates:', error)
    
    return {
      usdToBrl: 5.50,
      eurToBrl: 6.00,
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'Fallback'
    }
  }
}

/**
 * Format currency value with proper symbol
 */
export const formatCurrencyValue = (amount: number, currency: string): string => {
  const currencyMap: Record<string, { symbol: string; locale: string }> = {
    'BRL': { symbol: 'R$', locale: 'pt-BR' },
    'R$': { symbol: 'R$', locale: 'pt-BR' },
    'USD': { symbol: '$', locale: 'en-US' },
    'US$': { symbol: '$', locale: 'en-US' },
    'EUR': { symbol: '€', locale: 'de-DE' },
    '€UR': { symbol: '€', locale: 'de-DE' }
  }

  const config = currencyMap[currency] || { symbol: currency, locale: 'pt-BR' }
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency === 'R$' ? 'BRL' : currency === 'US$' ? 'USD' : currency === '€UR' ? 'EUR' : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}