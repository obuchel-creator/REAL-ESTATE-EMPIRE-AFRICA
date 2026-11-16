import React from 'react';
import { Building2, Wallet, TrendingUp, ShieldAlert, Award, MapPin, ArrowUpRight, ArrowRight, Activity } from 'lucide-react';
import { GameState } from '../types';
import { formatUGX, UGANDA_LOCATIONS } from '../data/UgandaConfig';
import { FinanceManager } from '../engine/FinanceManager';
import { SimulationClock } from '../engine/SimulationClock';
import { MarketNews } from './MarketNews';

interface DashboardViewProps {
  gameState: GameState;
  setActiveTab: (tab: string) => void;
  onAdvanceMonth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ gameState, setActiveTab, onAdvanceMonth }) => {
  const currentLocation = UGANDA_LOCATIONS.find((l) => l.id === gameState.currentLocationId) || UGANDA_LOCATIONS[0];
  const totalAssets = FinanceManager.calculateTotalAssets(gameState.properties, gameState.cashUGX);
  const netWorth = FinanceManager.calculateNetWorth(totalAssets, gameState.liabilitiesUGX);

  return (
    <div className="space-y-6">
      {/* Welcome & Executive Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <span>{currentLocation.region}</span>
            <span>·</span>
            <span>{currentLocation.name}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Welcome back, {gameState.player.name}
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Managing <span className="text-slate-200 font-medium">{gameState.player.companyName}</span> in Uganda. Build your portfolio through strategic land acquisition and sustainable property development.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('market')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>Explore Land Market</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Available Cash</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatUGX(gameState.cashUGX)}
          </div>
          <p className="text-xs text-slate-500">Liquid UGX capital reserves</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Assets</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatUGX(totalAssets)}
          </div>
          <p className="text-xs text-slate-500">{gameState.properties.length} properties registered</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Net Worth</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {formatUGX(netWorth)}
          </div>
          <p className="text-xs text-slate-500">Assets minus liabilities</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Business Title</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white truncate">
            {gameState.player.businessTitle}
          </div>
          <p className="text-xs text-slate-500">Level {gameState.player.businessLevel} Enterprise</p>
        </div>
      </div>

      {/* Two Column Section: Market Highlights & Recent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Uganda Market Spotlight */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Uganda Regional Real Estate Overview</h3>
              <p className="text-xs text-slate-400">Current market climate in {currentLocation.name}</p>
            </div>
            <button
              onClick={() => setActiveTab('market')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View all regions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="text-xs text-slate-400">Avg. Land Price (Per Decimal)</span>
              <div className="text-lg font-bold font-mono text-white">
                {formatUGX(currentLocation.avgLandPricePerDecimalUGX)}
              </div>
              <p className="text-xs text-slate-500">{currentLocation.description}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Rental Demand Index</span>
                <span className="font-mono text-emerald-400">{currentLocation.rentalDemandIndex}x</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Annual Appreciation</span>
                <span className="font-mono text-emerald-400">{(currentLocation.appreciationRateAnnual * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Investment Risk</span>
                <span className={`font-medium ${currentLocation.riskFactor === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentLocation.riskFactor} Risk
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Simulation Date: <strong className="text-slate-200 font-mono">{SimulationClock.formatDate(gameState.date)}</strong></span>
            <span>Macro Inflation: <strong className="text-slate-200 font-mono">{(gameState.macroEconomy.inflationRate * 100).toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Right Col: Recent Transactions Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Financial Activity</h3>
            <button
              onClick={() => setActiveTab('finance')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              Full Ledger
            </button>
          </div>

          <div className="space-y-3">
            {gameState.transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">{tx.dateStr}</span>
                  <span className={`font-mono font-semibold ${tx.amountUGX >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amountUGX >= 0 ? '+' : ''}{formatUGX(tx.amountUGX)}
                  </span>
                </div>
                <p className="text-xs text-slate-200 truncate">{tx.description}</p>
              </div>
            ))}
            {gameState.transactions.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No financial transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market News Component */}
      <MarketNews gameState={gameState} />
    </div>
  );
};
