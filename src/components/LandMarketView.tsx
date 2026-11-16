import React, { useState } from 'react';
import { MapPin, ShieldCheck, TrendingUp, AlertCircle, Building, CheckCircle, ArrowRight } from 'lucide-react';
import { GameState, GameLocation } from '../types';
import { UGANDA_LOCATIONS, formatUGX } from '../data/UgandaConfig';
import { FinanceManager } from '../engine/FinanceManager';

interface LandMarketViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const LandMarketView: React.FC<LandMarketViewProps> = ({ gameState, setGameState }) => {
  const [selectedLocation, setSelectedLocation] = useState<GameLocation>(UGANDA_LOCATIONS[0]);
  const [selectedTenure, setSelectedTenure] = useState<'Mailo' | 'Freehold' | 'Leasehold' | 'Customary'>('Mailo');
  const [decimalSize, setDecimalSize] = useState<number>(10); // 10 decimals
  const [notification, setNotification] = useState<{ message: string; success: boolean } | null>(null);

  const totalCostUGX = selectedLocation.avgLandPricePerDecimalUGX * decimalSize;

  const handleAcquireLand = () => {
    // Check cash via FinanceManager
    const res = FinanceManager.recordTransaction(
      gameState.cashUGX,
      gameState.transactions,
      'CAPITAL',
      `Land Acquisition: ${decimalSize} Decimals in ${selectedLocation.name} (${selectedTenure} Tenure)`,
      -totalCostUGX,
      selectedLocation.id
    );

    if (!res.success) {
      setNotification({ message: res.error || 'Transaction rejected.', success: false });
      return;
    }

    const newProperty = {
      id: 'prop_' + Date.now(),
      title: `${selectedLocation.name} Plot (${decimalSize} Decimals)`,
      locationId: selectedLocation.id,
      tenureType: selectedTenure,
      sizeDecimals: decimalSize,
      purchasePriceUGX: totalCostUGX,
      currentValuationUGX: totalCostUGX,
      purchaseDateStr: `${gameState.date.year}-${String(gameState.date.month).padStart(2, '0')}-${String(gameState.date.day).padStart(2, '0')}`,
      status: 'Raw Land' as const,
      monthlyRentalIncomeUGX: 0,
      occupancyRate: 0,
    };

    setGameState((prev) => ({
      ...prev,
      cashUGX: res.newCash,
      transactions: res.newTransactions,
      properties: [newProperty, ...prev.properties],
    }));

    setNotification({
      message: `Successfully acquired ${decimalSize} decimals in ${selectedLocation.name} for ${formatUGX(totalCostUGX)}!`,
      success: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Uganda Land & Property Market</h2>
        <p className="text-sm text-slate-400">
          Conduct due diligence, review land tenure systems (Mailo, Freehold, Leasehold), and acquire prime parcels across Uganda.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${notification.success ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/50 border-rose-500/30 text-rose-300'}`}>
          {notification.success ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Location Selector List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 max-h-[600px] overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 pb-2">Ugandan Districts & Cities</h3>
          {UGANDA_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className={`w-full text-left p-3 rounded-lg transition-all space-y-1 ${
                selectedLocation.id === loc.id
                  ? 'bg-emerald-600/20 border border-emerald-500/40 text-white'
                  : 'bg-slate-950/50 border border-slate-800/60 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{loc.name}</span>
                <span className="text-emerald-400 font-mono">{(loc.appreciationRateAnnual * 100).toFixed(0)}% p.a.</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>{loc.region}</span>
                <span className="font-mono text-slate-300">{formatUGX(loc.avgLandPricePerDecimalUGX)} / dec.</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right 2 Cols: Selected Location Details & Acquisition Modal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{selectedLocation.region}</span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">{selectedLocation.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedLocation.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block">Avg. Price / Decimal</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{formatUGX(selectedLocation.avgLandPricePerDecimalUGX)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                <span className="text-xs text-slate-400">Population Density</span>
                <div className="text-sm font-semibold text-white">{selectedLocation.populationDensity}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                <span className="text-xs text-slate-400">Rental Demand Index</span>
                <div className="text-sm font-semibold font-mono text-emerald-400">{selectedLocation.rentalDemandIndex}x multiplier</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                <span className="text-xs text-slate-400">Due Diligence Risk</span>
                <div className={`text-sm font-semibold ${selectedLocation.riskFactor === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedLocation.riskFactor} Risk
                </div>
              </div>
            </div>

            {/* Acquisition Form */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <h4 className="text-sm font-bold text-white">Land Acquisition & Due Diligence</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Land Tenure System</label>
                  <select
                    value={selectedTenure}
                    onChange={(e) => setSelectedTenure(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Mailo">Mailo Land (Central Region standard)</option>
                    <option value="Freehold">Freehold Land (Absolute ownership)</option>
                    <option value="Leasehold">Leasehold Land (Govt/Kabaka lease)</option>
                    <option value="Customary">Customary Tenure</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Parcel Size (Decimals)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={decimalSize}
                    onChange={(e) => setDecimalSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Total Estimated Acquisition Cost</span>
                  <span className="text-xl font-bold font-mono text-white">{formatUGX(totalCostUGX)}</span>
                  <p className="text-xs text-slate-500 mt-0.5">Includes Ministry of Lands search & survey fees.</p>
                </div>

                <button
                  onClick={handleAcquireLand}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  Acquire Land Parcel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
