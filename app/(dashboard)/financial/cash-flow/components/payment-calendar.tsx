import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaymentCalendarDay } from '@/types/cash-flow'
import { formatCurrency } from '@/utils/debt-calculations'
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PaymentCalendarProps {
  calendar: PaymentCalendarDay[]
}

export function PaymentCalendar({ calendar }: PaymentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<PaymentCalendarDay | null>(null)

  // Filter calendar for current month
  const monthlyCalendar = calendar.filter(day => {
    const date = new Date(day.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  // Get month name
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  })

  // Navigate months
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Get color intensity based on cash flow
  const getCellColor = (day: PaymentCalendarDay) => {
    const absAmount = Math.abs(day.netFlow)
    
    if (absAmount === 0) return 'bg-gray-50'
    
    if (day.netFlow > 0) {
      // Positive flow - green
      if (absAmount > 10000000) return 'bg-green-200'
      if (absAmount > 5000000) return 'bg-green-100'
      return 'bg-green-50'
    } else {
      // Negative flow - red
      if (absAmount > 10000000) return 'bg-red-200'
      if (absAmount > 5000000) return 'bg-red-100'
      return 'bg-red-50'
    }
  }

  // Create calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarGrid = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarGrid.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dateStr = date.toISOString().split('T')[0]
    const dayData = monthlyCalendar.find(d => d.date === dateStr)
    calendarGrid.push(dayData || {
      date: dateStr,
      netFlow: 0,
      inflows: 0,
      outflows: 0,
      transactions: [],
      hasDebtPayments: false,
      debtPaymentAmount: 0
    })
  }

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Calculate monthly totals
  const monthlyTotals = {
    inflows: monthlyCalendar.reduce((sum, day) => sum + day.inflows, 0),
    outflows: monthlyCalendar.reduce((sum, day) => sum + day.outflows, 0),
    debtPayments: monthlyCalendar.reduce((sum, day) => sum + day.debtPaymentAmount, 0),
    netFlow: monthlyCalendar.reduce((sum, day) => sum + day.netFlow, 0)
  }

  const debtPaymentDays = monthlyCalendar.filter(day => day.hasDebtPayments).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Pagamentos
            <Badge variant="outline" className="text-green-600 border-green-600">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
              Dívidas Reais
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium capitalize min-w-[140px] text-center">
              {monthName}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Monthly Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Dias c/ Dívidas</div>
            <div className="font-semibold text-blue-600">{debtPaymentDays}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Pagto Dívidas</div>
            <div className="font-semibold text-red-600">
              {formatCurrency(monthlyTotals.debtPayments)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Saídas Totais</div>
            <div className="font-semibold text-red-600">
              {formatCurrency(monthlyTotals.outflows)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Fluxo Líquido</div>
            <div className={`font-semibold ${monthlyTotals.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlyTotals.netFlow)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className={`w-full h-full rounded-md border text-xs p-1 hover:ring-2 hover:ring-blue-200 transition-all ${getCellColor(day)}`}
                        onClick={() => setSelectedDay(day)}
                      >
                        <div className="font-medium">
                          {new Date(day.date).getDate()}
                        </div>
                        {day.hasDebtPayments && (
                          <div className="h-1 w-1 bg-blue-600 rounded-full mx-auto mt-1" />
                        )}
                        {Math.abs(day.netFlow) > 0 && (
                          <div className="text-[10px] truncate">
                            {day.netFlow > 0 ? '+' : ''}
                            {(day.netFlow / 1000000).toFixed(1)}M
                          </div>
                        )}
                      </button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {new Date(day.date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Financial Summary */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Entradas</div>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(day.inflows)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Saídas</div>
                            <div className="font-semibold text-red-600">
                              {formatCurrency(day.outflows)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Pagto Dívidas</div>
                            <div className="font-semibold text-blue-600">
                              {formatCurrency(day.debtPaymentAmount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Líquido</div>
                            <div className={`font-semibold ${day.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(day.netFlow)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Transactions */}
                        {day.transactions.length > 0 && (
                          <div>
                            <div className="font-medium text-sm mb-2">Transações</div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {day.transactions.map(transaction => (
                                <div key={transaction.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                  <div>
                                    <div className="font-medium">{transaction.description}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {transaction.category} • {transaction.source}
                                    </div>
                                  </div>
                                  <div className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(Math.abs(transaction.amount))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {day.transactions.length === 0 && (
                          <div className="text-center text-muted-foreground text-sm py-4">
                            Nenhuma transação programada
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded" />
            <span>Entrada líquida</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded" />
            <span>Saída líquida</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <span>Pagamento dívida</span>
          </div>
        </div>

        {/* Data Source Alert */}
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Fonte dos dados:</strong> Pagamentos de dívidas baseados em cronograma real do sistema. 
            Outras entradas e saídas são estimativas baseadas em padrões históricos.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}