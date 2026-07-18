import { createClient } from '@supabase/supabase-js';
import {
  FinancialSnapshot,
  JPStockIntradayPrice,
  StockDashboardItem
} from './types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function calculatePer(
  currentPrice: number,
  epsActual?: number,
): number | undefined {
  if (
    currentPrice <= 0 ||
    epsActual === undefined ||
    epsActual <= 0
  ) {
    return undefined;
  }

  return currentPrice / epsActual;
}

function calculatePbr(
  currentPrice: number,
  bps?: number,
): number | undefined {
  if (
    currentPrice <= 0 ||
    bps === undefined ||
    bps <= 0
  ) {
    return undefined;
  }

  return currentPrice / bps;
}

function calculateDividendYield(
  currentPrice: number,
  annualDividend?: number,
): number | undefined {
  if (
    currentPrice <= 0 ||
    annualDividend === undefined ||
    annualDividend < 0
  ) {
    return undefined;
  }

  return (annualDividend / currentPrice) * 100;
}

function calculateMarketCap(
  currentPrice: number,
  sharesOutstanding?: number,
): number | undefined {
  if (
    currentPrice <= 0 ||
    sharesOutstanding === undefined ||
    sharesOutstanding <= 0
  ) {
    return undefined;
  }

  return currentPrice * sharesOutstanding;
}

function calculateRoe(
  netIncome?: number,
  equity?: number,
): number | undefined {
  if (
    netIncome === undefined ||
    equity === undefined ||
    equity <= 0
  ) {
    return undefined;
  }

  return (netIncome / equity) * 100;
}

/**
 * Fetches active tickers and joins:
 * - latest jp_stock_intelligence row
 * - latest successful financial_snapshots row
 *
 * EDINET実績が取得済みの場合は、PER・PBR・配当利回り・時価総額・ROEを
 * current_priceとfinancial_snapshotsから再計算します。
 * EDINET実績がない銘柄はjp_stock_intelligenceの既存値を維持します。
 */
export async function fetchDashboardItems(): Promise<StockDashboardItem[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data: tickers, error: tickersError } = await supabase
    .from('jp_stock_tickers')
    .select(
      'ticker_symbol, company_name, sector_category, theme_tags, exposure_score, rank, is_active',
    )
    .eq('is_active', true);

  if (tickersError) {
    throw tickersError;
  }

  const { data: intel, error: intelError } = await supabase
    .from('jp_stock_intelligence')
    .select('*')
    .order('recorded_at', { ascending: false });

  if (intelError) {
    throw intelError;
  }

  const { data: snapshots, error: snapshotsError } = await supabase
    .from('financial_snapshots')
    .select(`
      id,
      stock_code,
      edinet_code,
      document_id,
      document_type_code,
      document_type_name,
      company_name,
      submitted_at,
      fiscal_year_start,
      fiscal_year_end,
      period_type,
      accounting_standard,
      revenue,
      operating_profit,
      ordinary_profit,
      profit_before_tax,
      net_income,
      total_assets,
      liabilities,
      equity,
      shares_outstanding,
      treasury_shares,
      eps_actual,
      eps_forecast,
      bps,
      annual_dividend_actual,
      annual_dividend_forecast,
      operating_cash_flow,
      investing_cash_flow,
      financing_cash_flow,
      source_url,
      source_file_name,
      extraction_status,
      created_at,
      updated_at
    `)
    .eq('extraction_status', 'success')
    .order('fiscal_year_end', {
      ascending: false,
      nullsFirst: false,
    })
    .order('submitted_at', {
      ascending: false,
      nullsFirst: false,
    })
    .order('updated_at', {
      ascending: false,
      nullsFirst: false,
    });

  if (snapshotsError) {
    throw snapshotsError;
  }

  const latestIntelMap: Record<string, any> = {};
  for (const row of intel || []) {
    const symbol = String(row.ticker_symbol || '').trim();
    if (symbol && !latestIntelMap[symbol]) {
      latestIntelMap[symbol] = row;
    }
  }

  const latestSnapshotMap: Record<string, FinancialSnapshot> = {};
  for (const row of snapshots || []) {
    const stockCode = String(row.stock_code || '').trim();
    if (stockCode && !latestSnapshotMap[stockCode]) {
      latestSnapshotMap[stockCode] = row as FinancialSnapshot;
    }
  }

  return (tickers || []).map((ticker: any) => {
    const tickerSymbol = String(ticker.ticker_symbol || '').trim();
    const latestIntel = latestIntelMap[tickerSymbol];
    const latestSnapshot = latestSnapshotMap[tickerSymbol];

    const currentPrice =
      toNumberOrUndefined(latestIntel?.current_price) ?? 0;

    const epsActual = toNumberOrUndefined(
      latestSnapshot?.eps_actual,
    );
    const bps = toNumberOrUndefined(latestSnapshot?.bps);
    const annualDividendActual = toNumberOrUndefined(
      latestSnapshot?.annual_dividend_actual,
    );
    const sharesOutstanding = toNumberOrUndefined(
      latestSnapshot?.shares_outstanding,
    );
    const netIncome = toNumberOrUndefined(
      latestSnapshot?.net_income,
    );
    const equity = toNumberOrUndefined(latestSnapshot?.equity);

    const calculatedPer = latestSnapshot
      ? calculatePer(currentPrice, epsActual)
      : undefined;
    const calculatedPbr = latestSnapshot
      ? calculatePbr(currentPrice, bps)
      : undefined;
    const calculatedDividendYield = latestSnapshot
      ? calculateDividendYield(
          currentPrice,
          annualDividendActual,
        )
      : undefined;
    const calculatedMarketCap = latestSnapshot
      ? calculateMarketCap(
          currentPrice,
          sharesOutstanding,
        )
      : undefined;
    const calculatedRoe = latestSnapshot
      ? calculateRoe(netIncome, equity)
      : undefined;

    return {
      ticker_symbol: tickerSymbol,
      company_name: ticker.company_name,
      sector_category:
        ticker.sector_category || 'その他',
      theme_tags: ticker.theme_tags || [],
      exposure_score: Number(ticker.exposure_score || 0),
      rank: Number(ticker.rank || 0),
      is_active: Boolean(ticker.is_active),

      current_price: currentPrice,
      price_change_pct:
        toNumberOrUndefined(latestIntel?.price_change_pct) ?? 0,

      per_ratio:
        calculatedPer ??
        toNumberOrUndefined(latestIntel?.per_ratio),
      pbr_ratio:
        calculatedPbr ??
        toNumberOrUndefined(latestIntel?.pbr_ratio),
      dividend_yield:
        calculatedDividendYield ??
        toNumberOrUndefined(latestIntel?.dividend_yield),
      market_cap:
        calculatedMarketCap ??
        toNumberOrUndefined(latestIntel?.market_cap),
      roe:
        calculatedRoe ??
        toNumberOrUndefined(latestIntel?.roe),

      market_sentiment:
        latestIntel?.market_sentiment || 'neutral',
      impact_score:
        toNumberOrUndefined(latestIntel?.impact_score) ?? 5,
      news_headline: latestIntel?.news_headline || '',
      news_summary: latestIntel?.news_summary || '',
      news_url: latestIntel?.news_url || '',
      disclosure_summary:
        latestIntel?.disclosure_summary || '',
      disclosure_url: latestIntel?.disclosure_url || '',
      recorded_at: latestIntel?.recorded_at || '',

      financial_snapshot_available: Boolean(latestSnapshot),
      financial_document_id:
        latestSnapshot?.document_id,
      financial_document_type_name:
        latestSnapshot?.document_type_name,
      financial_submitted_at:
        latestSnapshot?.submitted_at,
      fiscal_year_start:
        latestSnapshot?.fiscal_year_start,
      fiscal_year_end:
        latestSnapshot?.fiscal_year_end,
      accounting_standard:
        latestSnapshot?.accounting_standard,

      revenue: toNumberOrUndefined(latestSnapshot?.revenue),
      operating_profit: toNumberOrUndefined(
        latestSnapshot?.operating_profit,
      ),
      ordinary_profit: toNumberOrUndefined(
        latestSnapshot?.ordinary_profit,
      ),
      profit_before_tax: toNumberOrUndefined(
        latestSnapshot?.profit_before_tax,
      ),
      net_income: netIncome,

      total_assets: toNumberOrUndefined(
        latestSnapshot?.total_assets,
      ),
      liabilities: toNumberOrUndefined(
        latestSnapshot?.liabilities,
      ),
      equity,

      shares_outstanding: sharesOutstanding,
      treasury_shares: toNumberOrUndefined(
        latestSnapshot?.treasury_shares,
      ),

      eps_actual: epsActual,
      eps_forecast: toNumberOrUndefined(
        latestSnapshot?.eps_forecast,
      ),
      bps,

      annual_dividend_actual: annualDividendActual,
      annual_dividend_forecast: toNumberOrUndefined(
        latestSnapshot?.annual_dividend_forecast,
      ),

      operating_cash_flow: toNumberOrUndefined(
        latestSnapshot?.operating_cash_flow,
      ),
      investing_cash_flow: toNumberOrUndefined(
        latestSnapshot?.investing_cash_flow,
      ),
      financing_cash_flow: toNumberOrUndefined(
        latestSnapshot?.financing_cash_flow,
      ),

      financial_source_url:
        latestSnapshot?.source_url,
    } satisfies StockDashboardItem;
  });
}

/**
 * Fetches intraday price entries for a ticker and JST date.
 */
export async function fetchIntradayPrices(
  tickerSymbol: string,
  dateStr: string = '2026-07-17',
): Promise<JPStockIntradayPrice[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

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
    recorded_at: row.recorded_at,
  }));
}
