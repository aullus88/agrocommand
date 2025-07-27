'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WaterfallChart } from '@/components/charts/waterfall-chart'
import { IncomeStatementItem } from '@/types/financial'
import { generateWaterfallData } from '@/utils/financial-calculations'

interface IncomeWaterfallProps {
  data: IncomeStatementItem[]
  className?: string
  showBudgetComparison?: boolean
}

export function IncomeWaterfall({
  data,
  className,
  showBudgetComparison = true
}: IncomeWaterfallProps) {
  // Transform income statement data to waterfall format
  const waterfallData = generateWaterfallData(data)

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            <div>
              <h3 className="text-xl font-bold">Demonstração de Resultados</h3>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Análise em cascata do fluxo financeiro
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Visualização
            </div>
            <div className="text-sm font-semibold text-blue-600">
              Waterfall Chart
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WaterfallChart
          data={waterfallData}
          height={400}
          showBudgetComparison={showBudgetComparison}
          showGrid={true}
        />
      </CardContent>
    </Card>
  )
}