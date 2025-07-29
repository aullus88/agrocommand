import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { DebtPortfolio, DebtFilters } from '@/types/debt-management';
import { formatCurrency } from '@/utils/debt-calculations';
import { convertToBRL, getCurrentRates } from '@/utils/currency-service';

// Supabase client
const supabase = createClient();

// Interface for debt payment from database
export interface DBDebtPayment {
  id: string;
  created_at: string;
  updated_at: string;
  agente: string;
  modalidade: string;
  nr_contrato: string;
  tx_jur: number | null;
  objeto_financiado: string | null;
  data_contrato: string | null;
  moeda: string;
  documento: string | null;
  parc_current: number;
  parc_total: number;
  vencim_parcela: string;
  ano: number;
  mes: number;
  dia: number;
  vlr_capital_parcela: number;
  juros_parcela: number;
  tot_capital_juros: number;
  saldo_capital_parc: number;
  saldo_juros_parc: number;
  saldo_a_pagar: number;
  rolagem: boolean | null;
  cambio: number | null;
  valor_pagar_reais: number | null;
  status: string;
  payment_date: string | null;
}

// Fetch real debt data from Supabase
const fetchRealDebtData = async (
  filters?: DebtFilters
): Promise<DebtPortfolio> => {
  try {
    // Fetch all debt payments
    let query = supabase
      .from('debt_payments')
      .select('*')
      .order('vencim_parcela', { ascending: true });

    // Apply filters if provided
    if (filters?.startDate) {
      let startDate: string;
      if (filters.startDate instanceof Date) {
        startDate = filters.startDate.toISOString().split('T')[0];
      } else if (typeof filters.startDate === 'string') {
        startDate = filters.startDate;
      } else {
        console.warn('Invalid startDate format:', filters.startDate);
        return createEmptyPortfolio();
      }
      query = query.gte('vencim_parcela', startDate);
    }
    if (filters?.endDate) {
      let endDate: string;
      if (filters.endDate instanceof Date) {
        endDate = filters.endDate.toISOString().split('T')[0];
      } else if (typeof filters.endDate === 'string') {
        endDate = filters.endDate;
      } else {
        console.warn('Invalid endDate format:', filters.endDate);
        return createEmptyPortfolio();
      }
      query = query.lte('vencim_parcela', endDate);
    }
    if (filters?.institutions?.length) {
      query = query.in('agente', filters.institutions);
    }
    if (filters?.loanTypes?.length) {
      query = query.in('modalidade', filters.loanTypes);
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Fetched payments:', payments?.length || 0, 'records');

    if (!payments || payments.length === 0) {
      console.warn('No debt payments found, returning empty portfolio');
      // Return empty portfolio structure
      return createEmptyPortfolio();
    }

    // Process the data into portfolio structure
    return await processPaymentsIntoPortfolio(payments as DBDebtPayment[]);
  } catch (error) {
    console.error('Error fetching real debt data:', error);
    throw error;
  }
};

// Create empty portfolio structure
const createEmptyPortfolio = (): DebtPortfolio => ({
  overview: {
    totalDebt: 0,
    totalDebtUSD: 0,
    usdExposure: 0,
    avgWeightedRate: 0,
    avgMaturity: 18,
    dscr: 0,
    debtToEbitda: 0,
    usdExposurePercent: 0,
    nextPayment: {
      amount: 0,
      dueDate: new Date(),
      daysUntil: 0,
      type: 'both',
      currency: 'BRL',
    },
    lastUpdated: new Date(),
  },
  composition: {
    byInstitution: [],
    byRateType: [],
    byCurrency: [],
    byPurpose: [],
    byCollateral: [],
  },
  maturityProfile: [],
  contracts: [],
  covenants: {
    dscr: {
      current: 0,
      required: 1.25,
      minimum: 1.25,
      status: 'good',
      trend: 'stable',
    },
    debtToEbitda: {
      current: 0,
      required: 3.5,
      maximum: 3.5,
      status: 'good',
      trend: 'stable',
    },
    currentRatio: {
      current: 0,
      required: 1.2,
      minimum: 1.2,
      status: 'good',
      trend: 'stable',
    },
    lastUpdated: new Date().toISOString(),
    hasData: true,
  },
  currencyRisk: {
    usdExposure: 0,
    hedgedAmount: 0,
    hedgeRatio: 0,
    openExposure: 0,
    var95: 0,
    var99: 0,
    var30Days: 0,
    totalExposure: 0,
    hasRealRates: true,
    sensitivityAnalysis: [],
    hedgeOperations: [],
  },
  scenarios: {
    baseCase: {
      name: 'Base Case',
      assumptions: {
        selicRate: 0,
        exchangeRate: 0,
        commodityPrice: 0,
        production: 0,
        costs: 0,
      },
      totalDebt: 0,
      totalCost: 0,
      avgRate: 0,
      dscr: 0,
      survivalMonths: 0,
      refinancingNeed: 0,
      probability: 0,
    },
    optimistic: {
      name: 'Optimistic',
      assumptions: {
        selicRate: 0,
        exchangeRate: 0,
        commodityPrice: 0,
        production: 0,
        costs: 0,
      },
      totalDebt: 0,
      totalCost: 0,
      avgRate: 0,
      dscr: 0,
      survivalMonths: 0,
      refinancingNeed: 0,
      probability: 0,
    },
    pessimistic: {
      name: 'Pessimistic',
      assumptions: {
        selicRate: 0,
        exchangeRate: 0,
        commodityPrice: 0,
        production: 0,
        costs: 0,
      },
      totalDebt: 0,
      totalCost: 0,
      avgRate: 0,
      dscr: 0,
      survivalMonths: 0,
      refinancingNeed: 0,
      probability: 0,
    },
    stress: [],
    custom: [],
  },
});

// Process payments into portfolio structure
const processPaymentsIntoPortfolio = async (
  payments: DBDebtPayment[]
): Promise<DebtPortfolio> => {
  // Get current exchange rates
  const currentRates = await getCurrentRates();

  // Convert all debt amounts to BRL using real-time rates
  let totalDebtBRL = 0;
  const debtByOriginalCurrency: Record<string, number> = {};

  for (const payment of payments) {
    const currency = payment.moeda || 'R$';
    const amount = payment.saldo_a_pagar;

    // Track debt by original currency
    debtByOriginalCurrency[currency] =
      (debtByOriginalCurrency[currency] || 0) + amount;

    // Convert to BRL
    const conversion = await convertToBRL(amount, currency);
    totalDebtBRL += conversion.result;
  }

  // Calculate weighted average rate (using BRL-converted amounts)
  let totalWeightedRate = 0;
  for (const payment of payments) {
    const rate = payment.tx_jur || 0;
    const conversion = await convertToBRL(
      payment.saldo_a_pagar,
      payment.moeda || 'R$'
    );
    totalWeightedRate += rate * conversion.result;
  }
  const avgWeightedRate = totalWeightedRate / totalDebtBRL;

  // Find next payment
  const futurePayments = payments.filter(
    (p) => new Date(p.vencim_parcela) > new Date()
  );
  const nextPayment = futurePayments[0];
  const nextPaymentDate = nextPayment
    ? new Date(nextPayment.vencim_parcela)
    : new Date();
  const daysUntil = nextPayment
    ? Math.ceil(
        (nextPaymentDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Group by institution with BRL conversion
  const institutionGroups: Record<string, DBDebtPayment[]> = payments.reduce(
    (acc, payment) => {
      if (!acc[payment.agente]) {
        acc[payment.agente] = [];
      }
      acc[payment.agente].push(payment);
      return acc;
    },
    {} as Record<string, DBDebtPayment[]>
  );

  const byInstitution = await Promise.all(
    Object.entries(institutionGroups).map(
      async ([institution, institutionPayments]) => {
        let institutionTotalBRL = 0;
        for (const payment of institutionPayments) {
          const conversion = await convertToBRL(
            payment.saldo_a_pagar,
            payment.moeda || 'R$'
          );
          institutionTotalBRL += conversion.result;
        }
        return {
          institution: institution,
          amount: institutionTotalBRL,
          percentage: (institutionTotalBRL / totalDebtBRL) * 100,
          avgRate: 0,
          contracts: institutionPayments.length,
          riskRating: 'B' as const,
        };
      }
    )
  );

  // Group by type
  const byType = payments.reduce((acc, payment) => {
    const existing = acc.find((item) => item.name === payment.modalidade);
    if (existing) {
      existing.amount += payment.saldo_a_pagar;
      existing.percentage = 0;
    } else {
      acc.push({
        name: payment.modalidade,
        amount: payment.saldo_a_pagar,
        percentage: 0,
      });
    }
    return acc;
  }, [] as Array<{ name: string; amount: number; percentage: number }>);

  // Convert byType amounts to BRL for proper percentage calculation
  for (let i = 0; i < byType.length; i++) {
    const item = byType[i];
    // Get payments for this type and convert to BRL
    const typePayments = payments.filter((p) => p.modalidade === item.name);
    let typeTotalBRL = 0;
    for (const payment of typePayments) {
      const conversion = await convertToBRL(
        payment.saldo_a_pagar,
        payment.moeda || 'R$'
      );
      typeTotalBRL += conversion.result;
    }
    item.amount = typeTotalBRL;
    item.percentage = (typeTotalBRL / totalDebtBRL) * 100;
  }

  // Group by currency with BRL conversion for percentages
  const byCurrency = await Promise.all(
    Object.entries(debtByOriginalCurrency).map(async ([currency, amount]) => {
      const conversion = await convertToBRL(amount, currency);

      // Calculate average rate for this currency
      const currencyPayments = payments.filter(
        (p) => (p.moeda || 'R$') === currency
      );
      const totalWeightedRate = currencyPayments.reduce((sum, payment) => {
        const rate = payment.tx_jur || 0;
        const weight = payment.saldo_a_pagar;
        return sum + rate * weight;
      }, 0);
      const avgRate =
        currencyPayments.length > 0 ? totalWeightedRate / amount : 0;

      return {
        currency:
          currency === 'R$'
            ? ('BRL' as const)
            : currency === 'US$'
            ? ('USD' as const)
            : ('EUR' as const),
        amount: conversion.result,
        percentage: (conversion.result / totalDebtBRL) * 100,
        avgRate: avgRate,
        avgMaturity: 24, // Default maturity
        exchangeRate: conversion.rate,
      };
    })
  );

  // Calculate currency exposure
  const usdData = byCurrency.find((c) => c.currency === 'USD');
  const eurData = byCurrency.find((c) => c.currency === 'EUR');
  const usdExposure = usdData ? usdData.percentage : 0;
  const eurExposure = eurData ? eurData.percentage : 0;
  const totalForeignExposure = usdExposure + eurExposure;

  // Create maturity profile with proper structure
  const maturityProfileMap = new Map<
    string,
    {
      year: number;
      quarter: number;
      principalBRL: number;
      principalUSD: number;
      interest: number;
      payments: number;
    }
  >();

  for (const payment of payments) {
    const paymentDate = new Date(payment.vencim_parcela);
    const year = paymentDate.getFullYear();
    const quarter = Math.ceil((paymentDate.getMonth() + 1) / 3);
    const periodKey = `${year}-Q${quarter}`;

    const currency = payment.moeda || 'R$';
    const conversion = await convertToBRL(
      payment.vlr_capital_parcela,
      currency
    );

    if (!maturityProfileMap.has(periodKey)) {
      maturityProfileMap.set(periodKey, {
        year,
        quarter,
        principalBRL: 0,
        principalUSD: 0,
        interest: 0,
        payments: 0,
      });
    }

    const profile = maturityProfileMap.get(periodKey)!;

    // Separate BRL and foreign currency principal
    if (currency === 'R$' || currency === 'BRL') {
      profile.principalBRL += payment.vlr_capital_parcela;
    } else if (currency === 'US$' || currency === 'USD') {
      profile.principalUSD += conversion.result; // USD converted to BRL for display
    } else if (currency === '€UR' || currency === 'EUR') {
      profile.principalBRL += conversion.result; // EUR converted to BRL (group with BRL)
    }

    // Interest is always converted to BRL
    const interestConversion = await convertToBRL(
      payment.juros_parcela,
      currency
    );
    profile.interest += interestConversion.result;
    profile.payments++;
  }

  // Convert to array and calculate additional fields
  const maturityProfile = Array.from(maturityProfileMap.entries())
    .map(([periodKey, data]) => {
      const total = data.principalBRL + data.principalUSD + data.interest;
      const estimatedPaymentCapacity = totalDebtBRL * 0.02; // Rough estimate - 2% of total debt monthly
      const dscr = estimatedPaymentCapacity / (total || 1);

      return {
        period: periodKey,
        year: data.year,
        quarter: data.quarter,
        principalBRL: data.principalBRL,
        principalUSD: data.principalUSD,
        interest: data.interest,
        total,
        accumulated: 0, // Will be calculated after sorting
        paymentCapacity: estimatedPaymentCapacity,
        dscr,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.quarter - b.quarter;
    });

  // Calculate accumulated amounts
  let accumulatedTotal = 0;
  maturityProfile.forEach((item) => {
    accumulatedTotal += item.total;
    item.accumulated = accumulatedTotal;
  });

  // Create purpose composition (using objeto_financiado field or fallback)
  const purposeMap = new Map<string, number>();
  for (const payment of payments) {
    const purpose = payment.objeto_financiado || 'Não especificado';
    const conversion = await convertToBRL(
      payment.saldo_a_pagar,
      payment.moeda || 'R$'
    );
    purposeMap.set(purpose, (purposeMap.get(purpose) || 0) + conversion.result);
  }

  const byPurpose = Array.from(purposeMap.entries()).map(
    ([purposeName, amount]) => ({
      purpose: 'Working Capital' as const, // Default to working capital
      amount,
      percentage: (amount / totalDebtBRL) * 100,
      avgRate: 0,
    })
  );

  // Create collateral composition (placeholder since not in data)
  const byCollateral = [
    {
      type: 'Unsecured' as const,
      amount: totalDebtBRL,
      percentage: 100,
      utilization: 0,
    },
  ];

  // Create contracts summary with proper currency handling
  const contractsMap = new Map<string, any>();

  // Group payments by contract first
  const contractGroups = payments.reduce((acc, payment) => {
    if (!acc[payment.nr_contrato]) {
      acc[payment.nr_contrato] = [];
    }
    acc[payment.nr_contrato].push(payment);
    return acc;
  }, {} as Record<string, DBDebtPayment[]>);

  // Process each contract
  for (const [contractNumber, contractPayments] of Object.entries(
    contractGroups
  )) {
    const firstPayment = contractPayments[0]; // Use first payment for contract details

    // Calculate total balance for this contract (sum all remaining payments)
    let totalBalanceInBRL = 0;
    for (const payment of contractPayments) {
      const conversion = await convertToBRL(
        payment.saldo_a_pagar,
        payment.moeda || 'R$'
      );
      totalBalanceInBRL += conversion.result;
    }

    // Fix timezone issues by using date strings directly for comparison
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Find next payment (avoid timezone issues)
    const futurePayments = contractPayments.filter(
      (p) => p.vencim_parcela > today
    );
    const nextPayment = futurePayments.sort((a, b) =>
      a.vencim_parcela.localeCompare(b.vencim_parcela)
    )[0];

    // Find maturity date (last payment)
    const lastPayment = contractPayments.sort((a, b) =>
      b.vencim_parcela.localeCompare(a.vencim_parcela)
    )[0];

    // Calculate payment progress using parc_current and parc_total from next payment
    const totalPayments = nextPayment
      ? nextPayment.parc_total
      : lastPayment?.parc_total || contractPayments.length;
    const currentPaymentNumber = nextPayment
      ? nextPayment.parc_current
      : lastPayment?.parc_total || contractPayments.length;
    const paidPayments = currentPaymentNumber - 1; // Payments already made

    // Calculate next payment amount in BRL
    let nextPaymentAmountBRL = 0;
    if (nextPayment) {
      const nextPaymentConversion = await convertToBRL(
        nextPayment.tot_capital_juros,
        nextPayment.moeda || 'R$'
      );
      nextPaymentAmountBRL = nextPaymentConversion.result;
    }

    // Determine contract status based on payment statuses
    const hasOverdue = contractPayments.some((p) => p.status === 'overdue');
    const hasPaid = contractPayments.some((p) => p.status === 'paid');
    const contractStatus = hasOverdue
      ? ('default' as const)
      : hasPaid && futurePayments.length === 0
      ? ('completed' as const)
      : ('active' as const);

    contractsMap.set(contractNumber, {
      id: contractNumber,
      contractNumber,
      institution: firstPayment.agente,
      type: firstPayment.modalidade,
      purpose: firstPayment.objeto_financiado || 'Não especificado',
      currency: firstPayment.moeda || 'R$',
      originalCurrency: firstPayment.moeda || 'R$', // Keep original currency info
      currentBalance: totalBalanceInBRL, // Total balance converted to BRL
      originalAmount: totalBalanceInBRL, // We don't have original amount, use current
      currentRate: firstPayment.tx_jur || 0,
      rateType: firstPayment.modalidade?.includes('CDI') ? 'CDI' : 'PreFixed',
      spread: 0, // Not available in source data
      disbursementDate: firstPayment.data_contrato
        ? new Date(firstPayment.data_contrato)
        : null,
      maturityDate: new Date(lastPayment.vencim_parcela),
      nextPaymentDate: nextPayment
        ? new Date(nextPayment.vencim_parcela)
        : null,
      nextPaymentAmount: nextPaymentAmountBRL,
      collateral: 'Não especificado', // Not available in source data
      dscr: null, // Cannot calculate without EBITDA data
      covenants: [], // No covenant data available in source
      status: contractStatus,
      // Additional real data fields
      document: firstPayment.documento,
      contractDate: firstPayment.data_contrato
        ? new Date(firstPayment.data_contrato)
        : null,
      hasRollover: firstPayment.rolagem || false,
      exchangeRate: firstPayment.cambio,
      amountInReais: firstPayment.valor_pagar_reais,
      paymentDate: firstPayment.payment_date
        ? new Date(firstPayment.payment_date)
        : null,
      totalPayments,
      paidPayments,
      overduePayments: contractPayments.filter((p) => p.status === 'overdue')
        .length,
      currentPaymentNumber,
      paymentProgress: `${currentPaymentNumber}/${totalPayments}`,
      // All payments for expanded view
      allPayments: contractPayments.sort((a, b) =>
        a.vencim_parcela.localeCompare(b.vencim_parcela)
      ),
    });
  }

  const contracts = Array.from(contractsMap.values());

  // Estimate DSCR (this would need actual EBITDA data in real implementation)
  const monthlyDebtService = payments
    .filter((p) => {
      const paymentDate = new Date(p.vencim_parcela);
      const currentMonth = new Date();
      return (
        paymentDate.getMonth() === currentMonth.getMonth() &&
        paymentDate.getFullYear() === currentMonth.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.tot_capital_juros, 0);

  // Estimate monthly EBITDA (this should come from actual financial data)
  const estimatedMonthlyEbitda = totalDebtBRL * 0.015; // Rough estimate - 1.5% of total debt
  const dscr = estimatedMonthlyEbitda / (monthlyDebtService || 1);

  return {
    overview: {
      totalDebt: totalDebtBRL, // Now properly converted to BRL
      totalDebtUSD: (usdData?.amount || 0) / currentRates.usdToBrl,
      usdExposure: usdData?.amount || 0,
      avgWeightedRate,
      avgMaturity: 18,
      dscr,
      debtToEbitda: totalDebtBRL / (estimatedMonthlyEbitda * 12),
      usdExposurePercent: usdExposure,
      nextPayment: {
        amount: nextPayment?.tot_capital_juros || 0,
        dueDate: nextPayment?.vencim_parcela
          ? new Date(nextPayment.vencim_parcela)
          : new Date(),
        type: 'both',
        currency: 'BRL',
        daysUntil,
      },
      lastUpdated: new Date(),
    },
    composition: {
      byInstitution,
      byRateType: [], // No rate type data available
      byCurrency,
      byPurpose,
      byCollateral,
    },
    maturityProfile: maturityProfile.sort((a, b) => a.year - b.year),
    contracts,
    covenants: {
      dscr: {
        current: null,
        required: 1.25,
        minimum: 1.25,
        status: 'unknown' as const,
        trend: 'unknown' as const,
        warning: 'DSCR não pode ser calculado - dados de EBITDA necessários',
      },
      debtToEbitda: {
        current: null,
        required: 3.5,
        maximum: 3.5,
        status: 'unknown' as const,
        trend: 'unknown' as const,
        warning:
          'Índice Dívida/EBITDA não pode ser calculado - dados de EBITDA necessários',
      },
      currentRatio: {
        current: null,
        required: 1.2,
        minimum: 1.2,
        status: 'unknown' as const,
        trend: 'unknown' as const,
        warning:
          'Índice de liquidez corrente não pode ser calculado - dados de balanço necessários',
      },
      lastUpdated: new Date().toISOString(),
      hasData: false,
      dataWarning:
        'Dados de covenants não disponíveis nos dados importados. Para monitoramento completo, é necessário importar dados financeiros adicionais.',
    },
    currencyRisk: {
      usdExposure: usdData?.amount || 0,
      hedgedAmount: 0,
      hedgeRatio: 0,
      openExposure: (usdData?.amount || 0) + (eurData?.amount || 0),
      var95: totalForeignExposure * 0.08,
      var99: totalForeignExposure * 0.12,
      var30Days: totalForeignExposure * 0.05,
      totalExposure: totalForeignExposure,
      hasRealRates: true,
      rateDataWarning: `Taxas atualizadas via ${currentRates.source} em ${
        currentRates.lastUpdated
      }. USD: ${currentRates.usdToBrl.toFixed(
        4
      )}, EUR: ${currentRates.eurToBrl.toFixed(4)}`,
      sensitivityAnalysis: [
        {
          exchangeRate: currentRates.usdToBrl * 1.1,
          impact: (usdData?.amount || 0) * 0.1,
          probability: 0.3,
        },
        {
          exchangeRate: currentRates.eurToBrl * 1.1,
          impact: (eurData?.amount || 0) * 0.1,
          probability: 0.25,
        },
      ],
      hedgeOperations: [],
    },
    scenarios: {
      baseCase: {
        name: 'Cenário Base',
        assumptions: {
          selicRate: 13.25,
          exchangeRate: currentRates.usdToBrl,
          commodityPrice: 140,
          production: 3600,
          costs: 110,
        },
        totalDebt: totalDebtBRL,
        totalCost: totalDebtBRL * 0.1,
        avgRate: avgWeightedRate,
        dscr,
        survivalMonths: 18,
        refinancingNeed: 0,
        probability: 0.6,
      },
      optimistic: {
        name: 'Cenário Otimista',
        assumptions: {
          selicRate: 11.5,
          exchangeRate: currentRates.usdToBrl * 0.9,
          commodityPrice: 160,
          production: 3800,
          costs: 105,
        },
        totalDebt: totalDebtBRL * 0.85,
        totalCost: totalDebtBRL * 0.08,
        avgRate: avgWeightedRate * 0.9,
        dscr: dscr * 1.2,
        survivalMonths: 24,
        refinancingNeed: 0,
        probability: 0.25,
      },
      pessimistic: {
        name: 'Cenário Pessimista',
        assumptions: {
          selicRate: 15.5,
          exchangeRate: currentRates.usdToBrl * 1.15,
          commodityPrice: 120,
          production: 3200,
          costs: 125,
        },
        totalDebt: totalDebtBRL * 1.15,
        totalCost: totalDebtBRL * 0.13,
        avgRate: avgWeightedRate * 1.1,
        dscr: dscr * 0.7,
        survivalMonths: 12,
        refinancingNeed: totalDebtBRL * 0.15,
        probability: 0.15,
      },
      stress: [],
      custom: [],
    },
  };
};

// Hook to use real debt data
export const useRealDebtPortfolio = (filters?: DebtFilters) => {
  return useQuery({
    queryKey: ['real-debt-portfolio', filters],
    queryFn: () => fetchRealDebtData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 1, // Reduce retries to fail faster
  });
};

// Hook to fetch debt summary by institution
export const useDebtSummaryByInstitution = () => {
  return useQuery({
    queryKey: ['debt-summary-institution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debt_summary_by_institution')
        .select('*')
        .order('total_amount', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook to fetch monthly payment schedule
export const useMonthlyPaymentSchedule = () => {
  return useQuery({
    queryKey: ['monthly-payment-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_payment_schedule')
        .select('*')
        .order('ano', { ascending: true })
        .order('mes', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook to update payment status
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      paymentDate,
    }: {
      id: string;
      status: 'pending' | 'paid' | 'overdue';
      paymentDate?: string;
    }) => {
      const { data, error } = await supabase
        .from('debt_payments')
        .update({
          status,
          payment_date: paymentDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['real-debt-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-payment-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['debt-summary-institution'] });
    },
  });
};
