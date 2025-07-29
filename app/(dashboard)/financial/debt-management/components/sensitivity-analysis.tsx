'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Info, 
  Download, 
  Settings,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function SensitivityAnalysis() {
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)

  // Generate sensitivity matrix data (Selic vs USD/BRL)
  const selicRates = [10.0, 11.0, 12.0, 13.25, 14.0, 15.0, 16.0] // Current: 13.25%
  const exchangeRates = [4.80, 5.00, 5.20, 5.42, 5.60, 5.80, 6.00, 6.20, 6.40, 6.60, 6.80] // Current: 5.42
  
  // Calculate impact on debt service (% change)
  const calculateImpact = (selic: number, exchange: number) => {
    const selicImpact = (selic - 13.25) * 2.5 // 2.5% impact per 1% Selic change
    const exchangeImpact = (exchange - 5.42) / 5.42 * 42 // 42% USD exposure
    return selicImpact + exchangeImpact
  }

  const getImpactColor = (impact: number) => {
    if (impact <= -5) return 'bg-green-600 text-white'
    if (impact <= -2) return 'bg-green-400 text-white'
    if (impact <= -0.5) return 'bg-green-200 text-green-800'
    if (impact <= 0.5) return 'bg-gray-100 text-gray-800'
    if (impact <= 2) return 'bg-yellow-200 text-yellow-800'
    if (impact <= 5) return 'bg-orange-400 text-white'
    return 'bg-red-600 text-white'
  }

  const getImpactIcon = (impact: number) => {
    if (impact < -0.5) return <TrendingDown className="h-3 w-3" />
    if (impact > 0.5) return <TrendingUp className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const currentSelicIndex = selicRates.findIndex(rate => rate === 13.25)
  const currentExchangeIndex = exchangeRates.findIndex(rate => rate === 5.42)

  // Probability matrix (simplified)
  const getProbability = (selicIndex: number, exchangeIndex: number) => {
    const selicDistance = Math.abs(selicIndex - currentSelicIndex)
    const exchangeDistance = Math.abs(exchangeIndex - currentExchangeIndex)
    const totalDistance = selicDistance + exchangeDistance
    
    if (totalDistance === 0) return 25 // Current scenario has highest probability
    if (totalDistance === 1) return 20
    if (totalDistance === 2) return 15
    if (totalDistance === 3) return 8
    if (totalDistance === 4) return 5
    return Math.max(1, 5 - totalDistance)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Análise de Sensibilidade</CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Impacto de mudanças na Selic e câmbio no serviço da dívida (%)</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="impact" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="impact">Impacto no Serviço</TabsTrigger>
            <TabsTrigger value="probability">Probabilidades</TabsTrigger>
          </TabsList>
          
          <TabsContent value="impact">
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">Impacto:</span>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white">
                  <TrendingDown className="h-3 w-3" />
                  <span>Redução &gt;2%</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-200 text-green-800">
                  <span>Redução &lt;2%</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-800">
                  <Minus className="h-3 w-3" />
                  <span>Neutro</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-200 text-yellow-800">
                  <span>Aumento &lt;2%</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white">
                  <TrendingUp className="h-3 w-3" />
                  <span>Aumento &gt;5%</span>
                </div>
              </div>

              {/* Heatmap */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-muted-foreground">
                        Selic \ USD/BRL
                      </th>
                      {exchangeRates.map((rate, idx) => (
                        <th key={idx} className={cn(
                          "p-2 text-center min-w-16",
                          idx === currentExchangeIndex && "font-bold text-blue-600"
                        )}>
                          {rate.toFixed(2)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selicRates.map((selicRate, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className={cn(
                          "p-2 font-medium",
                          rowIdx === currentSelicIndex && "font-bold text-blue-600"
                        )}>
                          {selicRate.toFixed(1)}%
                        </td>
                        {exchangeRates.map((exchangeRate, colIdx) => {
                          const impact = calculateImpact(selicRate, exchangeRate)
                          const isCurrentScenario = rowIdx === currentSelicIndex && colIdx === currentExchangeIndex
                          const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                          
                          return (
                            <td key={colIdx} className="p-0">
                              <div
                                className={cn(
                                  "p-2 text-center cursor-pointer transition-all hover:scale-105 relative",
                                  getImpactColor(impact),
                                  isCurrentScenario && "ring-2 ring-blue-500 ring-offset-1",
                                  isSelected && "scale-105 shadow-lg"
                                )}
                                onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  {getImpactIcon(impact)}
                                  <span className="font-medium">
                                    {impact > 0 ? '+' : ''}{impact.toFixed(1)}%
                                  </span>
                                </div>
                                {isCurrentScenario && (
                                  <div className="absolute -top-1 -right-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  </div>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected cell details */}
              {selectedCell && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Cenário Selecionado</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Selic:</span>
                      <span className="ml-2 font-medium">
                        {selicRates[selectedCell.row].toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">USD/BRL:</span>
                      <span className="ml-2 font-medium">
                        {exchangeRates[selectedCell.col].toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impacto:</span>
                      <span className="ml-2 font-medium">
                        {calculateImpact(
                          selicRates[selectedCell.row], 
                          exchangeRates[selectedCell.col]
                        ).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Probabilidade:</span>
                      <span className="ml-2 font-medium">
                        {getProbability(selectedCell.row, selectedCell.col)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="probability">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Probabilidade de ocorrência de cada cenário (%)
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-muted-foreground">
                        Selic \ USD/BRL
                      </th>
                      {exchangeRates.map((rate, idx) => (
                        <th key={idx} className="p-2 text-center min-w-16">
                          {rate.toFixed(2)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selicRates.map((selicRate, rowIdx) => (
                      <tr key={rowIdx}>
                        <td className="p-2 font-medium">
                          {selicRate.toFixed(1)}%
                        </td>
                        {exchangeRates.map((exchangeRate, colIdx) => {
                          const probability = getProbability(rowIdx, colIdx)
                          const isCurrentScenario = rowIdx === currentSelicIndex && colIdx === currentExchangeIndex
                          
                          return (
                            <td key={colIdx} className="p-0">
                              <div
                                className={cn(
                                  "p-2 text-center",
                                  probability >= 20 ? "bg-blue-600 text-white" :
                                  probability >= 15 ? "bg-blue-400 text-white" :
                                  probability >= 8 ? "bg-blue-200 text-blue-800" :
                                  probability >= 5 ? "bg-gray-200 text-gray-800" :
                                  "bg-gray-100 text-gray-600",
                                  isCurrentScenario && "ring-2 ring-blue-500 ring-offset-1"
                                )}
                              >
                                {probability}%
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}