/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LandMarketView } from './components/LandMarketView';
import { PropertiesView } from './components/PropertiesView';
import { ConstructionView } from './components/ConstructionView';
import { TenantsView } from './components/TenantsView';
import { FinanceView } from './components/FinanceView';
import { MarketView } from './components/MarketView';
import { EngineInspectorView } from './components/EngineInspectorView';
import { EducationView } from './components/EducationView';
import { SettingsView } from './components/SettingsView';
import { TestRunnerModal } from './components/TestRunnerModal';
import { GameState, TestResultItem } from './types';
import { SaveManager } from './engine/SaveManager';
import { SimulationClock } from './engine/SimulationClock';
import { FinanceManager } from './engine/FinanceManager';
import { GameEngineTests } from './tests/GameEngineTests';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => SaveManager.loadGame());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);

  // Auto-save on game state change if enabled
  useEffect(() => {
    if (gameState && gameState.settings.autoSaveEnabled) {
      SaveManager.saveGame(gameState);
    }
  }, [gameState]);

  const handleAdvanceMonth = () => {
    setGameState((prev) => {
      const nextDate = SimulationClock.advanceMonth(prev.date);
      // Monthly administrative overhead / office expense UGX 500,000
      const monthlyOverhead = 500000;
      const txRes = FinanceManager.recordTransaction(
        prev.cashUGX,
        prev.transactions,
        'EXPENSE',
        `Monthly Operating & Administration Expense (${SimulationClock.formatDate(nextDate)})`,
        -monthlyOverhead
      );

      const updatedCash = txRes.success ? txRes.newCash : prev.cashUGX;
      const updatedTransactions = txRes.success ? txRes.newTransactions : prev.transactions;

      const newState: GameState = {
        ...prev,
        date: nextDate,
        cashUGX: updatedCash,
        transactions: updatedTransactions,
      };

      return newState;
    });
  };

  const handleRunTests = () => {
    const results = GameEngineTests.runAllTests();
    setTestResults(results);
    setIsTestModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        gameState={gameState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAdvanceMonth={handleAdvanceMonth}
        onOpenTests={handleRunTests}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            gameState={gameState}
            setActiveTab={setActiveTab}
            onAdvanceMonth={handleAdvanceMonth}
          />
        )}
        {activeTab === 'market' && (
          <LandMarketView gameState={gameState} setGameState={setGameState} />
        )}
        {activeTab === 'properties' && (
          <PropertiesView gameState={gameState} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'construction' && (
          <ConstructionView gameState={gameState} setGameState={setGameState} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'tenants' && <TenantsView />}
        {activeTab === 'finance' && <FinanceView gameState={gameState} setGameState={setGameState} />}
        {activeTab === 'economy' && <MarketView gameState={gameState} />}
        {activeTab === 'engine' && <EngineInspectorView />}
        {activeTab === 'education' && <EducationView />}
        {activeTab === 'settings' && (
          <SettingsView gameState={gameState} setGameState={setGameState} />
        )}
      </main>

      <TestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        results={testResults}
        onRerunTests={() => setTestResults(GameEngineTests.runAllTests())}
      />
    </div>
  );
}
