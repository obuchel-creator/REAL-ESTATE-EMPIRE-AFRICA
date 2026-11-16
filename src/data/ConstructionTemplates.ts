import { ConstructionTemplate } from '../types';

export const CONSTRUCTION_TEMPLATES: ConstructionTemplate[] = [
  {
    id: 'muzigo_block',
    name: 'Rental Muzigo Block (6 Doors)',
    description: 'Standard affordable rental block popular in Kampala and Wakiso suburbs. High recurring rental demand.',
    finishTier: 'Standard (Muzigo)',
    costPerM2UGX: 1800000, // UGX 1.8M per m²
    totalAreaM2: 150,
    totalCostUGX: 270000000, // 270M UGX
    durationMonths: 6,
    targetUnits: 6,
    projectedMonthlyRentUGX: 3600000, // UGX 600k per door
    stageCostsUGX: {
      planApproval: 15000000,
      foundation: 60000000,
      wallingRoofing: 90000000,
      finishing: 90000000,
      occupationPermit: 15000000,
    },
  },
  {
    id: 'apartment_block',
    name: 'Middle-Income Apartment Block (12 Units)',
    description: 'Multi-story residential apartment complex with parking, security wall, and modern amenities.',
    finishTier: 'Mid-Range Apartments',
    costPerM2UGX: 2800000, // UGX 2.8M per m²
    totalAreaM2: 450,
    totalCostUGX: 1260000000, // 1.26B UGX
    durationMonths: 12,
    targetUnits: 12,
    projectedMonthlyRentUGX: 18000000, // UGX 1.5M per unit
    stageCostsUGX: {
      planApproval: 60000000,
      foundation: 300000000,
      wallingRoofing: 450000000,
      finishing: 380000000,
      occupationPermit: 70000000,
    },
  },
  {
    id: 'executive_townhouse',
    name: 'Executive Townhouse Gated Duplex',
    description: 'Luxury executive duplex for high-end families and expatriates in Kololo, Nakasero, or Bukoto.',
    finishTier: 'Executive Townhouse',
    costPerM2UGX: 3500000, // UGX 3.5M per m²
    totalAreaM2: 300,
    totalCostUGX: 1050000000, // 1.05B UGX
    durationMonths: 9,
    targetUnits: 2,
    projectedMonthlyRentUGX: 12000000, // UGX 6M per townhouse
    stageCostsUGX: {
      planApproval: 50000000,
      foundation: 250000000,
      wallingRoofing: 350000000,
      finishing: 330000000,
      occupationPermit: 70000000,
    },
  },
  {
    id: 'commercial_plaza',
    name: 'Commercial Retail & Office Plaza',
    description: 'Prime commercial plaza with ground-floor retail shops and upper-floor corporate office suites.',
    finishTier: 'Luxury Commercial Plaza',
    costPerM2UGX: 4500000, // UGX 4.5M per m²
    totalAreaM2: 800,
    totalCostUGX: 3600000000, // 3.6B UGX
    durationMonths: 18,
    targetUnits: 20,
    projectedMonthlyRentUGX: 60000000, // High commercial yield
    stageCostsUGX: {
      planApproval: 180000000,
      foundation: 900000000,
      wallingRoofing: 1200000000,
      finishing: 1100000000,
      occupationPermit: 220000000,
    },
  },
];
