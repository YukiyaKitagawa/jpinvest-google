import React, { useState, useEffect } from 'react';
import { StockDashboardItem } from './types';
import { fetchDashboardItems, isSupabaseConfigured } from './supabaseClient';
import { getMockDashboardItems } from './mockData';
import { KPICards } from './components/KPICards';
import { StockCard } from './components/StockCard';
import { StockDetailModal } from './components/StockDetailModal';
import {
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown,
  Search,
  Sparkles,
  RefreshCw,
  Database,
  Bookmark,
  Activity,
  Heart,
  ChevronDown
} from 'lucide-react';

export default function App() {
  // State
  const [stocks, setStocks] = useState<StockDashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSupabase, setIsSupabase] = useState(isSupabaseConfigured);
  const [fetchError, setFetchError] = useState('');

  // UI state
  const [selectedSector, setSelectedSector] = useState<string>('全セクター');
  const [sortBy, setSortBy] = useState<'impact' | 'change'>('impact');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<StockDashboardItem | null>(null);
  
  // Bookmarks saved in localStorage for persistent user watchlists
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ai_stock_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  // Sync bookmarks to storage
  useEffect(() => {
    localStorage.setItem('ai_stock_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Load Main stock list
  const loadStocksData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError('');
    try {
      if (isSupabaseConfigured) {
        const data = await fetchDashboardItems();
        if (data && data.length > 0) {
          setStocks(data);
          setIsSupabase(true);
        } else {
          // No data in Supabase tables, use mock data as fallback
          setStocks(getMockDashboardItems());
          setIsSupabase(false);
          setFetchError('Supabaseテーブルにレコードが見つかりません。モックデータを使用しています。');
        }
      } else {
        // Fallback to high-fidelity mock data directly
        setStocks(getMockDashboardItems());
        setIsSupabase(false);
      }
    } catch (err: any) {
      console.error("Error loading stocks data:", err);
      setStocks(getMockDashboardItems());
      setIsSupabase(false);
      setFetchError("Supabaseとの接続またはクエリの実行に失敗しました。ローカルデータに切り替えました。");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStocksData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStocksData(true);
  };

  const handleToggleBookmark = (symbol: string) => {
    setBookmarks((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Get distinct list of sectors for filter dropdown
  const allSectors = ['全セクター', ...Array.from(new Set(stocks.map((s) => s.sector_category)))];

  // Filtering Logic
  const filteredStocks = stocks.filter((stock) => {
    // Sector filter
    if (selectedSector !== '全セクター' && stock.sector_category !== selectedSector) {
      return false;
    }
    // Bookmarked filter
    if (showBookmarksOnly && !bookmarks.includes(stock.ticker_symbol)) {
      return false;
    }
    // Search filter (handles code or name matches)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const codeMatch = stock.ticker_symbol.toLowerCase().includes(query);
      const nameMatch = stock.company_name.toLowerCase().includes(query);
      const tagMatch = stock.theme_tags.some((tag) => tag.toLowerCase().includes(query));
      if (!codeMatch && !nameMatch && !tagMatch) {
        return false;
      }
    }
    return true;
  });

  // Grouping & Sorting Logic
  // First group stocks by sector category
  const groupedBySector: { [sector: string]: StockDashboardItem[] } = {};

  filteredStocks.forEach((stock) => {
    const sector = stock.sector_category;
    if (!groupedBySector[sector]) {
      groupedBySector[sector] = [];
    }
    groupedBySector[sector].push(stock);
  });

  // In each sector, sort based on toggle: impact or change
  Object.keys(groupedBySector).forEach((sector) => {
    groupedBySector[sector].sort((a, b) => {
      if (sortBy === 'impact') {
        // High impact first, secondary sort by rank
        return b.impact_score - a.impact_score || a.rank - b.rank;
      } else {
        // Highest price increase first
        return b.price_change_pct - a.price_change_pct;
      }
    });
  });

  // Sort sectors by their maximum item's score or total items
  const sortedSectors = Object.keys(groupedBySector).sort((a, b) => {
    const maxA = Math.max(...groupedBySector[a].map((item) => item.impact_score), 0);
    const maxB = Math.max(...groupedBySector[b].map((item) => item.impact_score), 0);
    return maxB - maxA || a.localeCompare(b);
  });

  return (
    <div id="dashboard-app" className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans antialiased pb-20">
      
      {/* Top Header Panel */}
      <header id="top-nav" className="sticky top-0 z-40 bg-[#031636] border-b border-white/10 px-md sm:px-lg py-sm h-16 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-md">
          <Sparkles className="w-6 h-6 text-[#8293ba] animate-pulse" />
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight font-sans text-white">
              AI株インパクトボード
            </h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
              Precision Equity Terminal
            </span>
          </div>
        </div>

        {/* Database backend status indicators */}
        <div className="flex items-center gap-sm">
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded-sm text-xs">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-sans">
              接続状態: {isSupabase ? (
                <span className="text-[#0F9D58] font-semibold">Supabase (接続中)</span>
              ) : (
                <span className="text-amber-400 font-semibold">ローカルモック(自動適用中)</span>
              )}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white/10 hover:bg-white/15 active:scale-95 disabled:opacity-50 text-white border border-white/10 rounded-sm transition-all"
            title="最新データを再読み込み"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-[1440px] mx-auto px-md sm:px-lg py-md sm:py-lg space-y-md sm:space-y-lg">
        
        {/* Supabase Connection Advisory banner if not connected */}
        {!isSupabaseConfigured && (
          <div className="p-sm sm:p-md bg-[#eff4ff] border border-[#cbdbf5] rounded-md text-xs sm:text-sm text-[#031636] flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary">💻 データベース接続検証準備完了</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  ユーザー独自のSupabaseに接続可能です。AI Studioの設定メニューから環境変数 
                  <code className="bg-white/80 px-1 font-mono text-primary font-bold mx-1">VITE_SUPABASE_URL</code> と
                  <code className="bg-white/80 px-1 font-mono text-primary font-bold">VITE_SUPABASE_ANON_KEY</code> を追加してください。
                </p>
              </div>
            </div>
            <button
              onClick={() => alert("1. 左側メニューの「Secrets / Environment Variables」を開く\n2. VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定\n3. 接続すると即座に実際のPostgreSQLテーブルのローテーションデータを取得します。")}
              className="text-xs font-bold text-primary underline shrink-0 whitespace-nowrap hover:opacity-85 text-left"
            >
              設定方法を詳しく表示
            </button>
          </div>
        )}

        {/* Database Warnings from Fetch failure */}
        {fetchError && (
          <div className="p-sm bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-800 flex items-center gap-2">
            <span>⚠️ {fetchError}</span>
          </div>
        )}

        {/* Hero Section Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-md border-b border-outline-variant pb-md">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#031636]">
              AI・半導体テーマ 日本株ダッシュボード
            </h2>
            <p className="text-xs text-on-surface-variant font-sans mt-1">
              国内市場におけるAI/生成AI/半導体関連のトピック発生およびTDnet適時開示状況を毎夕自動分析し、
              話題の強さとインパクト度を算定。
            </p>
          </div>

          {/* Filtering and Sort Controls */}
          <div className="flex flex-wrap items-center gap-sm">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="銘柄名、コード、#タグで検索..."
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-outline-variant focus:border-primary focus:outline-none rounded-sm text-xs text-on-surface"
              />
            </div>

            {/* Sector Dropdown */}
            <div className="relative bg-white border border-outline-variant hover:border-outline rounded-sm flex items-center px-2 py-1.5">
              <Filter className="w-3.5 h-3.5 text-on-surface-variant mr-1.5" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-transparent text-xs font-sans text-on-surface pr-6 outline-none appearance-none cursor-pointer border-none p-0 focus:ring-0"
              >
                {allSectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-2 pointer-events-none" />
            </div>

            {/* Bookmarks Watchlist Only Toggle */}
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold rounded-sm border transition-all ${
                showBookmarksOnly
                  ? 'bg-secondary-container border-[#006D3A] text-[#00723D]'
                  : 'bg-white border-outline-variant text-on-surface hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-current' : ''}`} />
              <span>お気に入り ({bookmarks.length})</span>
            </button>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortBy(sortBy === 'impact' ? 'change' : 'impact')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-bold bg-[#1A2B4C] hover:bg-primary-container text-white rounded-sm transition-colors cursor-pointer shadow-sm"
              title="並べ替え（インパクト順／前日比順）"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                {sortBy === 'impact' ? 'インパクト順' : '前日比順'}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic calculation KPI area */}
        <KPICards items={filteredStocks} />

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center bg-white border border-outline-variant rounded-md">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-sm text-on-surface-variant font-sans">
              最新データをロード中です。しばらくお待ちください...
            </p>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center bg-white border border-outline-variant rounded-md text-center p-lg">
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-base font-bold text-primary font-sans">
              該当する銘柄が見つかりませんでした。
            </p>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto font-sans">
              検索ワードやセクター絞り込み、お気に入りフィルターなどの条件を変更してお試しください。
            </p>
            <button
              onClick={() => {
                setSelectedSector('全セクター');
                setSearchQuery('');
                setShowBookmarksOnly(false);
              }}
              className="mt-4 px-md py-2 bg-primary text-white text-xs font-bold rounded-sm hover:opacity-90"
            >
              検索条件をリセットする
            </button>
          </div>
        ) : (
          /* Sector-Grouped Stock Grid */
          <div className="space-y-xl">
            {sortedSectors.map((sectorName) => {
              const sectorItems = groupedBySector[sectorName];
              if (sectorItems.length === 0) return null;

              return (
                <div key={sectorName} className="space-y-sm">
                  {/* Sector Header with badge */}
                  <div className="flex items-center gap-sm border-b border-outline-variant pb-xs">
                    <span className="w-1.5 h-4 bg-primary rounded-sm"></span>
                    <h3 className="text-sm font-bold text-[#031636] font-sans tracking-tight">
                      {sectorName}
                    </h3>
                    <span className="font-mono text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full font-bold">
                      {sectorItems.length}
                    </span>
                  </div>

                  {/* Stock Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
                    {sectorItems.map((stock) => (
                      <StockCard
                        key={stock.ticker_symbol}
                        item={stock}
                        onClick={() => setSelectedStock(stock)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Stock Detailed Overlay Modal */}
      {selectedStock && (
        <StockDetailModal
          item={selectedStock}
          onClose={() => setSelectedStock(null)}
          isBookmarked={bookmarks.includes(selectedStock.ticker_symbol)}
          onToggleBookmark={() => handleToggleBookmark(selectedStock.ticker_symbol)}
        />
      )}

      {/* Footer disclaimer */}
      <footer className="max-w-[1440px] mx-auto px-md sm:px-lg pt-xl border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-md text-on-surface-variant">
        <div>
          <p className="font-label-caps text-[10px] text-primary font-bold tracking-wider mb-1 uppercase">
            AI STOCK IMPACT TERMINAL
          </p>
          <p className="text-[10px] text-on-surface-variant font-sans">
            © 2026 AI Stock Impact Board. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-md text-[10px] font-sans">
          <span className="hover:text-primary cursor-pointer" onClick={() => alert("本サービスで提供している情報は、AIが分析した仮想・サンプルのスコアであり、特定の有価証券の買い推奨、売り推奨など投資勧誘を目的としたものではありません。実際の投資判断にあたっては十分ご注意ください。")}>
            免責事項
          </span>
          <span className="text-slate-300">|</span>
          <span className="hover:text-primary cursor-pointer" onClick={() => alert("本検証用アプリは、東証株価・各種IR開示システム(TDnet)から適宜ローテーションデータを連携し構築されています。")}>
            データ提供元
          </span>
          <span className="text-slate-300">|</span>
          <span className="hover:text-primary">プライバシーポリシー</span>
        </div>
      </footer>
    </div>
  );
}
