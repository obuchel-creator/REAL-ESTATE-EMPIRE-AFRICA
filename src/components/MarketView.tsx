import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  ShieldCheck,
  DollarSign,
  MapPin,
  Building,
  Percent,
  Layers,
  Newspaper,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import { GameState } from '../types';
import { UGANDA_LOCATIONS, formatUGX } from '../data/UgandaConfig';
import { UGANDA_MARKET_NEWS_POOL } from '../data/MarketNewsData';

interface MarketViewProps {
  gameState: GameState;
}

export const MarketView: React.FC<MarketViewProps> = ({ gameState }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredNews =
    selectedCategory === 'ALL'
      ? UGANDA_MARKET_NEWS_POOL
      : UGANDA_MARKET_NEWS_POOL.filter((item) => item.category.toUpperCase() === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Ugandan Macroeconomic Intelligence & Market Climate
        </h2>
        <p className="text-sm text-slate-400">
          Bank of Uganda monetary indicators, regional property market yield matrices, and economic bulletins shaping real estate valuations across Kampala, Wakiso, Mukono, and Entebbe.
        </p>
      </div>

      {/* Macro Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Inflation Rate (CPI)</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(gameState.macroEconomy.inflationRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500">Bank of Uganda target band (5.0%)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Prime Lending Rate</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {(gameState.macroEconomy.primeLendingRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500">Commercial mortgage baseline rate</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">GDP Expansion</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(gameState.macroEconomy.gdpGrowthRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500">Annual national economic growth</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Construction Cost Index</span>
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {gameState.macroEconomy.constructionMaterialIndex.toFixed(1)}
          </div>
          <p className="text-xs text-slate-500">Cement & structural steel index</p>
        </div>
      </div>

      {/* Regional Investment Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Uganda Regional Real Estate Yield & Valuation Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">9 Core Investment Zones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Location / Zone</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3 font-mono">Avg Price / Decimal</th>
                <th className="py-3 px-3 font-mono">Rental Demand</th>
                <th className="py-3 px-3 font-mono">Appreciation</th>
                <th className="py-3 px-3">Default Tenure</th>
                <th className="py-3 px-3 font-mono">Max LTV</th>
                <th className="py-3 px-3">Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {UGANDA_LOCATIONS.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-950/60 transition-colors">
                  <td className="py-3 px-3 font-sans font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{loc.name}</span>
                      <span className="text-slate-500 font-normal">({loc.region})</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        loc.zoneTier === 'PRIME'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : loc.zoneTier === 'RESIDENTIAL'
                          ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {loc.zoneTier}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-200">{formatUGX(loc.avgLandPricePerDecimalUGX)}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{loc.rentalDemandIndex.toFixed(1)}x</td>
                  <td className="py-3 px-3 text-emerald-400">+{(loc.appreciationRateAnnual * 100).toFixed(0)}% / yr</td>
                  <td className="py-3 px-3 font-sans text-slate-300">{loc.defaultTenure}</td>
                  <td className="py-3 px-3 text-slate-300 font-bold">{(loc.maxLtvRatio * 100).toFixed(0)}%</td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`text-[11px] font-semibold ${
                        loc.riskFactor === 'Low' ? 'text-emerald-400' : loc.riskFactor === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {loc.riskFactor}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market News & Bulletins */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Uganda Real Estate Intelligence Bulletins</h3>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'MACRO', 'INFRASTRUCTURE', 'ZONING', 'TAXATION', 'DEMAND'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((news) => (
            <div
              key={news.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                    {news.category}
                  </span>
                  <span className="text-slate-400">{news.locationName}</span>
                </div>
                <span
                  className={`font-semibold ${
                    news.impact === 'Bullish'
                      ? 'text-emerald-400'
                      : news.impact === 'Bearish'
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {news.impact}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white tracking-tight leading-snug">{news.headline}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{news.summary}</p>

              <div className="text-[10px] text-slate-500 font-mono pt-1">{news.dateStr}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
