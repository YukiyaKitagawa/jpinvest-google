import React from 'react';
import { StockDashboardItem } from '../types';
import { Sparkles, MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StockCardProps {
  item: StockDashboardItem;
  onClick: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({ item, onClick }) => {
  const isPositive = item.price_change_pct > 0;
  const isNegative = item.price_change_pct < 0;

  // Formatting price
  const formattedPrice = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 1
  }).format(item.current_price);

  const formattedChange = isPositive
    ? `+${item.price_change_pct.toFixed(2)}%`
    : `${item.price_change_pct.toFixed(2)}%`;

  return (
    <div
      id={`stock-card-${item.ticker_symbol}`}
      onClick={onClick}
      className="bg-white border border-outline-variant hover:border-primary rounded-md p-md cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between group"
    >
      <div>
        {/* Header: Symbol & Sector & Impact Score */}
        <div className="flex justify-between items-start gap-sm mb-sm">
          <div>
            <div className="flex items-center gap-xs">
              <span className="font-mono text-xs font-bold text-primary tracking-wider">{item.ticker_symbol}</span>
              <span className="text-[10px] text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded-sm">
                {item.sector_category}
              </span>
            </div>
            <h3 className="font-sans text-base font-bold text-primary mt-1 group-hover:text-primary-container transition-colors line-clamp-1">
              {item.company_name}
            </h3>
          </div>
          <div className="flex flex-col items-end shrink-0">
            {/* Impact Score block */}
            <span className="px-2 py-1 bg-[#1A2B4C] text-white font-mono text-xs font-bold rounded-sm shadow-sm">
              Impact {item.impact_score}
            </span>
            
            {/* Sentiment label */}
            <div className="flex items-center gap-1 mt-1">
              {item.market_sentiment === 'positive' && (
                <span className="text-[10px] text-[#0F9D58] font-bold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D58]"></span>
                  強気
                </span>
              )}
              {item.market_sentiment === 'negative' && (
                <span className="text-[10px] text-[#D93025] font-bold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D93025]"></span>
                  弱気
                </span>
              )}
              {item.market_sentiment === 'neutral' && (
                <span className="text-[10px] text-on-surface-variant font-bold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  中立
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price display with monospaced font */}
        <div className="flex items-baseline gap-md mb-md">
          <span className="font-mono text-xl font-bold text-primary tracking-tight">{formattedPrice}</span>
          <span
            className={`font-mono text-xs font-bold flex items-center ${
              isPositive ? 'text-[#0F9D58]' : isNegative ? 'text-[#D93025]' : 'text-on-surface-variant'
            }`}
          >
            {isPositive && <TrendingUp className="w-3 h-3 mr-0.5" />}
            {isNegative && <TrendingDown className="w-3 h-3 mr-0.5" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3 mr-0.5" />}
            {formattedChange}
          </span>
        </div>

        {/* Theme tag list */}
        <div className="flex flex-wrap gap-xs mb-md">
          {item.theme_tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 bg-[#eff4ff] text-[#031636] font-sans text-[10px] font-semibold rounded-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Embedded High-Density News Alert Box */}
      {item.news_headline ? (
        <div className="p-sm bg-surface-container-low border border-outline-variant rounded-sm mt-auto">
          <div className="flex items-center gap-1 text-[10px] text-primary font-bold mb-1 uppercase tracking-wide">
            <MessageSquare className="w-3 h-3 text-primary-container" />
            <span>最新トピック</span>
          </div>
          <p className="text-xs text-on-surface line-clamp-2 leading-relaxed" title={item.news_headline}>
            {item.news_headline}
          </p>
        </div>
      ) : (
        <div className="p-sm bg-slate-50 border border-slate-100 rounded-sm mt-auto">
          <p className="text-xs text-on-surface-variant italic">本日、話題となる開示情報やニュースはありません</p>
        </div>
      )}
    </div>
  );
};
