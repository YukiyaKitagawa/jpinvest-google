import React, { useRef, useState, useEffect } from 'react';
import { JPStockIntradayPrice } from '../types';
import { HelpCircle, Clock } from 'lucide-react';

interface IntradayChartProps {
  tickerSymbol: string;
  prices: JPStockIntradayPrice[];
}

export const IntradayChart: React.FC<IntradayChartProps> = ({ tickerSymbol, prices }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<JPStockIntradayPrice | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  if (prices.length === 0) {
    return (
      <div className="h-64 border border-outline-variant rounded-md flex flex-col items-center justify-center bg-white p-lg text-on-surface-variant">
        <Clock className="w-8 h-8 text-on-surface-variant mb-2 animate-pulse" />
        <span className="text-sm font-sans">株価推移データをロード中...</span>
      </div>
    );
  }

  // Calculate stats for SVG scaling
  const priceValues = prices.map(p => p.price);
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  
  // Add padding so chart does not clip
  const delta = maxPrice - minPrice;
  const padding = delta === 0 ? 10 : delta * 0.1;
  const yMin = minPrice - padding;
  const yMax = maxPrice + padding;
  const yRange = yMax - yMin;

  // Determine trend color (compare first and last price)
  const firstPrice = prices[0].price;
  const lastPrice = prices[prices.length - 1].price;
  const isUpTrend = lastPrice >= firstPrice;
  const themeColor = isUpTrend ? '#0F9D58' : '#D93025';

  // Sizing
  const width = 1000;
  const height = 240;

  // グラフ内の余白
  const plotLeft = 72;
  const plotRight = 16;
  const plotTop = 12;
  const plotBottom = 12;
  
  const plotWidth = width - plotLeft - plotRight;
  const plotHeight = height - plotTop - plotBottom;
  const plotBottomY = height - plotBottom;
  // Convert time string for label (e.g., '2026-07-17T09:30:00.000Z' -> '09:30')
  const formatTime = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };
  
  // Build the path definition
  const points = prices.map((p, index) => {
    const ratio =
      prices.length === 1
        ? 0
        : index / (prices.length - 1);
  
    const x = plotLeft + ratio * plotWidth;
  
    // SVGは下方向がプラスなので、価格が高いほど上に配置する
    const y =
      plotBottomY -
      ((p.price - yMin) / yRange) * plotHeight;
  
    return { x, y, data: p };
  });
  
  // SVG path definition
  const pathData = points.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Fill path definition (area chart)
  const fillPathData =
    `${pathData} ` +
    `L ${plotLeft + plotWidth} ${plotBottomY} ` +
    `L ${plotLeft} ${plotBottomY} Z`;
  
  // Handle cursor tracking across the SVG area
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouseX from client coordinate to SVG viewBox coordinate system
    const svgX = (mouseX / rect.width) * width;
    const svgY = (mouseY / rect.height) * height;

    // Find closest index
    let closestIndex = 0;
    let minDistance = Infinity;

    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setHoverIndex(closestIndex);
    setHoveredPoint(points[closestIndex].data);
    setCoords({ x: points[closestIndex].x, y: points[closestIndex].y });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverIndex(null);
  };

  // Filter X-axis labels to avoid crowding (show 5 strategic times)
  const xLabelsIndices = [0, Math.floor(prices.length * 0.25), Math.floor(prices.length * 0.5), Math.floor(prices.length * 0.75), prices.length - 1];
  
  // Y軸の価格目盛り
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, index) => {
    const ratio = index / (yTickCount - 1);
    const price = yMax - ratio * yRange;
    const y = plotTop + ratio * plotHeight;
  
    return {
      price: Math.round(price),
      y,
    };
  });
  
  return (
    <div id="intraday-chart-wrapper" className="bg-white p-md border border-outline-variant rounded-md shadow-sm" ref={containerRef}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs mb-sm">
        <span className="font-label-caps text-label-caps text-[#031636] uppercase tracking-wider flex items-center gap-1.5">
          株価推移 (本日15分足) <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
        </span>
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-1">
            <span className="text-xs text-on-surface-variant font-sans">基準価格:</span>
            <span className="font-mono text-xs font-bold text-primary">¥{firstPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-on-surface-variant font-sans">
              {hoveredPoint ? '選択箇所:' : '現在値:'}
            </span>
            <span
              className="font-mono text-xs font-bold"
              style={{ color: themeColor }}
            >
              ¥{(hoveredPoint ? hoveredPoint.price : lastPrice).toLocaleString()}
            </span>
          </div>
          {hoveredPoint && (
            <div className="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-sm">
              <span className="text-[10px] text-primary font-bold font-mono">
                {formatTime(hoveredPoint.recorded_at)} JST
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-44 overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id={`grad-${tickerSymbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {yTicks.map((tick, index) => (
            <line
              key={`grid-${index}`}
              x1={plotLeft}
              y1={tick.y}
              x2={plotLeft + plotWidth}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Area Fill */}
          <path d={fillPathData} fill={`url(#grad-${tickerSymbol})`} />

          {/* Stroke Line */}
          <path d={pathData} fill="none" stroke={themeColor} strokeWidth="2" strokeLinejoin="round" />

          {/* Render circular point elements for visual feedback */}
          {prices.map((p, idx) => {
            const pt = points[idx];
            const isHovered = hoverIndex === idx;
            const isSpecialNews = idx === Math.floor(prices.length * 0.45) || idx === Math.floor(prices.length * 0.75); // simulate news positions on chart
            
            return (
              <g key={idx}>
                {isHovered && (
                  <>
                    {/* Vertical guideline */}
                    <line
                      x1={pt.x}
                      y1="0"
                      x2={pt.x}
                      y2={height}
                      stroke="#031636"
                      strokeWidth="1.5"
                      strokeDasharray="4"
                    />
                    {/* Highlighted core dot */}
                    <circle cx={pt.x} cy={pt.y} r="5" fill={themeColor} stroke="#ffffff" strokeWidth="2" />
                  </>
                )}
                {/* News indicator pin if applicable */}
                {isSpecialNews && !isHovered && (
                  <g className="cursor-pointer">
                    <circle cx={pt.x} cy={pt.y} r="6" fill="#1A2B4C" stroke="#ffffff" strokeWidth="1.5" />
                    <line x1={pt.x} y1={pt.y} x2={pt.x} y2={height} stroke="#1A2B4C" strokeWidth="1" strokeDasharray="2" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Y Axis Labels */}
        <div className="pointer-events-none absolute inset-0">
          {yTicks.map((tick, index) => (
            <span
              key={`y-label-${index}`}
              className="absolute left-1 -translate-y-1/2 bg-white/80 pr-1 font-mono text-[10px] font-medium text-slate-500"
              style={{
                top: `${(tick.y / height) * 100}%`,
              }}
            >
              ¥{tick.price.toLocaleString()}
            </span>
          ))}
        </div>
        
        {/* Floating Tooltip during tracking */}
        {hoveredPoint && (
          <div
            className="absolute z-10 pointer-events-none bg-primary text-white p-2 rounded shadow-lg border border-white/15 text-xs font-sans transition-all duration-75"
            style={{
              left: `${Math.min(90, Math.max(2, (coords.x / width) * 100))}%`,
              transform: 'translateX(-50%)',
              bottom: `${height - (coords.y / height) * 176 + 10}px`
            }}
          >
            <p className="font-mono font-bold text-center">¥{hoveredPoint.price.toLocaleString()}</p>
            <p className="text-[10px] text-slate-300 text-center mt-0.5">{formatTime(hoveredPoint.recorded_at)} JST</p>
          </div>
        )}
      </div>

      {/* X Axis Labels */}
      <div
        className="flex items-center justify-between mt-xs border-t border-slate-100 pt-sm"
        style={{
          paddingLeft: `${(plotLeft / width) * 100}%`,
          paddingRight: `${(plotRight / width) * 100}%`,
        }}
      >
        {xLabelsIndices.map((idx) => {
          if (idx >= prices.length) return null;
          const p = prices[idx];
          return (
            <span key={idx} className="font-mono text-[10px] text-on-surface-variant">
              {formatTime(p.recorded_at)}
            </span>
          );
        })}
      </div>
    </div>
  );
};
