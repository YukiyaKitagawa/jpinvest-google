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
  market_cap?: number; // in Yen or Millions of Yen
  roe?: number;
  market_sentiment: 'positive' | 'neutral' | 'negative';
  impact_score: number; // 1 to 10
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
}
