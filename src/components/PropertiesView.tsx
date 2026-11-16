import React from 'react';
import { Building2, MapPin, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { GameState } from '../types';
import { formatUGX, UGANDA_LOCATIONS } from '../data/UgandaConfig';

interface PropertiesViewProps {
  gameState: GameState;
  setActiveTab: (tab: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({ gameState, setActiveTab }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">My Real Estate Portfolio</h2>
          <p className="text-sm text-slate-400">
            {gameState.properties.length} land parcels and developments under your ownership in Uganda.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('market')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2"
        >
          <span>Acquire More Land</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {gameState.properties.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-white">No properties owned yet</h3>
            <p className="text-xs text-slate-400">
              You haven't acquired any land parcels yet. Visit the Land Market to purchase your first plot in Kampala, Wakiso, or Entebbe.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('market')}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Explore Land Market
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameState.properties.map((prop) => {
            const loc = UGANDA_LOCATIONS.find((l) => l.id === prop.locationId);
            return (
              <div key={prop.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-emerald-400">{loc?.name || prop.locationId}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{prop.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded text-xs font-medium text-emerald-300">
                    {prop.status}
                  </span>
                </div>

                <div className="space-y-2 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Tenure Type</span>
                    <span className="text-white font-medium">{prop.tenureType}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Parcel Size</span>
                    <span className="text-white font-mono">{prop.sizeDecimals} Decimals</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Purchase Date</span>
                    <span className="text-white font-mono">{prop.purchaseDateStr}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                    <span>Current Valuation</span>
                    <span className="text-emerald-400 font-mono font-bold">{formatUGX(prop.currentValuationUGX)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
