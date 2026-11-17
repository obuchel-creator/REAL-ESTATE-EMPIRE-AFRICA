import { MilestoneDefinition } from '../types';

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  // Experience Level Milestones
  {
    id: 'lvl_2_developer',
    title: 'Plot Developer & Trader',
    subtitle: 'Reach Experience Level 2 (500 XP)',
    description:
      'Establish credibility with Kampala municipal surveyors and hardware suppliers through consistent operations.',
    triggerType: 'LEVEL',
    thresholdValue: 2,
    badgeLabel: 'Level 2 Rank',
    rewards: {
      cashBonusUGX: 20000000,
      constructionDiscountRate: 0.05,
      reputationBonus: 5,
    },
    rewardSummary: [
      '+UGX 20M Development Seed Grant',
      '5% Bulk Construction Material Discount',
      '+5 Market Reputation',
    ],
  },
  {
    id: 'lvl_3_architect',
    title: 'Suburban Estate Architect',
    subtitle: 'Reach Experience Level 3 (1,000 XP)',
    description:
      'Demonstrated execution unlocks institutional commercial development blueprints and enhanced bank collateral limits.',
    triggerType: 'LEVEL',
    thresholdValue: 3,
    badgeLabel: 'Level 3 Rank',
    rewards: {
      cashBonusUGX: 45000000,
      unlockTemplateId: 'commercial_plaza',
      ltvBonus: 0.05,
      reputationBonus: 8,
    },
    rewardSummary: [
      '+UGX 45M KCCA Fast-Track Bonus',
      'Unlocks Commercial Retail & Office Plaza Blueprint',
      '+5% Bank Mortgage LTV Cap',
    ],
  },
  {
    id: 'lvl_4_tycoon',
    title: 'Commercial Real Estate Tycoon',
    subtitle: 'Reach Experience Level 4 (1,500 XP)',
    description:
      'Command tier-1 contractor pricing and preferred commercial credit terms across Greater Kampala.',
    triggerType: 'LEVEL',
    thresholdValue: 4,
    badgeLabel: 'Level 4 Rank',
    rewards: {
      cashBonusUGX: 100000000,
      constructionDiscountRate: 0.05,
      interestRateDiscount: 0.005,
      reputationBonus: 10,
    },
    rewardSummary: [
      '+UGX 100M Corporate Bond Allocation',
      '+5% Extra Construction Rebate (10% Total)',
      '-0.5% p.a. Mortgage Interest Discount',
    ],
  },
  {
    id: 'lvl_5_magnate',
    title: 'Pan-African Property Magnate',
    subtitle: 'Reach Experience Level 5 (2,000 XP)',
    description:
      'Achieve pinnacle executive status in Ugandan & East African property development with sovereign institutional backing.',
    triggerType: 'LEVEL',
    thresholdValue: 5,
    badgeLabel: 'Level 5 Pinnacle',
    rewards: {
      cashBonusUGX: 250000000,
      interestRateDiscount: 0.01,
      ltvBonus: 0.05,
      reputationBonus: 15,
    },
    rewardSummary: [
      '+UGX 250M Pan-African Reserve Award',
      '-1.0% p.a. Sovereign Credit Rate Discount',
      '+5% Extra Bank LTV Cap (10% Total)',
    ],
  },

  // Total Net Worth Milestones
  {
    id: 'nw_550m_growth',
    title: 'Kampala Capital Expansion',
    subtitle: 'Reach UGX 550,000,000 Total Net Worth',
    description:
      'Grow your net equity above your initial UGX 500M seed base through appreciation, rental yield, or disciplined execution.',
    triggerType: 'NET_WORTH',
    thresholdValue: 550000000,
    badgeLabel: 'UGX 550M Equity',
    rewards: {
      cashBonusUGX: 15000000,
      experienceBonus: 150,
      reputationBonus: 4,
    },
    rewardSummary: [
      '+UGX 15M Angel Syndicate Co-Investment',
      '+150 Operating Experience (XP)',
      '+4 Market Reputation',
    ],
  },
  {
    id: 'nw_1b_billionaire',
    title: 'UGX Billionaire Club',
    subtitle: 'Reach UGX 1,000,000,000 Total Net Worth',
    description:
      'Cross the UGX 1 Billion net worth threshold to qualify for preferential private banking mortgage interest rates.',
    triggerType: 'NET_WORTH',
    thresholdValue: 1000000000,
    badgeLabel: 'UGX 1B Club',
    rewards: {
      cashBonusUGX: 40000000,
      interestRateDiscount: 0.01,
      experienceBonus: 250,
    },
    rewardSummary: [
      '+UGX 40M Equity Milestone Dividend',
      '-1.0% p.a. Preferred Mortgage Interest Rate',
      '+250 Operating Experience (XP)',
    ],
  },
  {
    id: 'nw_2_5b_skyline',
    title: 'Kampala Skyline Syndicate',
    subtitle: 'Reach UGX 2,500,000,000 Total Net Worth',
    description:
      'Major commercial banks cut loan origination fees in half for your high-net-worth property holdings.',
    triggerType: 'NET_WORTH',
    thresholdValue: 2500000000,
    badgeLabel: 'UGX 2.5B Equity',
    rewards: {
      cashBonusUGX: 90000000,
      originationFeeDiscount: 0.0075,
      experienceBonus: 350,
    },
    rewardSummary: [
      '+UGX 90M Institutional Joint Venture Grant',
      '50% Loan Origination Fee Waiver (0.75% Fee)',
      '+350 Operating Experience (XP)',
    ],
  },
  {
    id: 'nw_5b_titan',
    title: 'East African Empire Titan',
    subtitle: 'Reach UGX 5,000,000,000 Total Net Worth',
    description:
      'Establish a UGX 5 Billion real estate empire, commanding elite credit spreads and maximum contractor discounts.',
    triggerType: 'NET_WORTH',
    thresholdValue: 5000000000,
    badgeLabel: 'UGX 5B Titan',
    rewards: {
      cashBonusUGX: 200000000,
      interestRateDiscount: 0.015,
      constructionDiscountRate: 0.05,
      reputationBonus: 15,
    },
    rewardSummary: [
      '+UGX 200M Sovereign Growth Dividend',
      '-1.5% p.a. Institutional Credit Discount',
      '+5% Extra Construction Material Discount',
    ],
  },
];
