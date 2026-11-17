import React from 'react';
import { Building2, Calendar, Play, RotateCw, CheckCircle2, FileText, Settings, ShieldCheck } from 'lucide-react';
import { GameState } from '../types';
import { SimulationClock } from '../engine/SimulationClock';
import { formatUGX } from '../data/UgandaConfig';

interface HeaderProps {
  gameState: GameState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAdvanceMonth: () => void;
  onOpenTests: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  activeTab,
  setActiveTab,
  onAdvanceMonth,
  onOpenTests,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight whitespace-nowrap">
              REAL ESTATE EMPIRE <span className="text-emerald-400 font-semibold">— AFRICA</span>
            </h1>
            <p className="text-xs text-slate-400 whitespace-nowrap">Uganda Market Prototype · Godot 4 Engine</p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 text-sm font-medium text-slate-300 overflow-x-auto py-1 scrollbar-none max-w-full">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'market', label: 'Land Market' },
            { id: 'properties', label: 'Properties' },
            { id: 'construction', label: 'Construction' },
            { id: 'tenants', label: 'Tenants & Leases' },
            { id: 'finance', label: 'Finance' },
            { id: 'economy', label: 'Macro Economy' },
            { id: 'education', label: 'Academy' },
            { id: 'engine', label: 'Godot' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Quick Status */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono">{SimulationClock.formatDate(gameState.date)}</span>
            </div>
            <div className="w-px h-3.5 bg-slate-800" />
            <div className="text-xs font-mono font-semibold text-emerald-400">
              {formatUGX(gameState.cashUGX)}
            </div>
          </div>

          <button
            onClick={onAdvanceMonth}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Advance Month</span>
          </button>

          <button
            onClick={onOpenTests}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            title="Run Automated Test Suite"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Tests</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            title="Settings & Save"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
