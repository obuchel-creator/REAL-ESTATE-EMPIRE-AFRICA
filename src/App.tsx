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

import { TenantManager } from './engine/TenantManager';
import { PlayerManager } from './engine/PlayerManager';

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

      // 1. Process Tenant Rent Collection
      const rentRes = TenantManager.processMonthlyRent(prev);
      let workingState = rentRes.newGameState;

      // Also collect rent from any completed properties without granular leases
      const rentedPropsWithoutGranularTenants = workingState.properties.filter(
        (p) => (p.status === 'Rented' || p.status === 'Completed') && p.monthlyRentalIncomeUGX > 0 &&
               (!workingState.tenants || workingState.tenants.filter(t => t.propertyId === p.id && t.status === 'ACTIVE').length === 0)
      );

      for (const prop of rentedPropsWithoutGranularTenants) {
        const propRent = Math.round(prop.monthlyRentalIncomeUGX * (prop.occupancyRate || 0.9));
        if (propRent > 0) {
          const txRent = FinanceManager.recordTransaction(
            workingState.cashUGX,
            workingState.transactions,
            'INCOME',
            `Commercial Rent Collection: ${prop.title} (${SimulationClock.formatDate(nextDate)})`,
            propRent,
            prop.id
          );
          if (txRent.success) {
            workingState = {
              ...workingState,
              cashUGX: txRent.newCash,
              transactions: txRent.newTransactions,
            };
          }
        }
      }

      // 2. Monthly administrative overhead / office expense UGX 500,000
      const monthlyOverhead = 500000;
      const txRes = FinanceManager.recordTransaction(
        workingState.cashUGX,
        workingState.transactions,
        'EXPENSE',
        `Monthly Operating & Administration Expense (${SimulationClock.formatDate(nextDate)})`,
        -monthlyOverhead
      );

      const updatedCash = txRes.success ? txRes.newCash : workingState.cashUGX;
      const updatedTransactions = txRes.success ? txRes.newTransactions : workingState.transactions;

      let intermediateState: GameState = {
        ...workingState,
        date: nextDate,
        cashUGX: updatedCash,
        transactions: updatedTransactions,
      };

      // 3. Process monthly loan repayments and amortizations
      const loanRes = FinanceManager.processMonthlyLoans(intermediateState);
      intermediateState = loanRes.newGameState;

      // 4. Trigger facility maintenance issues periodically
      intermediateState = TenantManager.triggerMaintenanceTick(intermediateState);

      // 5. Quarterly URA Tax Filing Assessment generation (Months 3, 6, 9, 12)
      if (nextDate.month % 3 === 0) {
        const totalGrossRent = workingState.properties.reduce(
          (acc, p) => acc + (p.status === 'Rented' ? Math.round(p.monthlyRentalIncomeUGX * p.occupancyRate * 3) : 0),
          0
        );
        if (totalGrossRent > 0) {
          const taxCalc = FinanceManager.calculateUraRentalTax(totalGrossRent);
          const newTaxRec = {
            id: 'ura_' + Date.now(),
            periodStr: `Q${Math.ceil(nextDate.month / 3)} ${nextDate.year}`,
            grossRentalIncomeUGX: totalGrossRent,
            deductibleExpensesUGX: taxCalc.deductibleExpenses,
            taxableIncomeUGX: taxCalc.taxableIncome,
            taxDueUGX: taxCalc.taxDue,
            isPaid: false,
            dueDateStr: `${nextDate.year}-${String(nextDate.month).padStart(2, '0')}-28`,
            penaltyUGX: 0,
          };
          intermediateState = {
            ...intermediateState,
            uraTaxRecords: [newTaxRec, ...intermediateState.uraTaxRecords],
          };
        }
      }

      // 6. Award Player Operating Experience
      const updatedPlayer = PlayerManager.addExperience(intermediateState.player, 120);

      return {
        ...intermediateState,
        player: updatedPlayer,
      };
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
        {activeTab === 'tenants' && (
          <TenantsView gameState={gameState} setGameState={setGameState} setActiveTab={setActiveTab} />
        )}
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
