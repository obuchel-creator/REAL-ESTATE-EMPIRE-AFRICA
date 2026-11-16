export interface MarketNewsItem {
  id: string;
  headline: string;
  summary: string;
  category: 'Macro' | 'Zoning' | 'Infrastructure' | 'Taxation' | 'Demand';
  impact: 'Bullish' | 'Neutral' | 'Bearish';
  locationName: string;
  dateStr: string;
}

export const UGANDA_MARKET_NEWS_POOL: MarketNewsItem[] = [
  {
    id: 'news_1',
    headline: 'Bank of Uganda Adjusts Central Bank Rate; Commercial Mortgages Stablize at 17.5%',
    summary: 'Real estate developers and mortgage applicants can expect steady financing costs following the latest Monetary Policy Committee review.',
    category: 'Macro',
    impact: 'Neutral',
    locationName: 'Kampala',
    dateStr: 'January 2026',
  },
  {
    id: 'news_2',
    headline: 'Wakiso District Land Board Digitizes Title Verification to Curb Mailo Land Fraud',
    summary: 'New digital cadastral mapping in Wakiso significantly speeds up due diligence for land buyers and reduces title verification disputes.',
    category: 'Zoning',
    impact: 'Bullish',
    locationName: 'Wakiso',
    dateStr: 'January 2026',
  },
  {
    id: 'news_3',
    headline: 'Kampala Flyover Project Phase 2 Sparks Commercial Land Demand Along Entebbe Road',
    summary: 'Commercial plot valuations near the Mukwano and Clock Tower corridors experience upward pressure as infrastructure progress accelerates.',
    category: 'Infrastructure',
    impact: 'Bullish',
    locationName: 'Kampala',
    dateStr: 'January 2026',
  },
  {
    id: 'news_4',
    headline: 'Uganda Revenue Authority (URA) Issues New Rental Income Tax Compliance Guidelines',
    summary: 'Landlords operating commercial and multi-family residential units are reminded to file digital rental tax returns on a quarterly basis.',
    category: 'Taxation',
    impact: 'Bearish',
    locationName: 'National',
    dateStr: 'January 2026',
  },
  {
    id: 'news_5',
    headline: 'Student Hostel Demand Surges in Mukono as Universities Expand Enrollment',
    summary: 'Investors eyeing high-yield student housing near Bishop Tucker and Uganda Christian University report 98% pre-leasing occupancy rates.',
    category: 'Demand',
    impact: 'Bullish',
    locationName: 'Mukono',
    dateStr: 'January 2026',
  },
  {
    id: 'news_6',
    headline: 'Entebbe Expressway Exceeds Traffic Projections; Peninsula Residential Plots Gain Premium',
    summary: 'Expatriates and diaspora investors drive demand for lakeside gated plots in Entebbe, citing improved transit times to Kampala.',
    category: 'Infrastructure',
    impact: 'Bullish',
    locationName: 'Entebbe',
    dateStr: 'January 2026',
  },
  {
    id: 'news_7',
    headline: 'Cement and Steel Prices Ease Following Local Manufacturing Output Expansion',
    summary: 'Construction material index registers a slight dip, lowering initial capital expenditure for developers breaking ground this quarter.',
    category: 'Macro',
    impact: 'Bullish',
    locationName: 'National',
    dateStr: 'January 2026',
  },
];

export function getRandomMarketNews(count: number = 4): MarketNewsItem[] {
  const shuffled = [...UGANDA_MARKET_NEWS_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
