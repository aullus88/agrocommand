-- Create currency_rates table for historical exchange rates
CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Currency pair and rate
  from_currency TEXT NOT NULL, -- USD, EUR, etc.
  to_currency TEXT NOT NULL DEFAULT 'BRL',
  rate DECIMAL(10,6) NOT NULL,
  
  -- Date and source
  rate_date DATE NOT NULL,
  source TEXT NOT NULL, -- BCB, API, Manual
  
  -- Metadata
  bid_rate DECIMAL(10,6),
  ask_rate DECIMAL(10,6),
  
  -- Unique constraint to prevent duplicate rates for same date
  CONSTRAINT currency_rates_unique_key UNIQUE (from_currency, to_currency, rate_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_currency_rates_date ON currency_rates(rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_currency_rates_currency ON currency_rates(from_currency, to_currency);

-- Create report_cache table for storing generated reports
CREATE TABLE IF NOT EXISTS report_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Report identification
  report_type TEXT NOT NULL, -- cash_flow, debt_position, etc.
  report_params JSONB NOT NULL, -- Filters and parameters used
  
  -- Cached data
  report_data JSONB NOT NULL,
  
  -- Cache metadata
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  
  -- Index for cache lookup
  cache_key TEXT GENERATED ALWAYS AS (
    md5(report_type || '::' || report_params::text)
  ) STORED
);

CREATE INDEX IF NOT EXISTS idx_report_cache_lookup ON report_cache(cache_key, expires_at);
CREATE INDEX IF NOT EXISTS idx_report_cache_type ON report_cache(report_type);

-- Create scheduled_reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Report configuration
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_params JSONB NOT NULL,
  
  -- Schedule configuration
  frequency TEXT NOT NULL, -- daily, weekly, monthly, quarterly
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME NOT NULL DEFAULT '09:00:00',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  
  -- Recipients
  recipients TEXT[] NOT NULL,
  cc_recipients TEXT[],
  
  -- Export configuration
  export_formats TEXT[] NOT NULL DEFAULT ARRAY['PDF'],
  include_raw_data BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_status TEXT,
  last_run_error TEXT,
  
  -- User who created the schedule
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(is_active, next_run_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_type ON scheduled_reports(report_type);

-- Create report_generation_log table
CREATE TABLE IF NOT EXISTS report_generation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Report details
  report_type TEXT NOT NULL,
  report_params JSONB NOT NULL,
  scheduled_report_id UUID REFERENCES scheduled_reports(id),
  
  -- Generation details
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  
  -- Status
  status TEXT NOT NULL, -- pending, processing, completed, failed
  error_message TEXT,
  
  -- Output
  file_urls JSONB, -- URLs to generated files
  recipients_notified TEXT[],
  
  -- User who triggered (if manual)
  generated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_report_log_status ON report_generation_log(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_log_scheduled ON report_generation_log(scheduled_report_id);

-- Function to get exchange rate for a specific date
CREATE OR REPLACE FUNCTION get_exchange_rate(
  p_from_currency TEXT,
  p_to_currency TEXT DEFAULT 'BRL',
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(10,6) AS $$
DECLARE
  v_rate DECIMAL(10,6);
BEGIN
  -- Try to get rate for specific date
  SELECT rate INTO v_rate
  FROM currency_rates
  WHERE from_currency = p_from_currency
    AND to_currency = p_to_currency
    AND rate_date = p_date
  LIMIT 1;
  
  -- If not found, get most recent rate before the date
  IF v_rate IS NULL THEN
    SELECT rate INTO v_rate
    FROM currency_rates
    WHERE from_currency = p_from_currency
      AND to_currency = p_to_currency
      AND rate_date <= p_date
    ORDER BY rate_date DESC
    LIMIT 1;
  END IF;
  
  -- Return rate or 1 if same currency
  IF p_from_currency = p_to_currency THEN
    RETURN 1;
  END IF;
  
  RETURN COALESCE(v_rate, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to convert currency amount
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount DECIMAL(15,2),
  p_from_currency TEXT,
  p_to_currency TEXT DEFAULT 'BRL',
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(15,2) AS $$
BEGIN
  RETURN p_amount * get_exchange_rate(p_from_currency, p_to_currency, p_date);
END;
$$ LANGUAGE plpgsql;

-- Insert some default exchange rates (can be updated via API later)
INSERT INTO currency_rates (from_currency, to_currency, rate, rate_date, source)
VALUES 
  ('USD', 'BRL', 5.42, CURRENT_DATE, 'BCB'),
  ('EUR', 'BRL', 5.85, CURRENT_DATE, 'BCB'),
  ('USD', 'BRL', 5.40, CURRENT_DATE - INTERVAL '1 day', 'BCB'),
  ('EUR', 'BRL', 5.83, CURRENT_DATE - INTERVAL '1 day', 'BCB')
ON CONFLICT (from_currency, to_currency, rate_date) DO NOTHING;

-- Create view for cash flow analysis
CREATE OR REPLACE VIEW vw_cash_flow_analysis AS
WITH payment_data AS (
  SELECT 
    dp.*,
    CASE 
      WHEN moeda = 'US$' THEN 'USD'
      WHEN moeda = '€UR' THEN 'EUR'
      ELSE 'BRL'
    END as currency_code,
    EXTRACT(WEEK FROM vencim_parcela) as week_number,
    EXTRACT(QUARTER FROM vencim_parcela) as quarter,
    CASE 
      WHEN vencim_parcela < CURRENT_DATE AND status = 'pending' THEN 'overdue'
      WHEN vencim_parcela >= CURRENT_DATE AND vencim_parcela <= CURRENT_DATE + INTERVAL '30 days' THEN 'due_soon'
      ELSE 'future'
    END as urgency_status
  FROM debt_payments dp
)
SELECT 
  pd.*,
  -- Convert to BRL for unified reporting
  convert_currency(vlr_capital_parcela, currency_code, 'BRL', vencim_parcela::date) as principal_brl,
  convert_currency(juros_parcela, currency_code, 'BRL', vencim_parcela::date) as interest_brl,
  convert_currency(tot_capital_juros, currency_code, 'BRL', vencim_parcela::date) as total_brl,
  -- Add concentration metrics
  COUNT(*) OVER (PARTITION BY agente, DATE_TRUNC('month', vencim_parcela)) as monthly_payments_by_agent,
  SUM(tot_capital_juros) OVER (PARTITION BY DATE_TRUNC('week', vencim_parcela)) as weekly_total,
  SUM(tot_capital_juros) OVER (PARTITION BY DATE_TRUNC('month', vencim_parcela)) as monthly_total
FROM payment_data pd;

-- Create view for debt position analysis
CREATE OR REPLACE VIEW vw_debt_position_analysis AS
WITH current_balances AS (
  SELECT 
    agente,
    modalidade,
    moeda,
    CASE 
      WHEN moeda = 'US$' THEN 'USD'
      WHEN moeda = '€UR' THEN 'EUR'
      ELSE 'BRL'
    END as currency_code,
    COUNT(DISTINCT nr_contrato) as contract_count,
    SUM(saldo_a_pagar) as total_balance,
    AVG(tx_jur) as avg_interest_rate,
    MIN(vencim_parcela) as first_payment,
    MAX(vencim_parcela) as last_payment
  FROM debt_payments
  WHERE status != 'paid'
  GROUP BY agente, modalidade, moeda
)
SELECT 
  cb.*,
  convert_currency(total_balance, currency_code, 'BRL', CURRENT_DATE) as total_balance_brl,
  -- Calculate concentration percentages
  total_balance / SUM(total_balance) OVER (PARTITION BY agente) as pct_of_institution,
  total_balance / SUM(total_balance) OVER () as pct_of_total,
  -- Risk metrics
  CASE 
    WHEN total_balance / SUM(total_balance) OVER () > 0.25 THEN 'high_concentration'
    WHEN total_balance / SUM(total_balance) OVER () > 0.15 THEN 'medium_concentration'
    ELSE 'low_concentration'
  END as concentration_risk
FROM current_balances cb;

-- Create trigger for scheduled reports updated_at
CREATE TRIGGER trigger_scheduled_reports_updated_at
  BEFORE UPDATE ON scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_payments_updated_at();

-- Grant appropriate permissions
GRANT SELECT ON currency_rates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON report_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE ON scheduled_reports TO authenticated;
GRANT SELECT, INSERT ON report_generation_log TO authenticated;
GRANT SELECT ON vw_cash_flow_analysis TO authenticated;
GRANT SELECT ON vw_debt_position_analysis TO authenticated;