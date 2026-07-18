import { createClient } from '@supabase/supabase-js';
import { StockDashboardItem, JPStockIntradayPrice } from './types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetches tickers joined with their latest daily snapshot intelligence from Supabase.
 */
export async function fetchDashboardItems(): Promise<StockDashboardItem[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  
  // 1. Fetch active tickers
  const { data: tickers, error: tickersError } = await supabase
    .from('jp_stock_tickers')
    .select('ticker_symbol, company_name, sector_category, theme_tags, exposure_score, rank, is_active')
    .eq('is_active', true);
    
  if (tickersError) {
    throw tickersError;
  }
  
  // 2. Fetch all intelligence records (to extract latest)
  const { data: intel, error: intelError } = await supabase
    .from('jp_stock_intelligence')
    .select('*')
    .order('recorded_at', { ascending: false });
    
  if (intelError) {
    throw intelError;
  }
  
  // Client-side mapping to aggregate the latest record per ticker
  const latestIntelMap: { [symbol: string]: any } = {};
  if (intel) {
    for (const row of intel) {
      if (!latestIntelMap[row.ticker_symbol]) {
        latestIntelMap[row.ticker_symbol] = row;
      }
    }
  }
  
  // 3. Assemble and return StockDashboardItems
  const items: StockDashboardItem[] = (tickers || []).map((t: any) => {
    const latestIntel = latestIntelMap[t.ticker_symbol];
    return {
      ticker_symbol: t.ticker_symbol,
      company_name: t.company_name,
      sector_category: t.sector_category || "その他",
      theme_tags: t.theme_tags || [],
      exposure_score: Number(t.exposure_score || 0),
      rank: t.rank || 0,
      is_active: t.is_active,
      
      current_price: latestIntel ? Number(latestIntel.current_price) : 0,
      price_change_pct: latestIntel ? Number(latestIntel.price_change_pct) : 0,
      per_ratio: latestIntel?.per_ratio ? Number(latestIntel.per_ratio) : undefined,
      pbr_ratio: latestIntel?.pbr_ratio ? Number(latestIntel.pbr_ratio) : undefined,
      dividend_yield: latestIntel?.dividend_yield ? Number(latestIntel.dividend_yield) : undefined,
      market_cap: latestIntel?.market_cap ? Number(latestIntel.market_cap) : undefined,
      roe: latestIntel?.roe ? Number(latestIntel.roe) : undefined,
      market_sentiment: latestIntel?.market_sentiment || 'neutral',
      impact_score: latestIntel ? Number(latestIntel.impact_score) : 5,
      news_headline: latestIntel?.news_headline || '',
      news_summary: latestIntel?.news_summary || '',
      news_url: latestIntel?.news_url || '',
      disclosure_summary: latestIntel?.disclosure_summary || '',
      disclosure_url: latestIntel?.disclosure_url || '',
      recorded_at: latestIntel?.recorded_at || ''
    };
  });
  
  return items;
}

/**
 * Fetches intraday price entries for a ticker and JST date.
 */
export async function fetchIntradayPrices(tickerSymbol: string, dateStr: string = '2026-07-17'): Promise<JPStockIntradayPrice[]> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  
  // Query within boundaries of target date
  const { data, error } = await supabase
    .from('jp_stock_intraday_price')
    .select('id, ticker_symbol, price, recorded_at')
    .eq('ticker_symbol', tickerSymbol)
    .gte('recorded_at', `${dateStr}T00:00:00.000Z`)
    .lte('recorded_at', `${dateStr}T23:59:59.999Z`)
    .order('recorded_at', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return (data || []).map((row: any) => ({
    id: Number(row.id),
    ticker_symbol: row.ticker_symbol,
    price: Number(row.price),
    recorded_at: row.recorded_at
  }));
}
