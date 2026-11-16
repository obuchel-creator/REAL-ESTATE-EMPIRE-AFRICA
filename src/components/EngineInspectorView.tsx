import React from 'react';
import { Cpu, FileCode, Layers, ShieldCheck, Terminal } from 'lucide-react';

export const EngineInspectorView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Godot 4 Architecture & GDScript Inspector</h2>
        <p className="text-sm text-slate-400">
          Technical validation of the Godot 4 project structure, node hierarchy, and cross-platform export configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Hierarchy Tree */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Main Scene Node Hierarchy (Godot 4)</h3>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1.5">
            <div className="text-emerald-400">📁 MainScene (Node2D)</div>
            <div className="pl-4 text-slate-300">├── 📜 GameManager (Autoload / Node)</div>
            <div className="pl-4 text-slate-300">├── 📜 SimulationClock (Autoload / Node)</div>
            <div className="pl-4 text-slate-300">├── 📜 FinanceManager (Autoload / Node)</div>
            <div className="pl-4 text-slate-300">├── 📜 SaveManager (Autoload / Node)</div>
            <div className="pl-4 text-slate-300">└── 🖥️ UIViewport (CanvasLayer)</div>
            <div className="pl-8 text-slate-400">├── MainMenu (Control)</div>
            <div className="pl-8 text-slate-400">├── DashboardPanel (Control)</div>
            <div className="pl-8 text-slate-400">├── LandMarketMap (Control2D)</div>
            <div className="pl-8 text-slate-400">└── FinancialLedgerUI (Control)</div>
          </div>
        </div>

        {/* Cross-Platform Export Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Cross-Platform Export Validation</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">Android (APK / AAB)</span>
              <p className="text-slate-400">Requires Android SDK, Gradle, and Godot Android Export Templates. Gradle build validated for ARM64 and ARMv7.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">Web (HTML5 / WebAssembly)</span>
              <p className="text-slate-400">Exported via Godot HTML5 template. SharedArrayBuffer headers required for multi-threaded WASM persistence.</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
              <span className="font-bold text-white">Desktop (Windows, macOS, Linux)</span>
              <p className="text-slate-400">Native GDScript performance with Vulkan/Compatibility rendering backends.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
