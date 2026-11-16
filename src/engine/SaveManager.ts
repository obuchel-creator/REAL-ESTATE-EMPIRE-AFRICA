import { GameState } from '../types';
import { PlayerManager } from './PlayerManager';
import { INITIAL_MACRO_ECONOMY } from '../data/UgandaConfig';

const SAVE_KEY_PRIMARY_DEFAULT = 'real_estate_empire_africa_save_v1';
const SAVE_KEY_BACKUP_DEFAULT = 'real_estate_empire_africa_backup_v1';
const SAVE_KEY_SNAPSHOT_DEFAULT = 'real_estate_empire_africa_snapshot_v1';
const CURRENT_VERSION = '1.0.0';

let testStoragePrefix: string | null = null;

export class SaveManager {
  static setTestStoragePrefix(prefix: string | null) {
    testStoragePrefix = prefix;
  }

  private static getPrimaryKeys() {
    if (testStoragePrefix) {
      return {
        primary: `${testStoragePrefix}_save`,
        backup: `${testStoragePrefix}_backup`,
        snapshot: `${testStoragePrefix}_snapshot`,
      };
    }
    return {
      primary: SAVE_KEY_PRIMARY_DEFAULT,
      backup: SAVE_KEY_BACKUP_DEFAULT,
      snapshot: SAVE_KEY_SNAPSHOT_DEFAULT,
    };
  }

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
      currentLocationId: 'kololo',
      cashUGX: 500000000, // UGX 500M starting capital for Kololo prime tier
      transactions: [
        {
          id: 'tx_init_1',
          dateStr: '2026-01-01',
          timestamp: Date.now(),
          type: 'CAPITAL',
          description: 'Initial Seed Capital & Personal Savings Injection',
          amountUGX: 500000000,
          previousBalanceUGX: 0,
          newBalanceUGX: 500000000,
        },
      ],
      properties: [],
      constructionProjects: [],
      loans: [],
      uraTaxRecords: [],
      taxComplianceStatus: 'COMPLIANT',
      consecutiveNegativeCashMonths: 0,
      liabilitiesUGX: 0,
      macroEconomy: { ...INITIAL_MACRO_ECONOMY },
      settings: {
        soundEnabled: true,
        autoSaveEnabled: true,
        simulationSpeed: 5,
      },
    };
  }

  static validateGameState(state: any): boolean {
    if (!state || typeof state !== 'object') return false;
    if (typeof state.version !== 'string') return false;
    if (!state.player || typeof state.player !== 'object' || typeof state.player.name !== 'string') return false;
    if (!state.date || typeof state.date !== 'object' || typeof state.date.year !== 'number') return false;
    if (!Array.isArray(state.transactions)) return false;
    if (!Array.isArray(state.properties)) return false;
    if (!Array.isArray(state.constructionProjects)) return false;
    if (!Array.isArray(state.loans)) return false;
    if (!Array.isArray(state.uraTaxRecords)) return false;
    if (typeof state.cashUGX !== 'number' || !Number.isFinite(state.cashUGX)) return false;
    return true;
  }

  static saveGame(state: GameState): boolean {
    if (!SaveManager.validateGameState(state)) {
      console.error('Attempted to save invalid GameState structure.');
      return false;
    }
    const keys = SaveManager.getPrimaryKeys();
    try {
      const serialized = JSON.stringify(state);
      const existing = localStorage.getItem(keys.primary);
      if (existing) {
        try {
          localStorage.setItem(keys.backup, existing);
        } catch (backupErr) {
          console.warn('Backup write failed, but proceeding with primary save:', backupErr);
        }
      }
      localStorage.setItem(keys.primary, serialized);
      const verification = localStorage.getItem(keys.primary);
      if (!verification) {
        throw new Error('Storage write verification failed.');
      }
      return true;
    } catch (e) {
      console.error('Failed to save game state:', e);
      return false;
    }
  }

  static loadGame(): GameState {
    const keys = SaveManager.getPrimaryKeys();
    try {
      const raw = localStorage.getItem(keys.primary);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (SaveManager.validateGameState(parsed)) {
          return parsed as GameState;
        }
      }

      // Primary missing or invalid, attempt validated backup recovery before new game
      const backupRaw = localStorage.getItem(keys.backup);
      if (backupRaw) {
        const backupParsed = JSON.parse(backupRaw);
        if (SaveManager.validateGameState(backupParsed)) {
          localStorage.setItem(keys.primary, backupRaw);
          return backupParsed as GameState;
        }
      }
    } catch (e) {
      console.warn('Primary and backup recovery encountered error:', e);
    }

    return SaveManager.createInitialGameState();
  }

  static snapshotCurrentSave(): boolean {
    const keys = SaveManager.getPrimaryKeys();
    try {
      const current = localStorage.getItem(keys.primary);
      if (current) {
        localStorage.setItem(keys.snapshot, current);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  static restoreSnapshot(): boolean {
    const keys = SaveManager.getPrimaryKeys();
    try {
      const snap = localStorage.getItem(keys.snapshot);
      if (snap && SaveManager.validateGameState(JSON.parse(snap))) {
        localStorage.setItem(keys.primary, snap);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  static exportSaveJson(state: GameState): string {
    return JSON.stringify(state, null, 2);
  }

  static importSaveJson(jsonStr: string): { success: boolean; state?: GameState; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!SaveManager.validateGameState(parsed)) {
        return { success: false, error: 'Imported JSON does not match Real Estate Empire Africa schema requirements.' };
      }
      SaveManager.snapshotCurrentSave();
      const saved = SaveManager.saveGame(parsed as GameState);
      if (!saved) {
        SaveManager.restoreSnapshot();
        return { success: false, error: 'Failed to persist imported game state. Reverted to previous save.' };
      }
      return { success: true, state: parsed as GameState };
    } catch (e) {
      return { success: false, error: 'Invalid JSON format: ' + (e as Error).message };
    }
  }

  static clearSave(): boolean {
    const keys = SaveManager.getPrimaryKeys();
    try {
      SaveManager.snapshotCurrentSave();
      localStorage.removeItem(keys.primary);
      localStorage.removeItem(keys.backup);
      return true;
    } catch (e) {
      SaveManager.restoreSnapshot();
      return false;
    }
  }
}
