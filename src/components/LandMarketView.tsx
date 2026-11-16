import React, { useState } from 'react';
import { MapPin, ShieldCheck, TrendingUp, AlertCircle, Building, CheckCircle, ArrowRight, ShieldAlert, FileText, Lock } from 'lucide-react';
import { GameState, GameLocation, TenureType, ZoneTier } from '../types';
import { UGANDA_LOCATIONS, formatUGX } from '../data/UgandaConfig';
import { FinanceManager } from '../engine/FinanceManager';

interface LandMarketViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const LandMarketView: React.FC<LandMarketViewProps> = ({ gameState, setGameState }) => {
  const [selectedLocation, setSelectedLocation] = useState<GameLocation>(UGANDA_LOCATIONS[0]);
  const [tenureFilter, setTenureFilter] = useState<'ALL' | TenureType>('ALL');
  const [zoneFilter, setZoneFilter] = useState<'ALL' | ZoneTier>('ALL');
  const [decimalSize, setDecimalSize] = useState<number>(10); // 10 decimals
  const [notification, setNotification] = useState<{ message: string; success: boolean } | null>(null);

  const filteredLocations = UGANDA_LOCATIONS.filter((loc) => {
    if (tenureFilter !== 'ALL' && loc.defaultTenure !== tenureFilter) return false;
    if (zoneFilter !== 'ALL' && loc.zoneTier !== zoneFilter) return false;
    return true;
  });

  const totalCostUGX = selectedLocation.avgLandPricePerDecimalUGX * decimalSize;

  const handleAcquireLand = () => {
    let resultNotification: { message: string; success: boolean } = { message: '', success: false };

    setGameState((prev) => {
      const cost = selectedLocation.avgLandPricePerDecimalUGX * decimalSize;
      if (decimalSize <= 0 || !Number.isFinite(decimalSize)) {
        resultNotification = { message: 'Invalid parcel size specified.', success: false };
        return prev;
      }

      const res = FinanceManager.recordTransaction(
        prev.cashUGX,
        prev.transactions,
        'CAPITAL',
        `Land Acquisition: ${decimalSize} Decimals in ${selectedLocation.name} (${selectedLocation.defaultTenure} Tenure)`,
        -cost,
        selectedLocation.id
      );

      if (!res.success) {
        resultNotification = { message: res.error || 'Transaction rejected.', success: false };
        return prev;
      }

      const kibanjaCost = (selectedLocation.kibanjaClearanceCostPerDecimalUGX || 0) * decimalSize;

      const newProperty = {
        id: 'prop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: `${selectedLocation.name} Plot (${decimalSize} Decimals)`,
        locationId: selectedLocation.id,
        tenureType: selectedLocation.defaultTenure,
        zoneTier: selectedLocation.zoneTier,
        sizeDecimals: decimalSize,
        purchasePriceUGX: cost,
        currentValuationUGX: cost,
        purchaseDateStr: `${prev.date.year}-${String(prev.date.month).padStart(2, '0')}-${String(prev.date.day).padStart(2, '0')}`,
        status: 'Raw Land' as const,
        monthlyRentalIncomeUGX: 0,
        occupancyRate: 0,
        titleVerified: false,
        kibanjaCleared: selectedLocation.defaultTenure !== 'MAILO',
        kibanjaClearanceCostUGX: kibanjaCost,
        leaseYearsRemaining: selectedLocation.leaseYearsRemaining,
        maxLtvRatio: selectedLocation.maxLtvRatio,
      };

      resultNotification = {
        message: `Successfully acquired ${decimalSize} decimals in ${selectedLocation.name} for ${formatUGX(cost)}!`,
        success: true,
      };

      return {
        ...prev,
        cashUGX: res.newCash,
        transactions: res.newTransactions,
        properties: [newProperty, ...prev.properties],
      };
    });

    setNotification(resultNotification);
  };

  const handleClearKibanja = (propertyId: string, clearanceCost: number) => {
    let msg = '';
    let success = false;

    setGameState((prev) => {
      const prop = prev.properties.find((p) => p.id === propertyId);
      if (!prop || prop.kibanjaCleared) {
        msg = 'Property already cleared or not found.';
        return prev;
      }

      const res = FinanceManager.recordTransaction(
        prev.cashUGX,
        prev.transactions,
        'EXPENSE',
        `Kibanja Occupant Compensation & Clearance: ${prop.title}`,
        -clearanceCost,
        propertyId
      );

      if (!res.success) {
        msg = res.error || 'Insufficient funds to clear Kibanja.';
        return prev;
      }

      success = true;
      msg = `Successfully compensated and cleared Kibanja occupants for ${formatUGX(clearanceCost)}!`;

      const updatedProperties = prev.properties.map((p) =>
        p.id === propertyId ? { ...p, kibanjaCleared: true, maxLtvRatio: Math.min(0.65, p.maxLtvRatio + 0.20) } : p
      );

      return {
        ...prev,
        cashUGX: res.newCash,
        transactions: res.newTransactions,
        properties: updatedProperties,
      };
    });

    setNotification({ message: msg, success });
  };

  const handleVerifyTitle = (propertyId: string) => {
    const verifyCost = 1500000; // UGX 1.5M Ministry of Lands search & verification fee
    let msg = '';
    let success = false;

    setGameState((prev) => {
      const prop = prev.properties.find((p) => p.id === propertyId);
      if (!prop || prop.titleVerified) {
        msg = 'Title already verified or not found.';
        return prev;
      }

      const res = FinanceManager.recordTransaction(
        prev.cashUGX,
        prev.transactions,
        'EXPENSE',
        `Ministry of Lands Title Search & Verification: ${prop.title}`,
        -verifyCost,
        propertyId
      );

      if (!res.success) {
        msg = res.error || 'Insufficient funds for title verification.';
        return prev;
      }

      success = true;
      msg = `Successfully verified title at Ministry of Lands for ${formatUGX(verifyCost)}! Bank LTV eligibility improved.`;

      const updatedProperties = prev.properties.map((p) =>
        p.id === propertyId ? { ...p, titleVerified: true, maxLtvRatio: Math.min(0.80, p.maxLtvRatio + 0.15) } : p
      );

      return {
        ...prev,
        cashUGX: res.newCash,
        transactions: res.newTransactions,
        properties: updatedProperties,
      };
    });

    setNotification({ message: msg, success });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Uganda Land Tenure & Valuation System</h2>
            <p className="text-sm text-slate-400">
              Filter listings by tenure (Freehold, Mailo, Leasehold) and zone tiers. Inspect legal risks and bank LTV ratios.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-2 font-medium">Tenure:</span>
              {(['ALL', 'FREEHOLD', 'MAILO', 'LEASEHOLD'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTenureFilter(t)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${tenureFilter === t ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-2 font-medium">Zone:</span>
              {(['ALL', 'PRIME', 'RESIDENTIAL', 'EMERGING'] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setZoneFilter(z)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${zoneFilter === z ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>
        </div>
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
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 pb-2">
            Available Listings ({filteredLocations.length})
          </h3>
          {filteredLocations.map((loc) => (
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
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-semibold">{loc.zoneTier}</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Tenure: <strong className="text-slate-200">{loc.defaultTenure}</strong></span>
                <span className="font-mono text-emerald-400">{formatUGX(loc.avgLandPricePerDecimalUGX)} / dec.</span>
              </div>
            </button>
          ))}
          {filteredLocations.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">No locations match the selected filters.</div>
          )}
        </div>

        {/* Right 2 Cols: Selected Location Details & Acquisition Modal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{selectedLocation.region}</span>
                  <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 rounded text-[10px] text-emerald-300 font-semibold">
                    {selectedLocation.zoneTier} ZONE
                  </span>
                </div>
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
                <span className="text-xs text-slate-400">Land Tenure System</span>
                <div className="text-sm font-bold text-white">{selectedLocation.defaultTenure}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                <span className="text-xs text-slate-400">Bank LTV Eligibility</span>
                <div className="text-sm font-bold font-mono text-emerald-400">{(selectedLocation.maxLtvRatio * 100).toFixed(0)}% LTV Limit</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                <span className="text-xs text-slate-400">Legal & Title Risk</span>
                <div className={`text-sm font-semibold ${selectedLocation.riskFactor === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedLocation.riskFactor} Risk ({selectedLocation.defaultTenure === 'MAILO' ? 'Requires Kibanja Clearance' : 'Standard Title'})
                </div>
              </div>
            </div>

            {/* Acquisition Form */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <h4 className="text-sm font-bold text-white">Land Acquisition & Due Diligence</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Tenure & Compliance Details</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300">
                    {selectedLocation.defaultTenure === 'MAILO' && `Kibanja Clearance Fee: ${formatUGX((selectedLocation.kibanjaClearanceCostPerDecimalUGX || 0) * decimalSize)}`}
                    {selectedLocation.defaultTenure === 'LEASEHOLD' && `Lease Remaining: ${selectedLocation.leaseYearsRemaining} Years`}
                    {selectedLocation.defaultTenure === 'FREEHOLD' && 'Absolute Perpetual Ownership'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Total Acquisition Cost</span>
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

          {/* Owned Properties Management: Title Verification & Kibanja Clearance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Owned Properties · Legal & Title Management</h3>
            {gameState.properties.length === 0 ? (
              <p className="text-xs text-slate-500">No properties owned yet. Acquire land above to manage titles and Kibanja occupants.</p>
            ) : (
              <div className="space-y-3">
                {gameState.properties.map((prop) => (
                  <div key={prop.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{prop.title}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                          {prop.tenureType}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>Size: <strong className="text-slate-200 font-mono">{prop.sizeDecimals} Decimals</strong></span>
                        <span>LTV: <strong className="text-emerald-400 font-mono">{(prop.maxLtvRatio * 100).toFixed(0)}%</strong></span>
                        <span>Title: <strong className={prop.titleVerified ? 'text-emerald-400' : 'text-amber-400'}>{prop.titleVerified ? 'Verified' : 'Unverified'}</strong></span>
                        {prop.tenureType === 'MAILO' && (
                          <span>Kibanja: <strong className={prop.kibanjaCleared ? 'text-emerald-400' : 'text-amber-400'}>{prop.kibanjaCleared ? 'Cleared' : 'Pending Clearance'}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!prop.titleVerified && (
                        <button
                          onClick={() => handleVerifyTitle(prop.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Verify Title (UGX 1.5M)
                        </button>
                      )}
                      {prop.tenureType === 'MAILO' && !prop.kibanjaCleared && (
                        <button
                          onClick={() => handleClearKibanja(prop.id, prop.kibanjaClearanceCostUGX)}
                          className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Clear Kibanja ({formatUGX(prop.kibanjaClearanceCostUGX)})
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
