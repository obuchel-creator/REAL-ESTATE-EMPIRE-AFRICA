import React, { useState } from 'react';
import { Save, RotateCcw, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { GameState } from '../types';
import { SaveManager } from '../engine/SaveManager';

interface SettingsViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ gameState, setGameState }) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [notification, setNotification] = useState<{ message: string; success: boolean } | null>(null);

  const handleSave = () => {
    const success = SaveManager.saveGame(gameState);
    setNotification({
      message: success ? 'Game state successfully saved to local storage.' : 'Failed to save game.',
      success,
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your real estate empire? Your current progress will be snapshotted before reset.')) {
      const snapSuccess = SaveManager.snapshotCurrentSave();
      if (!snapSuccess) {
        setNotification({ message: 'Failed to create pre-reset safety snapshot. Reset aborted.', success: false });
        return;
      }
      const clearSuccess = SaveManager.clearSave();
      if (!clearSuccess) {
        SaveManager.restoreSnapshot();
        setNotification({ message: 'Failed to clear save storage securely. Reset aborted and restored.', success: false });
        return;
      }
      const fresh = SaveManager.createInitialGameState();
      setGameState(fresh);
      SaveManager.saveGame(fresh);
      setNotification({ message: 'Game progress reset to initial starting state (previous progress snapshotted).', success: true });
    }
  };

  const handleExport = () => {
    const json = SaveManager.exportSaveJson(gameState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real_estate_empire_uganda_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification({ message: 'Save file exported successfully.', success: true });
  };

  const handleImport = () => {
    const res = SaveManager.importSaveJson(importJsonText);
    if (!res.success || !res.state) {
      setNotification({ message: res.error || 'Import failed. Active game preserved.', success: false });
      return;
    }
    setGameState(res.state);
    setNotification({ message: 'Save file imported successfully! Previous progress snapshotted.', success: true });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Settings & Save Management</h2>
        <p className="text-sm text-slate-400">
          Manage local storage persistence, backup snapshots, and JSON save exports.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${notification.success ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/50 border-rose-500/30 text-rose-300'}`}>
          {notification.success ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Game Now</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Save JSON</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 font-semibold text-xs rounded-lg transition-colors border border-rose-800/50 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Game</span>
          </button>
        </div>

        <div className="border-t border-slate-800 pt-6 space-y-3">
          <h3 className="text-sm font-bold text-white">Import Save JSON</h3>
          <textarea
            rows={4}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder="Paste exported JSON save string here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors border border-slate-700"
          >
            <Upload className="w-4 h-4" />
            <span>Import & Overwrite Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
