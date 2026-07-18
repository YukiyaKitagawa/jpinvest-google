import { JPStockTicker, JPStockIntelligence, JPStockIntradayPrice, JPMarketHoliday, StockDashboardItem } from './types';

export const MOCK_TICKERS: JPStockTicker[] = [
  {
    ticker_symbol: "3778",
    company_name: "さくらインターネット",
    sector_category: "情報・通信業",
    theme_tags: ["AI", "クラウド", "GPU"],
    exposure_score: 92,
    rank: 1,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-01-10T00:00:00Z"
  },
  {
    ticker_symbol: "6702",
    company_name: "富士通",
    sector_category: "電気機器",
    theme_tags: ["AI", "フィジカルAI", "スパコン"],
    exposure_score: 85,
    rank: 2,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-01-15T00:00:00Z"
  },
  {
    ticker_symbol: "6701",
    company_name: "日本電気",
    sector_category: "電気機器",
    theme_tags: ["AI", "3Dモデル", "セキュリティ"],
    exposure_score: 78,
    rank: 3,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-02-01T00:00:00Z"
  },
  {
    ticker_symbol: "9432",
    company_name: "日本電信電話",
    sector_category: "情報・通信業",
    theme_tags: ["AI", "IOWN", "光ネットワーク"],
    exposure_score: 75,
    rank: 4,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-01-05T00:00:00Z"
  },
  {
    ticker_symbol: "9433",
    company_name: "KDDI",
    sector_category: "情報・通信業",
    theme_tags: ["AI", "データセンター", "5G"],
    exposure_score: 70,
    rank: 5,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-02-10T00:00:00Z"
  },
  {
    ticker_symbol: "6857",
    company_name: "アドバンテスト",
    sector_category: "電気機器",
    theme_tags: ["半導体", "テスター", "AIチップ"],
    exposure_score: 88,
    rank: 6,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-01-20T00:00:00Z"
  },
  {
    ticker_symbol: "8035",
    company_name: "東京エレクトロン",
    sector_category: "電気機器",
    theme_tags: ["半導体", "前工程", "エッチング"],
    exposure_score: 84,
    rank: 7,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-01-20T00:00:00Z"
  },
  {
    ticker_symbol: "4063",
    company_name: "信越化学工業",
    sector_category: "化学",
    theme_tags: ["半導体", "シリコンウェーハ", "素材"],
    exposure_score: 65,
    rank: 8,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-03-01T00:00:00Z"
  },
  {
    ticker_symbol: "7735",
    company_name: "SCREENホールディングス",
    sector_category: "電気機器",
    theme_tags: ["半導体", "洗浄装置", "微細化"],
    exposure_score: 62,
    rank: 9,
    is_active: true,
    consecutive_low_weeks: 0,
    added_at: "2026-03-12T00:00:00Z"
  },
  {
    ticker_symbol: "6501",
    company_name: "日立製作所",
    sector_category: "電気機器",
    theme_tags: ["AI", "Lumada", "社会インフラ"],
    exposure_score: 59,
    rank: 10,
    is_active: true,
    consecutive_low_weeks: 1,
    added_at: "2026-02-18T00:00:00Z"
  }
];

export const MOCK_INTELLIGENCE: JPStockIntelligence[] = [
  {
    id: 1,
    ticker_symbol: "3778",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 2750,
    price_change_pct: -6.02,
    per_ratio: 42.4,
    pbr_ratio: 8.5,
    dividend_yield: 0.45,
    market_cap: 142000000000, // 1420億円
    roe: 15.2,
    market_sentiment: "positive",
    impact_score: 8,
    news_headline: "さくらインターネットのベアメタル型GPUクラウドサービス「高火力 PHY」、Sakana AIのAI開発に採用",
    news_summary: "さくらインターネットが提供する高性能なベアメタル型GPUクラウド「高火力 PHY」が、国内最注目のAIスタートアップ「Sakana AI」の研究開発インフラとして正式採用。国産の安全なAI開発基盤としての役割が一段と強化されることが期待されています。",
    news_url: "https://example.com/news/3778-1",
    disclosure_summary: "GPUリソース調達の拡充と政府補助金の交付状況について適時開示。",
    disclosure_url: "https://example.com/tdnet/3778-1"
  },
  {
    id: 2,
    ticker_symbol: "6702",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 3282,
    price_change_pct: 0.37,
    per_ratio: 18.2,
    pbr_ratio: 1.6,
    dividend_yield: 1.82,
    market_cap: 6420000000000, // 6.42兆円
    roe: 9.8,
    market_sentiment: "positive",
    impact_score: 8,
    news_headline: "富士通がファナックなどとフィジカルAIで提携、NVIDIA協力",
    news_summary: "富士通は、産業用ロボット大手のファナックおよびNVIDIAと協力し、工場内の生産ラインを自律的に最適化する「フィジカルAI」の共同開発を開始。エッジ領域での生成AI応用において主導権を握る構えです。",
    news_url: "https://example.com/news/6702-1",
    disclosure_summary: "ファナック株式会社との資本・業務提携の進捗について。",
    disclosure_url: "https://example.com/tdnet/6702-1"
  },
  {
    id: 3,
    ticker_symbol: "6701",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 4372,
    price_change_pct: -2.39,
    per_ratio: 22.1,
    pbr_ratio: 1.9,
    dividend_yield: 1.55,
    market_cap: 3980000000000, // 3.98兆円
    roe: 8.5,
    market_sentiment: "positive",
    impact_score: 7,
    news_headline: "独自AIで不要な被写体を自動除去し高精細3Dモデルを高速生成する技術を開発",
    news_summary: "NEC（日本電気）は独自の軽量生成AI技術を応用し、撮影動画から障害物や歩行者を自動で除去しながら、都市や建築物の高精細な3Dモデルをリアルタイムで生成するシステムを発表。スマートシティや自動運転地図への応用が加速します。",
    news_url: "https://example.com/news/6701-1",
    disclosure_summary: "研究開発成果の商業化ロードマップについて公開。",
    disclosure_url: "https://example.com/tdnet/6701-1"
  },
  {
    id: 4,
    ticker_symbol: "9432",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 154.2,
    price_change_pct: 1.12,
    per_ratio: 11.8,
    pbr_ratio: 1.1,
    dividend_yield: 3.40,
    market_cap: 13800000000000, // 13.8兆円
    roe: 12.3,
    market_sentiment: "neutral",
    impact_score: 6,
    news_headline: "NTTが独自の超低消費電力AIチップ「tsuzumi」連携ロードマップを公開",
    news_summary: "NTTは軽量LLM「tsuzumi」を極限の低電力で駆動させる専用チップの試作に成功。光半導体（IOWN）構想に基づくエッジAIサーバーへの展開を2027年までに本格化させると発表しました。",
    news_url: "https://example.com/news/9432-1"
  },
  {
    id: 5,
    ticker_symbol: "9433",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 4850,
    price_change_pct: 0.45,
    per_ratio: 14.1,
    pbr_ratio: 1.8,
    dividend_yield: 2.95,
    market_cap: 10450000000000,
    roe: 13.1,
    market_sentiment: "neutral",
    impact_score: 5,
    news_headline: "KDDI、AIスタートアップ向けGPUクラウド提供企業へ追加出資",
    news_summary: "KDDIは生成AI開発を支援する国産GPUホスティングプロバイダーへ15億円規模の追加出資を実行。データセンターおよび5G通信回線と組み合わせた法人向けAIパックの拡販に努めます。",
    news_url: "https://example.com/news/9433-1"
  },
  {
    id: 6,
    ticker_symbol: "6857",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 5890,
    price_change_pct: 3.82,
    per_ratio: 35.6,
    pbr_ratio: 5.4,
    dividend_yield: 1.10,
    market_cap: 2240000000000,
    roe: 16.4,
    market_sentiment: "positive",
    impact_score: 9,
    news_headline: "米エヌビディアの最新AIプラットフォーム向け超高速テスターを独占供給へ",
    news_summary: "アドバンテストは、NVIDIAの次世代Blackwellアーキテクチャおよび超高速メモリHBM4に対応した最新ウェーハ検査装置を開発、先行出荷を開始したと発表。AIチップ需要の長期化に伴い受注残が過去最高レベルに達しています。",
    news_url: "https://example.com/news/6857-1"
  },
  {
    id: 7,
    ticker_symbol: "8035",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 24850,
    price_change_pct: 2.15,
    per_ratio: 28.9,
    pbr_ratio: 6.8,
    dividend_yield: 1.50,
    market_cap: 11650000000000,
    roe: 22.0,
    market_sentiment: "positive",
    impact_score: 8,
    news_headline: "最先端2ナノメートル半導体向け受託エッチング装置の受注が急拡大",
    news_summary: "東京エレクトロンは、主要半導体ファウンドリにおける2nmプロセス立ち上げに伴い、極微細ドライエッチング装置および高精度洗浄装置の商談額が計画を大きく超過。下半期の売上高見通しを上方修正しました。",
    news_url: "https://example.com/news/8035-1"
  },
  {
    id: 8,
    ticker_symbol: "4063",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 5620,
    price_change_pct: -0.80,
    per_ratio: 16.5,
    pbr_ratio: 1.7,
    dividend_yield: 2.10,
    market_cap: 11200000000000,
    roe: 11.2,
    market_sentiment: "neutral",
    impact_score: 4,
    news_headline: "次世代シリコンオンインシュレータ(SOI)ウェーハの量産投資計画を認可",
    news_summary: "信越化学工業は、高周波AI通信や車載エッジコンピュータに最適な次世代SOIウェーハの生産ライン増強として120億円の設備投資を閣議決定。素材段階からのAIインフラ囲い込みを狙います。",
    news_url: "https://example.com/news/4063-1"
  },
  {
    id: 9,
    ticker_symbol: "7735",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 11480,
    price_change_pct: 1.45,
    per_ratio: 21.0,
    pbr_ratio: 3.1,
    dividend_yield: 1.65,
    market_cap: 1350000000000,
    roe: 14.8,
    market_sentiment: "neutral",
    impact_score: 5,
    news_headline: "先端半導体パッケージ向け枚葉式洗浄装置の市場シェアが75％に到達",
    news_summary: "SCREENホールディングスは、チップレットやHBM積層などの先端後工程向けの需要が急増している枚葉式洗浄システム「SU-3300」の販売動向を公表。ニッチトップとしての価格決定力が業績を強力に支えています。",
    news_url: "https://example.com/news/7735-1"
  },
  {
    id: 10,
    ticker_symbol: "6501",
    recorded_at: "2026-07-17T07:30:24.696Z",
    current_price: 3840,
    price_change_pct: -1.25,
    per_ratio: 15.4,
    pbr_ratio: 1.4,
    dividend_yield: 2.30,
    market_cap: 3540000000000,
    roe: 9.1,
    market_sentiment: "negative",
    impact_score: 3,
    news_headline: "Lumadaを通じた生成AI支援ソリューションをグローバルで本格展開も、為替悪化が重石",
    news_summary: "日立製作所は、マイクロソフトと提携してグローバル展開している「Lumada 生成AI推進サービス」の商談増加を発表したものの、為替の不透明感やIT基盤更改コストの上昇が嫌気され小幅安となっています。",
    news_url: "https://example.com/news/6501-1"
  }
];

// Generate synthetic intraday price ticks for '2026-07-17' JST.
// 09:00 to 11:30 JST (11 ticks) and 12:30 to 15:00 JST (11 ticks), total 22 ticks.
export const generateMockIntradayPrices = (ticker: string, basePrice: number, changePct: number): JPStockIntradayPrice[] => {
  const result: JPStockIntradayPrice[] = [];
  const times = [
    "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30",
    "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00"
  ];
  
  // Starting price relative to basePrice and changePct
  // endPrice = basePrice
  // startPrice = basePrice / (1 + changePct/100)
  const startPrice = basePrice / (1 + changePct / 100);
  const priceRange = basePrice - startPrice;
  
  // Random seed based on ticker symbol to keep curves deterministic but varied
  const seed = parseInt(ticker) || 42;
  const rand = (i: number) => {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  };

  let currentPrice = startPrice;
  
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    // Progress factor from 0 to 1
    const progress = i / (times.length - 1);
    
    // Add some random noise and trend
    const noise = (rand(i) - 0.48) * (basePrice * 0.008); // up to 0.8% fluctuation
    
    // Smooth interpolator
    const expectedValue = startPrice + (priceRange * progress);
    
    // In the last tick, hit the exact current_price
    if (i === times.length - 1) {
      currentPrice = basePrice;
    } else {
      currentPrice = expectedValue + noise;
    }
    
    // Ensure precision
    const priceRounded = Math.round(currentPrice * 10) / 10;
    
    result.push({
      id: i + 1,
      ticker_symbol: ticker,
      price: priceRounded,
      recorded_at: `2026-07-17T${t}:00.000Z`
    });
  }
  
  return result;
};

// All mock intraday prices combined
export const MOCK_INTRADAY_PRICES: { [ticker: string]: JPStockIntradayPrice[] } = {};
MOCK_INTELLIGENCE.forEach(item => {
  MOCK_INTRADAY_PRICES[item.ticker_symbol] = generateMockIntradayPrices(
    item.ticker_symbol,
    item.current_price,
    item.price_change_pct
  );
});

export const MOCK_HOLIDAYS: JPMarketHoliday[] = [
  { date: "2026-01-01", reason: "元日" },
  { date: "2026-01-02", reason: "取引所取引休業日" },
  { date: "2026-01-03", reason: "取引所取引休業日" },
  { date: "2026-01-12", reason: "成人の日" },
  { date: "2026-02-11", reason: "建国記念の日" },
  { date: "2026-02-23", reason: "天皇誕生日" },
  { date: "2026-03-20", reason: "春分の日" },
  { date: "2026-04-29", reason: "昭和の日" },
  { date: "2026-05-03", reason: "憲法記念日" },
  { date: "2026-05-04", reason: "みどりの日" },
  { date: "2026-05-05", reason: "こどもの日" },
  { date: "2026-07-20", reason: "海の日" }
];

// Helper to assemble dashboard items
export const getMockDashboardItems = (): StockDashboardItem[] => {
  return MOCK_TICKERS.map(ticker => {
    const intel = MOCK_INTELLIGENCE.find(i => i.ticker_symbol === ticker.ticker_symbol);
    return {
      ticker_symbol: ticker.ticker_symbol,
      company_name: ticker.company_name,
      sector_category: ticker.sector_category,
      theme_tags: ticker.theme_tags,
      exposure_score: ticker.exposure_score,
      rank: ticker.rank,
      is_active: ticker.is_active,
      
      current_price: intel?.current_price ?? 0,
      price_change_pct: intel?.price_change_pct ?? 0,
      per_ratio: intel?.per_ratio,
      pbr_ratio: intel?.pbr_ratio,
      dividend_yield: intel?.dividend_yield,
      market_cap: intel?.market_cap,
      roe: intel?.roe,
      market_sentiment: intel?.market_sentiment ?? "neutral",
      impact_score: intel?.impact_score ?? 5,
      news_headline: intel?.news_headline,
      news_summary: intel?.news_summary,
      news_url: intel?.news_url,
      disclosure_headline: "適時開示情報",
      disclosure_summary: intel?.disclosure_summary,
      disclosure_url: intel?.disclosure_url,
      recorded_at: intel?.recorded_at
    };
  });
};
