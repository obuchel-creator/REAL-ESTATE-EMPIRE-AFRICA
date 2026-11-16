import { TestResultItem } from '../types';
import { FinanceManager } from '../engine/FinanceManager';
import { SimulationClock } from '../engine/SimulationClock';
import { PlayerManager } from '../engine/PlayerManager';
import { SaveManager } from '../engine/SaveManager';

export class GameEngineTests {
  static runAllTests(): TestResultItem[] {
    const results: TestResultItem[] = [];

    // Test 1: New Game Initialization
    results.push(GameEngineTests.testNewGameInitialization());

    // Test 2: Player Profile Creation & Progression
    results.push(GameEngineTests.testPlayerProfile());

    // Test 3: Simulation Clock & Month Transition
    results.push(GameEngineTests.testSimulationClock());

    // Test 4: Finance Manager Income Transaction
    results.push(GameEngineTests.testFinanceIncome());

    // Test 5: Finance Manager Expense Transaction
    results.push(GameEngineTests.testFinanceExpense());

    // Test 6: Insufficient Balance Rejection
    results.push(GameEngineTests.testInsufficientBalanceRejection());

    // Test 7: Net Worth Calculation
    results.push(GameEngineTests.testNetWorthCalculation());

    // Test 8: Save and Load Roundtrip
    results.push(GameEngineTests.testSaveAndLoad());

    // Test 9: Corrupted Save Handling & Fallback
    results.push(GameEngineTests.testCorruptedSaveHandling());

    return results;
  }

  private static testNewGameInitialization(): TestResultItem {
    const start = performance.now();
    try {
      const state = SaveManager.createInitialGameState();
      const valid = state.cashUGX === 50000000 && state.date.year === 2026 && state.player.name === 'Kigozi David';
      return {
        id: 'test_init',
        name: 'New Game Initialization & UGX Seed Capital',
        passed: valid,
        message: valid ? 'Successfully initialized with UGX 50,000,000 seed capital in Kampala.' : 'State initialization mismatch.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_init', name: 'New Game Initialization', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }

  private static testPlayerProfile(): TestResultItem {
    const start = performance.now();
    try {
      let profile = PlayerManager.createDefaultProfile('Amina Nakato', 'Nile Horizon Estates');
      profile = PlayerManager.addExperience(profile, 550);
      const passed = profile.businessLevel === 2 && profile.companyName === 'Nile Horizon Estates';
      return {
        id: 'test_profile',
        name: 'Player Profile Creation & Level Progression',
        passed,
        message: passed ? 'Profile successfully leveled up to 2: Plot Developer & Trader.' : 'Profile progression logic failed.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_profile', name: 'Player Profile', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }

  private static testSimulationClock(): TestResultItem {
    const start = performance.now();
    try {
      let date = { year: 2026, month: 1, day: 1, totalDaysElapsed: 0 };
      date = SimulationClock.advanceMonth(date);
      const passed = date.month === 2 && date.year === 2026 && date.totalDaysElapsed === 30;
      return {
        id: 'test_clock',
        name: 'Simulation Clock Month Advancement',
        passed,
        message: passed ? 'Successfully advanced from January 2026 to February 2026.' : 'Clock advancement incorrect.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_clock', name: 'Simulation Clock', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }

  private static testFinanceIncome(): TestResultItem {
    const start = performance.now();
    try {
      const res = FinanceManager.recordTransaction(50000000, [], 'INCOME', 'Monthly Rental Inflow', 2500000);
      const passed = res.success && res.newCash === 52500000 && res.newTransactions.length === 1;
      return {
        id: 'test_income',
        name: 'Finance Manager Income Transaction',
        passed,
        message: passed ? 'Successfully recorded UGX 2,500,000 rental income.' : 'Income recording failed.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_income', name: 'Finance Income', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }

  private static testFinanceExpense(): TestResultItem {
    const start = performance.now();
    try {
      const res = FinanceManager.recordTransaction(50000000, [], 'EXPENSE', 'Land Search & Due Diligence Fee', 500000);
      const passed = res.success && res.newCash === 49500000;
      return {
        id: 'test_expense',
        name: 'Finance Manager Expense Transaction',
        passed,
        message: passed ? 'Successfully recorded UGX 500,000 due diligence expense.' : 'Expense recording failed.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_expense', name: 'Finance Expense', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }

  private static testInsufficientBalanceRejection(): TestResultItem {
    const start = performance.now();
    try {
      const res = FinanceManager.recordTransaction(1000000, [], 'EXPENSE', 'Large Land Purchase Attempt', 5000000);
      const passed = !res.success && res.newCash === 1000000 && res.error !== undefined;
      return {
        id: 'test_insufficient',
        name: 'Insufficient Balance Rejection Invariant',
        passed,
        message: passed ? 'Successfully blocked outflow exceeding cash balance and preserved funds.' : 'Failed to reject overdrawn transaction.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_insufficient', name: 'Insufficient Balance', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }

  private static testNetWorthCalculation(): TestResultItem {
    const start = performance.now();
    try {
      const dummyProps = [
        {
          id: 'p1',
          title: 'Ntinda Commercial Plot',
          locationId: 'kampala' as const,
          tenureType: 'Mailo' as const,
          sizeDecimals: 15,
          purchasePriceUGX: 40000000,
          currentValuationUGX: 45000000,
          purchaseDateStr: '2026-01-01',
          status: 'Raw Land' as const,
          monthlyRentalIncomeUGX: 0,
          occupancyRate: 0,
        },
      ];
      const cash = 10000000;
      const assets = FinanceManager.calculateTotalAssets(dummyProps, cash);
      const liabilities = 5000000;
      const netWorth = FinanceManager.calculateNetWorth(assets, liabilities);
      const passed = assets === 55000000 && netWorth === 50000000;
      return {
        id: 'test_networth',
        name: 'Net Worth Calculation (Assets - Liabilities)',
        passed,
        message: passed ? 'Assets UGX 55M, Liabilities UGX 5M yielded Net Worth UGX 50M.' : 'Net worth calculation incorrect.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_networth', name: 'Net Worth', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }

  private static testSaveAndLoad(): TestResultItem {
    const start = performance.now();
    try {
      const state = SaveManager.createInitialGameState();
      state.cashUGX = 75000000;
      const saved = SaveManager.saveGame(state);
      const loaded = SaveManager.loadGame();
      const passed = saved && loaded.cashUGX === 75000000;
      return {
        id: 'test_saveload',
        name: 'Local Save & Load Persistence Roundtrip',
        passed,
        message: passed ? 'State successfully persisted to localStorage and reloaded accurately.' : 'Save/load persistence failed.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_saveload', name: 'Save and Load', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }

  private static testCorruptedSaveHandling(): TestResultItem {
    const start = performance.now();
    try {
      // Inject corrupted JSON
      localStorage.setItem('real_estate_empire_africa_save_v1', '{corrupted_json_data:');
      const loaded = SaveManager.loadGame();
      const passed = loaded.cashUGX === 50000000 && loaded.player.name === 'Kigozi David';
      return {
        id: 'test_corruption',
        name: 'Corrupted Save Handling & Fallback Recovery',
        passed,
        message: passed ? 'Corrupted save gracefully detected and defaulted to initial state.' : 'Failed to handle corruption gracefully.',
        durationMs: Math.round(performance.now() - start),
      };
    } catch (e) {
      return { id: 'test_corruption', name: 'Corrupted Save', passed: false, message: (e as Error).message, durationMs: Math.round(performance.now() - start) };
    }
  }
}
