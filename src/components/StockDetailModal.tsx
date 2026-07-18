import React, { useState, useEffect } from 'react';
import { StockDashboardItem, JPStockIntradayPrice } from '../types';
import { IntradayChart } from './IntradayChart';
import { X, Bookmark, TrendingUp, TrendingDown, Minus, ExternalLink, Activity, Award, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { fetchIntradayPrices, isSupabaseConfigured } from '../supabaseClient';
import { MOCK_INTRADAY_PRICES } from '../mockData';

interface StockDetailModalProps {
  item: StockDashboardItem;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  item,
  onClose,
  isBookmarked,
  onToggleBookmark
}) => {
  const [intradayData, setIntradayData] = useState<JPStockIntradayPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Close modal on Escape press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load Intraday Prices
  useEffect(() => {
    async function loadPrices() {
      setIsLoading(true);
      setErrorMessage('');
      try {
        if (isSupabaseConfigured) {
          // Attempt to load from real Supabase tables
          const data = await fetchIntradayPrices(item.ticker_symbol, '2026-07-17');
          if (data && data.length > 0) {
            setIntradayData(data);
          } else {
            // Fallback to local mock database if query is empty
            setIntradayData(MOCK_INTRADAY_PRICES[item.ticker_symbol] || []);
          }
        } else {
          // Use high density local mock database
          setIntradayData(MOCK_INTRADAY_PRICES[item.ticker_symbol] || []);
        }
      } catch (err: any) {
        console.error("Error loading intraday prices from Supabase:", err);
        setErrorMessage("Supabaseからの15分足データの読み込みに失敗しました。モックデータに切り替えます。");
        // Safe fallback
        setIntradayData(MOCK_INTRADAY_PRICES[item.ticker_symbol] || []);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrices();
  }, [item.ticker_symbol]);

  const isPositive = item.price_change_pct > 0;
  const isNegative = item.price_change_pct < 0;

  // Format statistics
  const formattedPrice = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 1
  }).format(item.current_price);

  const formattedChange = isPositive
    ? `+${item.price_change_pct.toFixed(2)}%`
    : `${item.price_change_pct.toFixed(2)}%`;

  const formatMarketCap = (cap?: number) => {
    if (cap === undefined || !Number.isFinite(cap)) return '---';
    if (cap >= 1000000000000) {
      return `${(cap / 1000000000000).toFixed(2)} 兆円`;
    }
    return `${(cap / 100000000).toFixed(0)} 億円`;
  };

  const formatFinancialAmount = (value?: number) => {
    if (value === undefined || !Number.isFinite(value)) {
      return '---';
    }

    const absoluteValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absoluteValue >= 1000000000000) {
      return `${sign}${(absoluteValue / 1000000000000).toFixed(2)} 兆円`;
    }

    if (absoluteValue >= 100000000) {
      return `${sign}${(absoluteValue / 100000000).toFixed(1)} 億円`;
    }

    if (absoluteValue >= 10000) {
      return `${sign}${(absoluteValue / 10000).toFixed(1)} 万円`;
    }

    return `${value.toLocaleString('ja-JP')} 円`;
  };

  const formatPerShare = (value?: number) => {
    if (value === undefined || !Number.isFinite(value)) {
      return '---';
    }

    return `${value.toLocaleString('ja-JP', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })} 円`;
  };

  const formatRatio = (
    value: number | undefined,
    suffix: string,
    digits: number
  ) => {
    if (value === undefined || !Number.isFinite(value)) {
      return '---';
    }

    return `${value.toFixed(digits)}${suffix}`;
  };

  const formatFiscalDate = (value?: string) => {
    if (!value) return '---';

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  return (
    <div
      id="detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-md sm:p-lg bg-[#031636]/45 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="detail-modal-container"
        className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-md shadow-2xl flex flex-col border border-outline-variant animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="p-md sm:p-lg border-b border-outline-variant flex flex-col gap-sm shrink-0 bg-white">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-sm">
                <span className="bg-primary text-on-primary font-mono text-xs font-bold px-2 py-0.5 rounded-sm">
                  {item.ticker_symbol}
                </span>
                <span className="text-xs text-on-surface-variant font-sans font-medium">
                  {item.sector_category} / 東証プライム
                </span>
              </div>
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-primary">
                {item.company_name}
              </h2>
            </div>
            
            <div className="flex items-center gap-sm">
              {/* Bookmark Toggle */}
              <button
                onClick={onToggleBookmark}
                className={`p-2 rounded-sm border transition-colors ${
                  isBookmarked
                    ? 'bg-secondary-container text-on-secondary-container border-[#006D3A]'
                    : 'bg-white text-on-surface-variant hover:bg-slate-50 border-outline-variant'
                }`}
                title={isBookmarked ? "ブックマーク解除" : "ブックマーク追加"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 bg-white hover:bg-slate-50 border border-outline-variant rounded-sm text-on-surface-variant transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {/* 現在値 */}
            <div className="flex min-h-[88px] flex-col justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">
                現在値
              </span>
          
              <span className="font-mono text-3xl font-bold leading-none text-slate-900">
                {formattedPrice}
              </span>
            </div>
          
            {/* 前日比 */}
            <div className="flex min-h-[88px] flex-col justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">
                前日比
              </span>
          
              <span
                className={`flex items-center font-mono text-xl font-bold leading-none ${
                  isPositive
                    ? 'text-[#0F9D58]'
                    : isNegative
                      ? 'text-[#D93025]'
                      : 'text-slate-600'
                }`}
              >
                {isPositive && <TrendingUp className="mr-1 h-5 w-5" />}
                {isNegative && <TrendingDown className="mr-1 h-5 w-5" />}
                {!isPositive && !isNegative && <Minus className="mr-1 h-5 w-5" />}
                {formattedChange}
              </span>
            </div>
          
            {/* AIインパクト度 */}
            <div className="flex min-h-[88px] flex-col justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">
                AIインパクト度
              </span>
          
              <div className="flex items-baseline gap-1 leading-none">
                <span className="font-mono text-3xl font-bold text-slate-900">
                  {item.impact_score}
                </span>
          
                <span className="font-mono text-lg font-bold text-slate-500">
                  / 10
                </span>
              </div>
            </div>
          
            {/* マーケットセンチメント */}
            <div className="flex min-h-[88px] flex-col justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">
                マーケットセンチメント
              </span>
          
              <div className="flex items-center text-lg font-bold leading-none">
                {item.market_sentiment === 'positive' && (
                  <span className="text-[#0F9D58]">● 強気 (Bullish)</span>
                )}
          
                {item.market_sentiment === 'negative' && (
                  <span className="text-[#D93025]">● 弱気 (Bearish)</span>
                )}
          
                {item.market_sentiment === 'neutral' && (
                  <span className="text-slate-600">● 中立 (Neutral)</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-md sm:p-lg space-y-md sm:space-y-lg bg-[#f8f9ff]">
          {/* Error Banner if database query fails and fallback triggered */}
          {errorMessage && (
            <div className="p-sm bg-[#ffdad6] border border-[#ba1a1a] rounded-sm text-xs text-[#93000a] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#ba1a1a]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Chart Wrapper */}
          <div className="w-full">
            <IntradayChart tickerSymbol={item.ticker_symbol} prices={intradayData} />
          </div>

          {/* Split Content: Left Financial Bento & AI Breakdown, Right News Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-md sm:gap-lg">
            {/* Left columns (financial stats + AI analysis) */}
            <div className="lg:col-span-2 space-y-md sm:space-y-lg">
              
              {/* Financial Stats Bento Box */}
              <div className="bg-white p-md border border-outline-variant rounded-md shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-sm">
                  <div>
                    <h3 className="font-label-caps text-label-caps text-[#031636] uppercase tracking-wider">
                      主要財務データ・ファンダメンタルズ
                    </h3>
                    <p className="mt-1 text-[10px] text-on-surface-variant">
                      株価指標は最新株価とEDINET決算実績から自動計算します。
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-2 py-1 text-[10px] font-bold ${
                      item.financial_snapshot_available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {item.financial_snapshot_available
                      ? `EDINET実績 ${formatFiscalDate(item.fiscal_year_end)}`
                      : 'EDINET実績 未取得'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-sm">
                  <div className="p-sm bg-surface-container-low border border-outline-variant rounded-sm text-center">
                    <p className="font-label-caps text-[10px] text-on-surface-variant">時価総額</p>
                    <p className="font-mono text-xs font-bold text-primary mt-1">
                      {formatMarketCap(item.market_cap)}
                    </p>
                  </div>
                  <div className="p-sm bg-surface-container-low border border-outline-variant rounded-sm text-center">
                    <p className="font-label-caps text-[10px] text-on-surface-variant">PER（実績）</p>
                    <p className="font-mono text-xs font-bold text-primary mt-1">
                      {formatRatio(item.per_ratio, '倍', 1)}
                    </p>
                  </div>
                  <div className="p-sm bg-surface-container-low border border-outline-variant rounded-sm text-center">
                    <p className="font-label-caps text-[10px] text-on-surface-variant">PBR（実績）</p>
                    <p className="font-mono text-xs font-bold text-primary mt-1">
                      {formatRatio(item.pbr_ratio, '倍', 1)}
                    </p>
                  </div>
                  <div className="p-sm bg-surface-container-low border border-outline-variant rounded-sm text-center">
                    <p className="font-label-caps text-[10px] text-on-surface-variant">ROE（期末自己資本）</p>
                    <p className="font-mono text-xs font-bold text-primary mt-1">
                      {formatRatio(item.roe, '%', 1)}
                    </p>
                  </div>
                  <div className="p-sm bg-surface-container-low border border-outline-variant rounded-sm text-center col-span-2 sm:col-span-1">
                    <p className="font-label-caps text-[10px] text-on-surface-variant">配当利回り</p>
                    <p className="font-mono text-xs font-bold text-primary mt-1">
                      {formatRatio(item.dividend_yield, '%', 2)}
                    </p>
                  </div>
                </div>

                {item.financial_snapshot_available ? (
                  <div className="mt-md border-t border-outline-variant pt-md">
                    <div className="mb-sm flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[10px] text-on-surface-variant">
                        <span className="font-bold text-primary">
                          {item.financial_document_type_name || '有価証券報告書'}
                        </span>
                        <span className="mx-1">・</span>
                        <span>{item.accounting_standard || '会計基準不明'}</span>
                        {item.financial_document_id && (
                          <>
                            <span className="mx-1">・</span>
                            <span className="font-mono">{item.financial_document_id}</span>
                          </>
                        )}
                      </div>

                      {item.financial_source_url && (
                        <a
                          href={item.financial_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                        >
                          EDINET原本
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
                      {[
                        ['売上高・売上収益', formatFinancialAmount(item.revenue)],
                        ['営業利益', formatFinancialAmount(item.operating_profit)],
                        ['当期純利益', formatFinancialAmount(item.net_income)],
                        ['総資産', formatFinancialAmount(item.total_assets)],
                        ['自己資本・純資産', formatFinancialAmount(item.equity)],
                        ['営業キャッシュフロー', formatFinancialAmount(item.operating_cash_flow)],
                        ['EPS', formatPerShare(item.eps_actual)],
                        ['BPS', formatPerShare(item.bps)],
                        ['年間配当', formatPerShare(item.annual_dividend_actual)]
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-sm border border-outline-variant bg-white p-sm"
                        >
                          <p className="text-[10px] text-on-surface-variant">{label}</p>
                          <p className="mt-1 font-mono text-xs font-bold text-primary">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-sm text-[10px] leading-relaxed text-on-surface-variant">
                      ROEは当期純利益÷期末自己資本で算出した簡易値です。厳密な平均自己資本ベースとは異なる場合があります。
                    </p>
                  </div>
                ) : (
                  <div className="mt-md rounded-sm border border-dashed border-outline-variant bg-slate-50 p-sm text-xs text-on-surface-variant">
                    この銘柄のEDINET決算実績はまだ保存されていません。提出書類の自動収集後に表示されます。
                  </div>
                )}
              </div>

              {/* AI Impact breakdown & analysis paragraph */}
              <div className="bg-white p-md border border-outline-variant rounded-md shadow-sm">
                <div className="flex items-center gap-1.5 mb-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-label-caps text-label-caps text-[#031636] uppercase tracking-wider">
                    AI/半導体テーマ ニュースインパクト分析
                  </h3>
                </div>
                
                {item.news_headline ? (
                  <div className="space-y-md">
                    <div className="p-sm bg-slate-50 border-l-4 border-primary text-primary font-sans text-xs font-semibold leading-relaxed">
                      {item.news_headline}
                    </div>
                    <div>
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                        AI要約・事業シナジー
                      </p>
                      <p className="text-xs text-on-surface leading-relaxed font-sans">
                        {item.news_summary || `${item.company_name}における最近のAI展開は話題性が高まっています。セクター内でも注目度が高く、テーマタグ（${item.theme_tags.map(t => `#${t}`).join(', ')}）に関連する市場シェアの獲得において競合他社に先んじた成長姿勢を示しています。`}
                      </p>
                    </div>

                    {/* Impact metrics breakdown */}
                    <div className="pt-sm border-t border-outline-variant">
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mb-sm">
                        定量影響シナリオ
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm text-xs font-sans">
                        <div className="flex items-center justify-between p-2 bg-[#eff4ff] rounded-sm">
                          <span className="font-bold text-primary">市場浸透スピード</span>
                          <span className="font-mono font-bold text-primary-container">非常に高い</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-[#eff4ff] rounded-sm">
                          <span className="font-bold text-primary">財務インパクト見通し</span>
                          <span className="font-mono font-bold text-secondary">中長期的に好影響</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant italic">この銘柄に関する詳細なAIインテリジェンス分析は現在ありません。</p>
                )}
              </div>

            </div>

            {/* Right sidebar: Related Links & Documents */}
            <div className="space-y-md sm:space-y-lg">
              
              {/* Document/News sources */}
              <div className="bg-white p-md border border-outline-variant rounded-md shadow-sm h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-label-caps text-label-caps text-[#031636] uppercase tracking-wider border-b border-primary pb-1 mb-md">
                    関連ニュース ＆ 適時開示
                  </h3>
                  
                  <div className="space-y-md">
                    {/* Latest general news item */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-1">
                        <span className="font-mono font-bold">2026.07.17 16:30</span>
                        <span className="text-secondary font-bold font-sans">AIニュース</span>
                      </div>
                      <h4 className="text-xs font-bold text-primary leading-tight hover:underline cursor-pointer">
                        {item.news_headline || '国内半導体・AIテクノロジー採用ニュース速報'}
                      </h4>
                      {item.news_url && (
                        <a
                          href={item.news_url}
                          target="_blank"
                          rel="referrer referrerPolicy=no-referrer"
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-2"
                        >
                          元記事リンクを表示 <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    {/* Disclosure TDnet Item */}
                    {item.disclosure_summary && (
                      <div className="border-t border-outline-variant pt-md">
                        <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-1">
                          <span className="font-mono font-bold">2026.07.17 適時開示</span>
                          <span className="text-[#364669] font-bold font-sans">TDnet公表</span>
                        </div>
                        <h4 className="text-xs font-bold text-primary leading-tight">
                          適時開示情報（東証開示システムより）
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-1 leading-normal font-sans">
                          {item.disclosure_summary}
                        </p>
                        {item.disclosure_url && (
                          <a
                            href={item.disclosure_url}
                            target="_blank"
                            rel="referrer referrerPolicy=no-referrer"
                            className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-2"
                          >
                            開示資料(PDF)を表示 <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-md border-t border-slate-100 mt-lg">
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    ※ ニュース見出し及び要約は、取引時間外の16:30 JSTに更新された公表情報を元に、AIがインパクトを自動算出しています。
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <footer className="p-md sm:p-lg border-t border-outline-variant flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-sm bg-white shrink-0">
          <div className="flex flex-wrap gap-sm">
            <button
              onClick={() => alert(`${item.company_name} (${item.ticker_symbol}) の取引注文画面を開きます（デモ機能）`)}
              className="px-lg py-2 bg-primary text-on-primary font-sans text-xs font-bold rounded-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              取引注文へ
            </button>
            <button
              onClick={() => alert(`${item.company_name} (${item.ticker_symbol}) の詳細調査レポート（PDF）の生成を開始します（デモ機能）`)}
              className="px-lg py-2 border border-primary text-primary font-sans text-xs font-bold rounded-sm hover:bg-[#eff4ff] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              詳細レポート生成
            </button>
          </div>
          <div className="flex items-center justify-center sm:justify-end text-on-surface-variant text-[11px] font-sans">
            基準データ最終更新: 2026/07/17 16:30 JST (本日データ)
          </div>
        </footer>
      </div>
    </div>
  );
};
