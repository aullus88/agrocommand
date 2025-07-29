import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data: payments, error, count } = await supabase
      .from('debt_payments')
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    // Test the views
    const { data: cashFlowData, error: cashFlowError } = await supabase
      .from('vw_cash_flow_analysis')
      .select('*')
      .limit(3)

    const { data: positionData, error: positionError } = await supabase
      .from('vw_debt_position_analysis')
      .select('*')
      .limit(3)

    return NextResponse.json({
      success: true,
      data: {
        debtPayments: {
          count,
          records: payments,
          hasData: payments && payments.length > 0
        },
        views: {
          cashFlow: {
            hasData: cashFlowData && cashFlowData.length > 0,
            count: cashFlowData?.length || 0,
            error: cashFlowError?.message || null
          },
          position: {
            hasData: positionData && positionData.length > 0,
            count: positionData?.length || 0,
            error: positionError?.message || null
          }
        }
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}