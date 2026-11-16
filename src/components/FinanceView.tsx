import React from 'react';
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { GameState } from '../types';
import { formatUGX } from '../data/UgandaConfig';
import { FinanceManager } from '../engine/FinanceManager';

interface FinanceViewProps {
  gameState: GameState;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ gameState }) => {
  const totalAssets = FinanceManager.calculateTotalAssets(gameState.properties, gameState.cashUGX);
  const netWorth = FinanceManager.calculateNetWorth(totalAssets, gameState.liabilitiesUGX);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Financial Ledger & Balance Sheet</h2>
        <p className="text-sm text-slate-400">
          All financial transactions are denominated in Ugandan Shillings (UGX) using strict integer accounting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Assets</span>
          <div className="text-2xl font-bold font-mono text-white">{formatUGX(totalAssets)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Liabilities</span>
          <div className="text-2xl font-bold font-mono text-rose-400">{formatUGX(gameState.liabilitiesUGX)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Net Worth</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{formatUGX(netWorth)}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Transaction History Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount (UGX)</th>
                <th className="py-3 px-4 text-right">New Balance (UGX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {gameState.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400">{tx.dateStr}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans text-[11px] font-medium">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-sans">{tx.description}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${tx.amountUGX >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amountUGX >= 0 ? '+' : ''}{formatUGX(tx.amountUGX)}
                  </td>
                  <td className="py-3 px-4 text-right text-white">{formatUGX(tx.newBalanceUGX)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
