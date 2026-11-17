import test from 'node:test';
import assert from 'node:assert/strict';
import { TenantManager } from '../engine/TenantManager';
import { SaveManager } from '../engine/SaveManager';
import { OwnedProperty, TenantLease } from '../types';

test('TenantManager: generateApplicants creates valid Ugandan lease applicants', () => {
  const prop: OwnedProperty = {
    id: 'prop_test_rent',
    title: 'Kololo Heights Luxury Apartments',
    locationId: 'kololo',
    tenureType: 'FREEHOLD',
    zoneTier: 'PRIME',
    sizeDecimals: 25,
    purchasePriceUGX: 700000000,
    currentValuationUGX: 900000000,
    purchaseDateStr: '2026-01-01',
    status: 'Completed',
    monthlyRentalIncomeUGX: 12000000,
    occupancyRate: 0,
    titleVerified: true,
    kibanjaCleared: true,
    kibanjaClearanceCostUGX: 0,
    maxLtvRatio: 0.75,
  };

  const applicants = TenantManager.generateApplicants(prop, 4);
  assert.equal(applicants.length, 4);
  assert.ok(applicants[0].monthlyRentUGX > 0);
  assert.equal(applicants[0].depositUGX, applicants[0].monthlyRentUGX * 2);
  assert.equal(applicants[0].status, 'PENDING');
  assert.ok(applicants[0].paymentReliability >= 0.85);
});

test('TenantManager: signLease collects deposit and registers active tenant', () => {
  const state = SaveManager.createInitialGameState();
  const prop: OwnedProperty = {
    id: 'prop_test_sign',
    title: 'Ntinda Apartments',
    locationId: 'ntinda',
    tenureType: 'FREEHOLD',
    zoneTier: 'RESIDENTIAL',
    sizeDecimals: 15,
    purchasePriceUGX: 300000000,
    currentValuationUGX: 400000000,
    purchaseDateStr: '2026-01-01',
    status: 'Completed',
    monthlyRentalIncomeUGX: 0,
    occupancyRate: 0,
    titleVerified: true,
    kibanjaCleared: true,
    kibanjaClearanceCostUGX: 0,
    maxLtvRatio: 0.75,
  };
  state.properties = [prop];
  state.cashUGX = 50000000;

  const applicant: TenantLease = {
    id: 'app_1',
    propertyId: prop.id,
    unitName: 'Unit 1A',
    tenantName: 'Dr. Ronald Sentamu',
    tenantCategory: 'Individual Resident',
    monthlyRentUGX: 3000000,
    depositUGX: 6000000,
    leaseStartStr: '2026-01-01',
    leaseDurationMonths: 12,
    monthsRemaining: 12,
    paymentReliability: 1.0,
    status: 'PENDING',
    contactPhone: '+256 701234567',
    missedMonths: 0,
  };

  const result = TenantManager.signLease(state, applicant);
  assert.equal(result.success, true);
  assert.equal(result.newGameState.tenants?.length, 1);
  assert.equal(result.newGameState.cashUGX, 50000000 + 6000000); // collected 6M deposit
  assert.equal(result.newGameState.properties[0].status, 'Rented');
});

test('TenantManager: processMonthlyRent collects rent and updates revenue', () => {
  const state = SaveManager.createInitialGameState();
  const prop: OwnedProperty = {
    id: 'prop_test_collect',
    title: 'Bukoto Commercial Center',
    locationId: 'bukoto',
    tenureType: 'FREEHOLD',
    zoneTier: 'PRIME',
    sizeDecimals: 20,
    purchasePriceUGX: 500000000,
    currentValuationUGX: 600000000,
    purchaseDateStr: '2026-01-01',
    status: 'Rented',
    monthlyRentalIncomeUGX: 5000000,
    occupancyRate: 0.5,
    titleVerified: true,
    kibanjaCleared: true,
    kibanjaClearanceCostUGX: 0,
    maxLtvRatio: 0.75,
  };
  state.properties = [prop];
  state.cashUGX = 10000000;
  state.tenants = [
    {
      id: 'lease_collect_1',
      propertyId: prop.id,
      unitName: 'Suite 101',
      tenantName: 'AfriTech Solutions Uganda',
      tenantCategory: 'Corporate Commercial',
      monthlyRentUGX: 5000000,
      depositUGX: 10000000,
      leaseStartStr: '2026-01-01',
      leaseDurationMonths: 12,
      monthsRemaining: 12,
      paymentReliability: 1.0, // 100% reliable for deterministic test
      status: 'ACTIVE',
      contactPhone: '+256 709999999',
      missedMonths: 0,
    },
  ];

  const result = TenantManager.processMonthlyRent(state);
  assert.equal(result.totalCollectedUGX, 5000000);
  assert.equal(result.newGameState.cashUGX, 15000000);
  assert.equal(result.newGameState.tenants?.[0].monthsRemaining, 11);
});
