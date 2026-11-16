import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GameState } from '../types';
import { getRandomMarketNews, MarketNewsItem } from '../data/MarketNewsData';

interface MarketNewsProps {
  gameState: GameState;
}

export const MarketNews: React.FC<MarketNewsProps> = ({ gameState }) => {
  const [newsItems, setNewsItems] = useState<MarketNewsItem[]>(() => getRandomMarketNews(4));

  // Update news automatically when the game month/days elapsed changes
  useEffect(() => {
    setNewsItems(getRandomMarketNews(4));
  }, [gameState.date.totalDaysElapsed]);

  const handleRefreshNews = () => {
    setNewsItems(getRandomMarketNews(4));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Uganda Real Estate Market News</h3>
            <p className="text-xs text-slate-400">Simulated intelligence updates for {gameState.date.year}</p>
          </div>
        </div>

        <button
          onClick={handleRefreshNews}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700"
          title="Refresh Market Wire"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Wire</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsItems.map((news) => (
          <div
            key={news.id}
            className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">{news.category} · {news.locationName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                    news.impact === 'Bullish'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : news.impact === 'Bearish'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {news.impact === 'Bullish' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                  {news.impact === 'Bearish' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                  {news.impact === 'Neutral' && <Minus className="w-3 h-3 text-slate-400" />}
                  <span>{news.impact}</span>
                </span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">{news.headline}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{news.summary}</p>
            </div>

            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
              <span>Kampala Property Wire</span>
              <span className="font-mono">{news.dateStr}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
