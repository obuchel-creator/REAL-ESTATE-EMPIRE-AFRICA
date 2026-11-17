import test from 'node:test';
import assert from 'node:assert/strict';
import { FinanceManager } from '../engine/FinanceManager';
import { SaveManager } from '../engine/SaveManager';
import { OwnedProperty, GameState } from '../types';

test('FinanceManager: calculateMonthlyPayment returns expected amortization', () => {
  const principal = 100000000; // 100M UGX
  const rate = 0.18; // 18% p.a.
  const tenor = 60; // 5 years
  const payment = FinanceManager.calculateMonthlyPayment(principal, rate, tenor);

  // Expected ~2,539,343 UGX
  assert.ok(payment > 2500000 && payment < 2600000);
});

test('FinanceManager: takeOutLoan creates active mortgage facility with correct principal and rate', () => {
  const state = SaveManager.createInitialGameState();
  
  // Add a verified property as collateral
  const testProp: OwnedProperty = {
    id: 'prop_test_1',
    title: 'Kololo Residential Land',
    locationId: 'kololo',
    tenureType: 'FREEHOLD',
    zoneTier: 'PRIME',
    sizeDecimals: 20,
    purchasePriceUGX: 600000000,
    currentValuationUGX: 650000000,
    purchaseDateStr: '2026-01-01',
    status: 'Raw Land',
    monthlyRentalIncomeUGX: 0,
    occupancyRate: 0,
    titleVerified: true,
    kibanjaCleared: true,
    kibanjaClearanceCostUGX: 0,
    maxLtvRatio: 0.75,
  };
  state.properties = [testProp];
  state.cashUGX = 100000000;

  const requestedAmount = 200000000; // 200M UGX
  const tenorMonths = 60;
  const result = FinanceManager.takeOutLoan(state, testProp.id, 'CONSTRUCTION_FACILITY', requestedAmount, tenorMonths);

  assert.equal(result.success, true);
  assert.equal(result.newGameState.loans.length, 1);
  const loan = result.newGameState.loans[0];
  assert.equal(loan.propertyId, testProp.id);
  assert.equal(loan.principalUGX, requestedAmount);
  assert.equal(loan.remainingBalanceUGX, requestedAmount);
  assert.equal(loan.interestRateAnnual, 0.19); // 19% for construction
  assert.equal(loan.status, 'ACTIVE');
  
  // 1.5% fee = 3,000,000 UGX. Net disbursal = 197,000,000 UGX
  assert.equal(result.newGameState.cashUGX, 100000000 + 197000000);
  assert.equal(result.newGameState.liabilitiesUGX, requestedAmount);
});

test('FinanceManager: repayLoanEarly reduces remaining principal and liabilities', () => {
  const state = SaveManager.createInitialGameState();
  const testProp: OwnedProperty = {
    id: 'prop_test_2',
    title: 'Ntinda Commercial Plot',
    locationId: 'ntinda',
    tenureType: 'FREEHOLD',
    zoneTier: 'PRIME',
    sizeDecimals: 15,
    purchasePriceUGX: 400000000,
    currentValuationUGX: 450000000,
    purchaseDateStr: '2026-01-01',
    status: 'Raw Land',
    monthlyRentalIncomeUGX: 0,
    occupancyRate: 0,
    titleVerified: true,
    kibanjaCleared: true,
    kibanjaClearanceCostUGX: 0,
    maxLtvRatio: 0.75,
  };
  state.properties = [testProp];
  state.cashUGX = 200000000;

  // Take out loan of 100M
  const loanResult = FinanceManager.takeOutLoan(state, testProp.id, 'EQUITY_RELEASE', 100000000, 36);
  assert.equal(loanResult.success, true);
  const loanId = loanResult.newGameState.loans[0].id;
  const cashBeforeRepayment = loanResult.newGameState.cashUGX;

  // Repay 40M early
  const repayResult = FinanceManager.repayLoanEarly(loanResult.newGameState, loanId, 40000000);
  assert.equal(repayResult.success, true);
  const updatedLoan = repayResult.newGameState.loans.find(l => l.id === loanId);
  assert.ok(updatedLoan);
  assert.equal(updatedLoan?.remainingBalanceUGX, 60000000);
  assert.equal(updatedLoan?.status, 'ACTIVE');
  assert.equal(repayResult.newGameState.cashUGX, cashBeforeRepayment - 40000000);
  assert.equal(repayResult.newGameState.liabilitiesUGX, 60000000);

  // Pay off remaining 60M
  const payoffResult = FinanceManager.repayLoanEarly(repayResult.newGameState, loanId, 60000000);
  assert.equal(payoffResult.success, true);
  const paidLoan = payoffResult.newGameState.loans.find(l => l.id === loanId);
  assert.equal(paidLoan?.remainingBalanceUGX, 0);
  assert.equal(paidLoan?.status, 'PAID');
  assert.equal(payoffResult.newGameState.liabilitiesUGX, 0);
});

test('FinanceManager: processMonthlyLoans handles servicing and amortizes balance', () => {
  const state = SaveManager.createInitialGameState();
  const testProp: OwnedProperty = {
    id: 'prop_test_3',
    title: 'Kira Villa Parcel',
    locationId: 'kira',
    tenureType: 'FREEHOLD',
    zoneTier: 'RESIDENTIAL',
    sizeDecimals: 15,
    purchasePriceUGX: 300000000,
    currentValuationUGX: 350000000,
    purchaseDateStr: '2026-01-01',
    status: 'Raw Land',
    monthlyRentalIncomeUGX: 0,
    occupancyRate: 0,
    titleVerified: true,
    kibanjaCleared: true,
    kibanjaClearanceCostUGX: 0,
    maxLtvRatio: 0.75,
  };
  state.properties = [testProp];
  state.cashUGX = 100000000;

  const loanResult = FinanceManager.takeOutLoan(state, testProp.id, 'LAND_ACQUISITION', 50000000, 24);
  assert.equal(loanResult.success, true);

  const monthResult = FinanceManager.processMonthlyLoans(loanResult.newGameState);
  const loan = monthResult.newGameState.loans[0];
  assert.equal(loan.monthsPaid, 1);
  assert.ok(loan.remainingBalanceUGX < 50000000);
  assert.ok(monthResult.messages.length > 0);
});
