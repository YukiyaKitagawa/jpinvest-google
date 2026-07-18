export interface JPStockTicker {
  ticker_symbol: string;
  company_name: string;
  sector_category: string;
  theme_tags: string[];
  exposure_score: number;
  rank: number;
  is_active: boolean;
  consecutive_low_weeks: number;
  added_at?: string;
  added_reason?: string;
  removed_at?: string;
  removed_reason?: string;
  created_at?: string;
}

export interface JPStockIntelligence {
  id: number;
  ticker_symbol: string;
  recorded_at: string;
  current_price: number;
  price_change_pct: number;
  per_ratio?: number;
  pbr_ratio?: number;
  dividend_yield?: number;
  market_cap?: number;
  roe?: number;
  market_sentiment: 'positive' | 'neutral' | 'negative';
  impact_score: number;
  news_summary?: string;
  news_headline?: string;
  news_url?: string;
  disclosure_summary?: string;
  disclosure_url?: string;
}

export interface JPStockIntradayPrice {
  id: number;
  ticker_symbol: string;
  price: number;
  recorded_at: string;
}

export interface JPMarketHoliday {
  date: string;
  reason: string;
}

/**
 * EDINETから抽出してfinancial_snapshotsへ保存した決算実績。
 * ブラウザにはextraction_status = successの行だけ公開します。
 */
export interface FinancialSnapshot {
  id: number;
  stock_code: string;
  edinet_code: string;
  document_id: string;
  document_type_code?: string;
  document_type_name?: string;
  company_name?: string;
  submitted_at?: string;
  fiscal_year_start?: string;
  fiscal_year_end?: string;
  period_type?: string;
  accounting_standard?: string;

  revenue?: number;
  operating_profit?: number;
  ordinary_profit?: number;
  profit_before_tax?: number;
  net_income?: number;

  total_assets?: number;
  liabilities?: number;
  equity?: number;

  shares_outstanding?: number;
  treasury_shares?: number;

  eps_actual?: number;
  eps_forecast?: number;
  bps?: number;

  annual_dividend_actual?: number;
  annual_dividend_forecast?: number;

  operating_cash_flow?: number;
  investing_cash_flow?: number;
  financing_cash_flow?: number;

  source_url?: string;
  source_file_name?: string;
  extraction_status: string;
  created_at?: string;
  updated_at?: string;
}

// Aggregated item type for the stock card grid
export interface StockDashboardItem {
  ticker_symbol: string;
  company_name: string;
  sector_category: string;
  theme_tags: string[];
  exposure_score: number;
  rank: number;
  is_active: boolean;

  // From JPStockIntelligence (latest snapshot)
  current_price: number;
  price_change_pct: number;
  per_ratio?: number;
  pbr_ratio?: number;
  dividend_yield?: number;
  market_cap?: number;
  roe?: number;
  market_sentiment: 'positive' | 'neutral' | 'negative';
  impact_score: number;
  news_headline?: string;
  news_summary?: string;
  news_url?: string;
  disclosure_headline?: string;
  disclosure_summary?: string;
  disclosure_url?: string;
  recorded_at?: string;

  // From financial_snapshots (latest fiscal year per stock)
  financial_snapshot_available?: boolean;
  financial_document_id?: string;
  financial_document_type_name?: string;
  financial_submitted_at?: string;
  fiscal_year_start?: string;
  fiscal_year_end?: string;
  accounting_standard?: string;

  revenue?: number;
  operating_profit?: number;
  ordinary_profit?: number;
  profit_before_tax?: number;
  net_income?: number;

  total_assets?: number;
  liabilities?: number;
  equity?: number;

  shares_outstanding?: number;
  treasury_shares?: number;

  eps_actual?: number;
  eps_forecast?: number;
  bps?: number;

  annual_dividend_actual?: number;
  annual_dividend_forecast?: number;

  operating_cash_flow?: number;
  investing_cash_flow?: number;
  financing_cash_flow?: number;

  financial_source_url?: string;
}
