import { GameState, MilestoneDefinition, UnlockedMilestoneRecord } from '../types';
import { MILESTONE_DEFINITIONS } from '../data/MilestoneConfig';
import { FinanceManager } from './FinanceManager';
import { PlayerManager } from './PlayerManager';
import { SimulationClock } from './SimulationClock';
import { MilestonePerks, ActiveMilestonePerks } from './MilestonePerks';

export type { ActiveMilestonePerks };

export interface MilestoneProgressInfo {
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  isUnlocked: boolean;
  unlockRecord?: UnlockedMilestoneRecord;
}

export class MilestoneManager {
  static calculateCurrentNetWorth(gameState: GameState): number {
    const totalAssets = FinanceManager.calculateTotalAssets(gameState.properties, gameState.cashUGX);
    const totalLiabilities = FinanceManager.calculateTotalLiabilities(gameState.loans);
    return FinanceManager.calculateNetWorth(totalAssets, totalLiabilities);
  }

  static getActivePerks(unlockedMilestones: UnlockedMilestoneRecord[] = []): ActiveMilestonePerks {
    return MilestonePerks.getActivePerks(unlockedMilestones);
  }

  static isTemplateUnlocked(
    templateId: string,
    unlockedMilestones: UnlockedMilestoneRecord[] = []
  ): { unlocked: boolean; requiredMilestone?: MilestoneDefinition } {
    return MilestonePerks.isTemplateUnlocked(templateId, unlockedMilestones);
  }

  static getDiscountedConstructionCost(
    baseCostUGX: number,
    unlockedMilestones: UnlockedMilestoneRecord[] = []
  ): number {
    return MilestonePerks.getDiscountedConstructionCost(baseCostUGX, unlockedMilestones);
  }

  static getEffectivePropertyLtv(
    baseMaxLtvRatio: number,
    unlockedMilestones: UnlockedMilestoneRecord[] = []
  ): number {
    return MilestonePerks.getEffectivePropertyLtv(baseMaxLtvRatio, unlockedMilestones);
  }

  static getEffectiveLoanTerms(
    baseAnnualRate: number,
    unlockedMilestones: UnlockedMilestoneRecord[] = []
  ): { effectiveAnnualRate: number; originationFeeRate: number } {
    return MilestonePerks.getEffectiveLoanTerms(baseAnnualRate, unlockedMilestones);
  }

  static getMilestoneProgress(
    milestone: MilestoneDefinition,
    gameState: GameState,
    precomputedNetWorth?: number
  ): MilestoneProgressInfo {
    const unlockedRecords = gameState.unlockedMilestones || [];
    const unlockRecord = unlockedRecords.find((r) => r.milestoneId === milestone.id);
    const isUnlocked = Boolean(unlockRecord);

    const netWorth = precomputedNetWorth ?? MilestoneManager.calculateCurrentNetWorth(gameState);

    if (milestone.triggerType === 'NET_WORTH') {
      const currentValue = Math.max(0, netWorth);
      const rawPct = (currentValue / milestone.thresholdValue) * 100;
      return {
        currentValue,
        targetValue: milestone.thresholdValue,
        progressPercent: isUnlocked ? 100 : Math.min(100, Math.max(0, Math.round(rawPct))),
        isUnlocked,
        unlockRecord,
      };
    }

    const targetXp = PlayerManager.getXpThresholdForLevel(milestone.thresholdValue);
    const currentXp = gameState.player.experiencePoints;
    const rawPct = targetXp > 0 ? (currentXp / targetXp) * 100 : 100;

    return {
      currentValue: gameState.player.businessLevel,
      targetValue: milestone.thresholdValue,
      progressPercent:
        isUnlocked || gameState.player.businessLevel >= milestone.thresholdValue
          ? 100
          : Math.min(99, Math.max(0, Math.round(rawPct))),
      isUnlocked,
      unlockRecord,
    };
  }

  static getEligibleUnclaimedMilestones(gameState: GameState): MilestoneDefinition[] {
    const unlockedIds = new Set((gameState.unlockedMilestones || []).map((r) => r.milestoneId));
    const netWorth = MilestoneManager.calculateCurrentNetWorth(gameState);

    return MILESTONE_DEFINITIONS.filter((m) => {
      if (unlockedIds.has(m.id)) return false;
      if (m.triggerType === 'NET_WORTH') {
        return netWorth >= m.thresholdValue;
      }
      return gameState.player.businessLevel >= m.thresholdValue;
    });
  }

  static evaluateAndClaimMilestones(gameState: GameState): {
    newGameState: GameState;
    newlyUnlocked: MilestoneDefinition[];
  } {
    let workingState: GameState = {
      ...gameState,
      unlockedMilestones: [...(gameState.unlockedMilestones || [])],
    };

    const newlyUnlocked: MilestoneDefinition[] = [];
    const maxPasses = MILESTONE_DEFINITIONS.length;

    for (let pass = 0; pass < maxPasses; pass++) {
      const eligible = MilestoneManager.getEligibleUnclaimedMilestones(workingState);
      if (eligible.length === 0) break;

      const dateStr = SimulationClock.formatDate(workingState.date);

      for (const milestone of eligible) {
        const netWorthAtUnlock = MilestoneManager.calculateCurrentNetWorth(workingState);
        const levelAtUnlock = workingState.player.businessLevel;

        const record: UnlockedMilestoneRecord = {
          milestoneId: milestone.id,
          unlockedAtDateStr: dateStr,
          unlockedAtTimestamp: Date.now(),
          netWorthAtUnlockUGX: netWorthAtUnlock,
          levelAtUnlock,
        };

        let nextCash = workingState.cashUGX;
        let nextTransactions = workingState.transactions;
        let nextPlayer = { ...workingState.player };

        if (milestone.rewards.cashBonusUGX && milestone.rewards.cashBonusUGX > 0) {
          const txRes = FinanceManager.recordTransaction(
            nextCash,
            nextTransactions,
            'CAPITAL',
            `Milestone Reward (${milestone.title}): Cash Grant`,
            milestone.rewards.cashBonusUGX,
            milestone.id,
            true
          );
          if (txRes.success) {
            nextCash = txRes.newCash;
            nextTransactions = txRes.newTransactions;
          }
        }

        if (milestone.rewards.experienceBonus && milestone.rewards.experienceBonus > 0) {
          nextPlayer = PlayerManager.addExperience(nextPlayer, milestone.rewards.experienceBonus);
        }

        if (milestone.rewards.reputationBonus && milestone.rewards.reputationBonus > 0) {
          nextPlayer = {
            ...nextPlayer,
            reputation: Math.min(100, nextPlayer.reputation + milestone.rewards.reputationBonus),
          };
        }

        nextPlayer.currentCashUGX = nextCash;

        workingState = {
          ...workingState,
          cashUGX: nextCash,
          transactions: nextTransactions,
          player: nextPlayer,
          unlockedMilestones: [...(workingState.unlockedMilestones || []), record],
        };

        newlyUnlocked.push(milestone);
      }
    }

    return {
      newGameState: workingState,
      newlyUnlocked,
    };
  }
}
