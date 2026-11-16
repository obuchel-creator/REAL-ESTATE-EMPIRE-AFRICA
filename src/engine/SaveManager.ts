import { GameState } from '../types';
import { PlayerManager } from './PlayerManager';
import { INITIAL_MACRO_ECONOMY } from '../data/UgandaConfig';

const SAVE_KEY_PRIMARY = 'real_estate_empire_africa_save_v1';
const SAVE_KEY_BACKUP = 'real_estate_empire_africa_backup_v1';
const CURRENT_VERSION = '1.0.0';

export class SaveManager {
  static createInitialGameState(): GameState {
    return {
      version: CURRENT_VERSION,
      player: PlayerManager.createDefaultProfile(),
      date: {
        year: 2026,
        month: 1,
        day: 1,
        totalDaysElapsed: 0,
      },
      currentLocationId: 'kampala',
      cashUGX: 50000000,
      transactions: [
        {
          id: 'tx_init_1',
          dateStr: '2026-01-01',
          timestamp: Date.now(),
          type: 'CAPITAL',
          description: 'Initial Seed Capital & Personal Savings Injection',
          amountUGX: 50000000,
          previousBalanceUGX: 0,
          newBalanceUGX: 50000000,
        },
      ],
      properties: [],
      liabilitiesUGX: 0,
      macroEconomy: { ...INITIAL_MACRO_ECONOMY },
      settings: {
        soundEnabled: true,
        autoSaveEnabled: true,
        simulationSpeed: 5,
      },
    };
  }

  static saveGame(state: GameState): boolean {
    try {
      const serialized = JSON.stringify(state);
      // Atomic backup rotation
      const existing = localStorage.getItem(SAVE_KEY_PRIMARY);
      if (existing) {
        localStorage.setItem(SAVE_KEY_BACKUP, existing);
      }
      localStorage.setItem(SAVE_KEY_PRIMARY, serialized);
      return true;
    } catch (e) {
      console.error('Failed to save game state:', e);
      return false;
    }
  }

  static loadGame(): GameState {
    try {
      const raw = localStorage.getItem(SAVE_KEY_PRIMARY);
      if (!raw) {
        return SaveManager.createInitialGameState();
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.player || !parsed.date) {
        throw new Error('Invalid save file schema structure.');
      }
      return parsed as GameState;
    } catch (e) {
      console.warn('Primary save corrupted, attempting backup restoration...', e);
      try {
        const backupRaw = localStorage.getItem(SAVE_KEY_BACKUP);
        if (backupRaw) {
          const backupParsed = JSON.parse(backupRaw);
          return backupParsed as GameState;
        }
      } catch (err) {
        console.error('Backup restoration failed too. Initializing fresh save.');
      }
      return SaveManager.createInitialGameState();
    }
  }

  static exportSaveJson(state: GameState): string {
    return JSON.stringify(state, null, 2);
  }

  static importSaveJson(jsonStr: string): { success: boolean; state?: GameState; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object' || !parsed.player || !parsed.date || !Array.isArray(parsed.transactions)) {
        return { success: false, error: 'Imported JSON does not match Real Estate Empire Africa schema requirements.' };
      }
      return { success: true, state: parsed as GameState };
    } catch (e) {
      return { success: false, error: 'Invalid JSON format: ' + (e as Error).message };
    }
  }

  static clearSave(): void {
    localStorage.removeItem(SAVE_KEY_PRIMARY);
    localStorage.removeItem(SAVE_KEY_BACKUP);
  }
}
