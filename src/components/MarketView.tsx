import React from 'react';
import { TrendingUp, BarChart3, ShieldCheck, DollarSign } from 'lucide-react';
import { GameState } from '../types';

interface MarketViewProps {
  gameState: GameState;
}

export const MarketView: React.FC<MarketViewProps> = ({ gameState }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Ugandan Macroeconomic Indicators</h2>
        <p className="text-sm text-slate-400">
          Bank of Uganda monetary policy, inflation rates, prime lending rates, and construction cost indices influencing real estate valuation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Inflation Rate (CPI)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(gameState.macroEconomy.inflationRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500">Bank of Uganda target band (5.0%)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Prime Lending Rate</span>
          <div className="text-2xl font-bold font-mono text-white">
            {(gameState.macroEconomy.primeLendingRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500">Commercial bank average</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">GDP Growth Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(gameState.macroEconomy.gdpGrowthRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500">National annual expansion</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Construction Index</span>
          <div className="text-2xl font-bold font-mono text-white">
            {gameState.macroEconomy.constructionMaterialIndex.toFixed(1)}
          </div>
          <p className="text-xs text-slate-500">Base year 2026 = 100.0</p>
        </div>
      </div>
    </div>
  );
};
