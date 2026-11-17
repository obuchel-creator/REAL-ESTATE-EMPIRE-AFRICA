import { MilestoneDefinition, UnlockedMilestoneRecord } from '../types';
import { MILESTONE_DEFINITIONS } from '../data/MilestoneConfig';

export interface ActiveMilestonePerks {
  interestRateDiscount: number;
  originationFeeRate: number;
  constructionDiscountRate: number;
  ltvBonus: number;
  unlockedTemplateIds: string[];
}

const DEFAULT_UNLOCKED_TEMPLATES = ['muzigo_block', 'apartment_block', 'executive_townhouse'];
const BASE_ORIGINATION_FEE_RATE = 0.015;

export class MilestonePerks {
  static getActivePerks(unlockedMilestones: UnlockedMilestoneRecord[] = []): ActiveMilestonePerks {
    const unlockedIds = new Set(unlockedMilestones.map((r) => r.milestoneId));

    let interestRateDiscount = 0;
    let originationFeeDiscount = 0;
    let constructionDiscountRate = 0;
    let ltvBonus = 0;
    const unlockedTemplates = new Set<string>(DEFAULT_UNLOCKED_TEMPLATES);

    for (const def of MILESTONE_DEFINITIONS) {
      if (!unlockedIds.has(def.id)) continue;
      if (def.rewards.interestRateDiscount) {
        interestRateDiscount += def.rewards.interestRateDiscount;
      }
      if (def.rewards.originationFeeDiscount) {
        originationFeeDiscount += def.rewards.originationFeeDiscount;
      }
      if (def.rewards.constructionDiscountRate) {
        constructionDiscountRate += def.rewards.constructionDiscountRate;
      }
      if (def.rewards.ltvBonus) {
        ltvBonus += def.rewards.ltvBonus;
      }
      if (def.rewards.unlockTemplateId) {
        unlockedTemplates.add(def.rewards.unlockTemplateId);
      }
    }

    return {
      interestRateDiscount: Math.min(0.06, Number(interestRateDiscount.toFixed(4))),
      originationFeeRate: Math.max(0.0025, Number((BASE_ORIGINATION_FEE_RATE - originationFeeDiscount).toFixed(4))),
      constructionDiscountRate: Math.min(0.25, Number(constructionDiscountRate.toFixed(4))),
      ltvBonus: Math.min(0.15, Number(ltvBonus.toFixed(4))),
      unlockedTemplateIds: Array.from(unlockedTemplates),
    };
  }

  static isTemplateUnlocked(
    templateId: string,
    unlockedMilestones: UnlockedMilestoneRecord[] = []
  ): { unlocked: boolean; requiredMilestone?: MilestoneDefinition } {
    const perks = MilestonePerks.getActivePerks(unlockedMilestones);
    if (perks.unlockedTemplateIds.includes(templateId)) {
      return { unlocked: true };
    }
    const requiredMilestone = MILESTONE_DEFINITIONS.find((m) => m.rewards.unlockTemplateId === templateId);
    return { unlocked: false, requiredMilestone };
  }

  static getDiscountedConstructionCost(
    baseCostUGX: number,
    unlockedMilestones: UnlockedMilestoneRecord[] = []
  ): number {
    const perks = MilestonePerks.getActivePerks(unlockedMilestones);
    if (perks.constructionDiscountRate <= 0) return Math.round(baseCostUGX);
    return Math.round(baseCostUGX * (1 - perks.constructionDiscountRate));
  }

  static getEffectivePropertyLtv(
    baseMaxLtvRatio: number,
    unlockedMilestones: UnlockedMilestoneRecord[] = []
  ): number {
    const perks = MilestonePerks.getActivePerks(unlockedMilestones);
    return Math.min(0.85, Number((baseMaxLtvRatio + perks.ltvBonus).toFixed(4)));
  }

  static getEffectiveLoanTerms(
    baseAnnualRate: number,
    unlockedMilestones: UnlockedMilestoneRecord[] = []
  ): { effectiveAnnualRate: number; originationFeeRate: number } {
    const perks = MilestonePerks.getActivePerks(unlockedMilestones);
    const effectiveAnnualRate = Math.max(0.08, Number((baseAnnualRate - perks.interestRateDiscount).toFixed(4)));
    return {
      effectiveAnnualRate,
      originationFeeRate: perks.originationFeeRate,
    };
  }
}
