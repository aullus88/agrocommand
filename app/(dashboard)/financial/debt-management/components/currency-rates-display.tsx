'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'
import { getCurrentRates } from '@/utils/currency-service'
import { cn } from '@/lib/utils'

interface CurrencyRatesDisplayProps {
  compact?: boolean
  showOnly?: ('usd' | 'eur')[]
}

export function CurrencyRatesDisplay({ compact = false, showOnly }: CurrencyRatesDisplayProps) {
  const { data: rates, isLoading, isError } = useQuery({
    queryKey: ['current-exchange-rates'],
    queryFn: getCurrentRates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 2,
  })

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", compact && "gap-1")}>
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    )
  }

  if (isError || !rates) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <RefreshCw className="h-3 w-3" />
        <span>Taxas indisponíveis</span>
      </div>
    )
  }

  const shouldShowUsd = !showOnly || showOnly.includes('usd')
  const shouldShowEur = !showOnly || showOnly.includes('eur')

  const rateItems = []

  if (shouldShowUsd) {
    rateItems.push({
      currency: 'USD',
      rate: rates.usdToBrl,
      symbol: '$',
      flag: '🇺🇸'
    })
  }

  if (shouldShowEur) {
    rateItems.push({
      currency: 'EUR', 
      rate: rates.eurToBrl,
      symbol: '€',
      flag: '🇪🇺'
    })
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {rateItems.map((item) => (
          <Badge key={item.currency} variant="outline" className="text-xs font-mono">
            <span className="mr-1">{item.flag}</span>
            {item.symbol}1 = R${item.rate.toFixed(4)}
          </Badge>
        ))}
        <Badge variant="secondary" className="text-xs">
          {rates.source === 'ExchangeRate-API' ? 'Live' : 'Fallback'}
        </Badge>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Taxas de Câmbio</h4>
          <Badge variant={rates.source === 'ExchangeRate-API' ? 'default' : 'secondary'} className="text-xs">
            {rates.source === 'ExchangeRate-API' ? 'Tempo Real' : 'Fallback'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rateItems.map((item) => (
            <div key={item.currency} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.flag}</span>
                <div>
                  <p className="text-sm font-medium">{item.currency}/BRL</p>
                  <p className="text-xs text-muted-foreground">
                    {item.symbol}1 = R${item.rate.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono">
                  {item.rate.toFixed(4)}
                </p>
                {/* You could add trend indicators here if you track historical rates */}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground text-center">
          Última atualização: {rates.lastUpdated} • Fonte: {rates.source}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for header use
export function HeaderCurrencyRates() {
  return <CurrencyRatesDisplay compact={true} />
}

// Specific currency rate badge
export function CurrencyRateBadge({ currency }: { currency: 'usd' | 'eur' }) {
  const { data: rates, isLoading } = useQuery({
    queryKey: ['current-exchange-rates'],
    queryFn: getCurrentRates,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })

  if (isLoading || !rates) {
    return <Skeleton className="h-5 w-20" />
  }

  const rate = currency === 'usd' ? rates.usdToBrl : rates.eurToBrl
  const symbol = currency === 'usd' ? '$' : '€'
  const flag = currency === 'usd' ? '🇺🇸' : '🇪🇺'

  return (
    <Badge variant="outline" className="text-xs font-mono">
      <span className="mr-1">{flag}</span>
      {symbol}1 = R${rate.toFixed(4)}
    </Badge>
  )
}