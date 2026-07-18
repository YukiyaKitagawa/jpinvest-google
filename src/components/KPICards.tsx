import React from 'react';
import { StockDashboardItem } from '../types';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, TrendingDown, Smile } from 'lucide-react';

interface KPICardsProps {
  items: StockDashboardItem[];
}

export const KPICards: React.FC<KPICardsProps> = ({ items }) => {
  // Calculations
  const totalStocks = items.length;
  
  const avgImpactScore = totalStocks > 0
    ? Math.round((items.reduce((acc, curr) => acc + curr.impact_score, 0) / totalStocks) * 10) / 10
    : 0;

  const risingStocks = items.filter(i => i.price_change_pct > 0).length;
  const fallingStocks = items.filter(i => i.price_change_pct < 0).length;
  
  // Highest impact positive sentiment stock
  const highestSentimentStock = [...items]
    .filter(i => i.market_sentiment === 'positive')
    .sort((a, b) => b.impact_score - a.impact_score)[0];

  return (
    <div id="kpi-panel" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md mb-xl">
      {/* Average Impact */}
      <div id="kpi-avg-impact" className="bg-white p-md border border-outline-variant rounded-md shadow-sm transition-all hover:border-outline duration-200">
        <div className="flex items-center justify-between text-on-surface-variant mb-sm">
          <span className="font-label-caps text-label-caps text-xs text-on-surface-variant tracking-wider uppercase">本日の平均インパクト</span>
          <div className="p-[6px] bg-primary-container/10 rounded-sm">
            <Activity className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="flex items-baseline gap-sm">
          <span className="font-mono text-3xl font-bold text-primary tracking-tight">{avgImpactScore}</span>
          <span className="text-xs text-on-surface-variant font-sans">/ 10.0</span>
        </div>
        <p className="text-[11px] text-on-surface-variant mt-xs font-sans">
          対象銘柄数: <span className="font-mono font-bold text-primary">{totalStocks}</span> 銘柄の平均話題度
        </p>
      </div>

      {/* Rising Stocks */}
      <div id="kpi-rising" className="bg-white p-md border border-outline-variant rounded-md shadow-sm transition-all hover:border-outline duration-200">
        <div className="flex items-center justify-between text-on-surface-variant mb-sm">
          <span className="font-label-caps text-label-caps text-xs text-on-surface-variant tracking-wider uppercase">上昇銘柄数</span>
          <div className="p-[6px] bg-secondary-container/10 rounded-sm">
            <TrendingUp className="w-4 h-4 text-[#0F9D58]" />
          </div>
        </div>
        <div className="flex items-baseline gap-sm">
          <span className="font-mono text-3xl font-bold text-[#0F9D58] tracking-tight">{risingStocks}</span>
          <span className="text-xs text-on-surface-variant font-sans">/ {totalStocks} 銘柄</span>
        </div>
        <p className="text-[11px] text-[#0F9D58] mt-xs font-semibold flex items-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5" />
          プラス寄与セクター牽引
        </p>
      </div>

      {/* Falling Stocks */}
      <div id="kpi-falling" className="bg-white p-md border border-outline-variant rounded-md shadow-sm transition-all hover:border-outline duration-200">
        <div className="flex items-center justify-between text-on-surface-variant mb-sm">
          <span className="font-label-caps text-label-caps text-xs text-on-surface-variant tracking-wider uppercase">下落銘柄数</span>
          <div className="p-[6px] bg-error-container/10 rounded-sm">
            <TrendingDown className="w-4 h-4 text-[#D93025]" />
          </div>
        </div>
        <div className="flex items-baseline gap-sm">
          <span className="font-mono text-3xl font-bold text-[#D93025] tracking-tight">{fallingStocks}</span>
          <span className="text-xs text-on-surface-variant font-sans">/ {totalStocks} 銘柄</span>
        </div>
        <p className="text-[11px] text-[#D93025] mt-xs font-semibold flex items-center gap-1">
          <ArrowDownRight className="w-3.5 h-3.5" />
          利益確定売り・調整局面
        </p>
      </div>

      {/* Best Sentiment */}
      <div id="kpi-best-sentiment" className="bg-white p-md border border-outline-variant rounded-md shadow-sm transition-all hover:border-outline duration-200">
        <div className="flex items-center justify-between text-on-surface-variant mb-sm">
          <span className="font-label-caps text-label-caps text-xs text-on-surface-variant tracking-wider uppercase">最高センチメント銘柄</span>
          <div className="p-[6px] bg-secondary-container/15 rounded-sm">
            <Smile className="w-4 h-4 text-secondary" />
          </div>
        </div>
        {highestSentimentStock ? (
          <div>
            <div className="flex items-baseline gap-xs overflow-hidden">
              <span className="font-sans text-lg font-bold text-primary truncate max-w-[170px]" title={highestSentimentStock.company_name}>
                {highestSentimentStock.company_name}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">({highestSentimentStock.ticker_symbol})</span>
            </div>
            <div className="flex items-center gap-sm mt-1">
              <span className="px-1.5 py-0.5 bg-secondary text-white text-[10px] font-mono font-bold rounded-sm uppercase tracking-wide">
                Impact {highestSentimentStock.impact_score}
              </span>
              <span className="text-xs text-[#0F9D58] font-semibold">強気センチメント</span>
            </div>
          </div>
        ) : (
          <div>
            <span className="font-sans text-sm text-on-surface-variant">該当なし</span>
            <p className="text-[11px] text-on-surface-variant mt-2">強気材料のある銘柄がありません</p>
          </div>
        )}
      </div>
    </div>
  );
};
