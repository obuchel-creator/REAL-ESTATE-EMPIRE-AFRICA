import { PlayerProfile } from '../types';

export class PlayerManager {
  static createDefaultProfile(name: string = 'Kigozi David', companyName: string = 'Pearl City Properties Ltd'): PlayerProfile {
    return {
      name,
      companyName,
      avatarId: 'default_uganda_exec',
      startingCapitalUGX: 50000000, // UGX 50 Million starting capital
      currentCashUGX: 50000000,
      reputation: 50,
      businessLevel: 1,
      businessTitle: 'Junior Land Aspirant',
      experiencePoints: 0,
    };
  }

  static getTitleForLevel(level: number): string {
    switch (level) {
      case 1: return 'Junior Land Aspirant';
      case 2: return 'Plot Developer & Trader';
      case 3: return 'Suburban Estate Builder';
      case 4: return 'Commercial Real Estate Tycoon';
      case 5: return 'Pan-African Property Magnate';
      default: return 'Real Estate Legend';
    }
  }

  static getXpThresholdForLevel(level: number): number {
    if (level <= 1) return 0;
    return (level - 1) * 500;
  }

  static getNextLevelXpThreshold(level: number): number | null {
    if (level >= 5) return null;
    return level * 500;
  }

  static addExperience(profile: PlayerProfile, xp: number): PlayerProfile {
    const newXp = Math.max(0, profile.experiencePoints + Math.round(xp));
    let newLevel = profile.businessLevel;
    while (newLevel < 5 && newXp >= newLevel * 500) {
      newLevel += 1;
    }
    return {
      ...profile,
      experiencePoints: newXp,
      businessLevel: newLevel,
      businessTitle: PlayerManager.getTitleForLevel(newLevel),
    };
  }
}
