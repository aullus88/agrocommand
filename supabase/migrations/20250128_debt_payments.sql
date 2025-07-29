-- Create debt_payments table to store real debt data from CSV
CREATE TABLE IF NOT EXISTS debt_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Institution and contract info
  agente TEXT NOT NULL, -- Financial institution
  modalidade TEXT NOT NULL, -- Loan type (ABC, CPR-F, CDC, etc.)
  nr_contrato TEXT NOT NULL, -- Contract number
  tx_jur DECIMAL(5,2), -- Interest rate
  objeto_financiado TEXT, -- Financed object/purpose
  data_contrato DATE, -- Contract date
  moeda TEXT DEFAULT 'R$', -- Currency
  documento TEXT, -- Document reference
  
  -- Payment schedule info
  parc_current INTEGER NOT NULL, -- Current installment number
  parc_total INTEGER NOT NULL, -- Total number of installments
  vencim_parcela DATE NOT NULL, -- Due date
  ano INTEGER NOT NULL, -- Year
  mes INTEGER NOT NULL, -- Month
  dia INTEGER NOT NULL, -- Day
  
  -- Payment amounts
  vlr_capital_parcela DECIMAL(15,2) NOT NULL, -- Principal amount
  juros_parcela DECIMAL(15,2) NOT NULL, -- Interest amount
  tot_capital_juros DECIMAL(15,2) NOT NULL, -- Total payment
  
  -- Outstanding balances
  saldo_capital_parc DECIMAL(15,2) NOT NULL, -- Remaining principal balance
  saldo_juros_parc DECIMAL(15,2) NOT NULL, -- Remaining interest balance
  saldo_a_pagar DECIMAL(15,2) NOT NULL, -- Total remaining balance
  
  -- Additional fields
  rolagem BOOLEAN DEFAULT FALSE, -- Rollover flag
  cambio DECIMAL(10,4), -- Exchange rate if applicable
  valor_pagar_reais DECIMAL(15,2), -- Amount to pay in BRL
  
  -- Status and metadata
  status TEXT DEFAULT 'pending', -- pending, paid, overdue
  payment_date DATE, -- Actual payment date if paid
  
  -- Indexes
  CONSTRAINT debt_payments_unique_key UNIQUE (nr_contrato, parc_current, vencim_parcela)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_debt_payments_agente ON debt_payments(agente);
CREATE INDEX IF NOT EXISTS idx_debt_payments_modalidade ON debt_payments(modalidade);
CREATE INDEX IF NOT EXISTS idx_debt_payments_contract ON debt_payments(nr_contrato);
CREATE INDEX IF NOT EXISTS idx_debt_payments_due_date ON debt_payments(vencim_parcela);
CREATE INDEX IF NOT EXISTS idx_debt_payments_status ON debt_payments(status);
CREATE INDEX IF NOT EXISTS idx_debt_payments_year_month ON debt_payments(ano, mes);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_debt_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_debt_payments_updated_at
  BEFORE UPDATE ON debt_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_payments_updated_at();

-- Create view for debt summary by institution
CREATE OR REPLACE VIEW debt_summary_by_institution AS
SELECT 
  agente,
  COUNT(*) as total_payments,
  COUNT(CASE WHEN vencim_parcela > CURRENT_DATE THEN 1 END) as future_payments,
  COUNT(CASE WHEN vencim_parcela <= CURRENT_DATE AND status = 'pending' THEN 1 END) as overdue_payments,
  SUM(tot_capital_juros) as total_amount,
  SUM(CASE WHEN vencim_parcela > CURRENT_DATE THEN tot_capital_juros ELSE 0 END) as future_amount,
  SUM(CASE WHEN vencim_parcela <= CURRENT_DATE AND status = 'pending' THEN tot_capital_juros ELSE 0 END) as overdue_amount,
  MIN(vencim_parcela) as first_payment_date,
  MAX(vencim_parcela) as last_payment_date
FROM debt_payments
GROUP BY agente;

-- Create view for debt summary by loan type
CREATE OR REPLACE VIEW debt_summary_by_type AS
SELECT 
  modalidade,
  COUNT(DISTINCT nr_contrato) as total_contracts,
  COUNT(*) as total_payments,
  SUM(tot_capital_juros) as total_amount,
  AVG(tx_jur) as avg_interest_rate,
  MIN(vencim_parcela) as first_payment_date,
  MAX(vencim_parcela) as last_payment_date
FROM debt_payments
GROUP BY modalidade;

-- Create view for monthly payment schedule
CREATE OR REPLACE VIEW monthly_payment_schedule AS
SELECT 
  ano,
  mes,
  COUNT(*) as payment_count,
  SUM(vlr_capital_parcela) as total_principal,
  SUM(juros_parcela) as total_interest,
  SUM(tot_capital_juros) as total_payment,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
FROM debt_payments
GROUP BY ano, mes
ORDER BY ano, mes;