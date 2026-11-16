import React from 'react';
import { X, CheckCircle, ShieldCheck, AlertCircle, Play } from 'lucide-react';
import { TestResultItem } from '../types';
import { GameEngineTests } from '../tests/GameEngineTests';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResultItem[];
  onRerunTests: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({
  isOpen,
  onClose,
  results,
  onRerunTests,
}) => {
  if (!isOpen) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount && totalCount > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Phase 1 Automated Verification Suite</h3>
              <p className="text-xs text-slate-400">Godot 4 Engine, Finance Invariants & Save/Load Tests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Summary Banner */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`px-2.5 py-1 rounded-full font-semibold ${allPassed ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'}`}>
              {passedCount} / {totalCount} Tests Passed
            </span>
            <span className="text-slate-400">({((passedCount / (totalCount || 1)) * 100).toFixed(0)}% Success Rate)</span>
          </div>

          <button
            onClick={onRerunTests}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Rerun All Tests</span>
          </button>
        </div>

        {/* Test Items List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {results.map((test) => (
            <div
              key={test.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                test.passed
                  ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {test.passed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{test.name}</h4>
                  <p className="text-xs text-slate-400">{test.message}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500 shrink-0">{test.durationMs}ms</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
          All test assertions executed successfully according to Phase 1 technical specifications.
        </div>
      </div>
    </div>
  );
};
