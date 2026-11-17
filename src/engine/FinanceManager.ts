import { FinancialTransaction, TransactionType, OwnedProperty, LoanFacility, LoanType, UraTaxRecord, TaxComplianceStatus, GameState } from '../types';
import { MilestonePerks } from './MilestonePerks';

export class FinanceManager {
  /**
   * Records a financial transaction ensuring strict integer arithmetic and balance verification.
   */
  static recordTransaction(
    currentCash: number,
    transactions: FinancialTransaction[],
    type: TransactionType,
    description: string,
    amountUGX: number,
    entityReference?: string,
    allowCredit: boolean = false
  ): { success: boolean; newCash: number; newTransactions: FinancialTransaction[]; error?: string } {
    if (!Number.isFinite(currentCash)) {
      return { success: false, newCash: 0, newTransactions: transactions, error: 'Invalid current cash balance (NaN or Infinity).' };
    }

    if (!Number.isFinite(amountUGX)) {
      return { success: false, newCash: currentCash, newTransactions: transactions, error: 'Invalid transaction amount (NaN or Infinity).' };
    }

    const roundedAmount = Math.round(amountUGX);
    const previousBalance = Math.round(currentCash);

    if (roundedAmount === 0) {
      return { success: false, newCash: previousBalance, newTransactions: transactions, error: 'Transaction amount cannot be zero.' };
    }

    const newBalance = previousBalance + roundedAmount;

    if (!allowCredit && newBalance < 0) {
      return {
        success: false,
        newCash: previousBalance,
        newTransactions: transactions,
        error: `Insufficient funds. Required outflow of UGX ${Math.abs(roundedAmount).toLocaleString()} exceeds available cash of UGX ${previousBalance.toLocaleString()}.`,
      };
    }

    const newTx: FinancialTransaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      dateStr: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      type,
      description,
      amountUGX: roundedAmount,
      previousBalanceUGX: previousBalance,
      newBalanceUGX: newBalance,
      entityReference,
    };

    return {
      success: true,
      newCash: newBalance,
      newTransactions: [newTx, ...transactions],
    };
  }

  /**
   * Calculates monthly mortgage / loan payment using amortization formula: P * r * (1+r)^n / ((1+r)^n - 1)
   */
  static calculateMonthlyPayment(principal: number, annualInterestRate: number, tenorMonths: number): number {
    if (principal <= 0 || tenorMonths <= 0) return 0;
    if (annualInterestRate <= 0) return Math.round(principal / tenorMonths);
    const r = annualInterestRate / 12;
    const numerator = principal * r * Math.pow(1 + r, tenorMonths);
    const denominator = Math.pow(1 + r, tenorMonths) - 1;
    return Math.round(numerator / denominator);
  }

  /**
   * Calculates total liabilities from active loans.
   */
  static calculateTotalLiabilities(loans: LoanFacility[]): number {
    return loans
      .filter((l) => l.status === 'ACTIVE')
      .reduce((acc, l) => acc + Math.round(l.remainingBalanceUGX), 0);
  }

  /**
   * Calculates total asset valuation across all owned properties plus liquid cash.
   */
  static calculateTotalAssets(properties: OwnedProperty[], currentCash: number): number {
    if (!Number.isFinite(currentCash)) return 0;
    const propertyValueSum = properties.reduce((acc, p) => acc + (Number.isFinite(p.currentValuationUGX) ? Math.round(p.currentValuationUGX) : 0), 0);
    return Math.round(currentCash + propertyValueSum);
  }

  /**
   * Calculates net worth: Assets minus Liabilities.
   */
  static calculateNetWorth(totalAssets: number, totalLiabilities: number): number {
    const assets = Number.isFinite(totalAssets) ? totalAssets : 0;
    const liabilities = Number.isFinite(totalLiabilities) ? totalLiabilities : 0;
    return Math.round(assets - liabilities);
  }

  /**
   * Calculates URA Rental Income Tax (Uganda Revenue Authority):
   * Gross rental income minus 20% statutory expense deduction = Net taxable rental income.
   * Tax rate: 20% on net rental income exceeding threshold.
   */
  static calculateUraRentalTax(grossAnnualRentalIncome: number): { deductibleExpenses: number; taxableIncome: number; taxDue: number } {
    const gross = Math.max(0, Math.round(grossAnnualRentalIncome));
    const deductibleExpenses = Math.round(gross * 0.20); // 20% statutory expense allowance for repairs/management
    const taxableIncome = Math.max(0, gross - deductibleExpenses);
    const taxDue = Math.round(taxableIncome * 0.20); // 20% URA rental income tax rate
    return { deductibleExpenses, taxableIncome, taxDue };
  }

  /**
   * Takes out a mortgage or property development loan facility.
   */
  static takeOutLoan(
    gameState: GameState,
    propertyId: string,
    loanType: LoanType,
    requestedAmountUGX: number,
    tenorMonths: number
  ): { success: boolean; newGameState: GameState; error?: string } {
    const property = gameState.properties.find((p) => p.id === propertyId);
    if (!property) {
      return { success: false, newGameState: gameState, error: 'Selected property collateral not found.' };
    }

    if (!property.titleVerified && loanType !== 'LAND_ACQUISITION') {
      return { success: false, newGameState: gameState, error: 'Property title must be verified at Ministry of Lands before applying for construction or equity development mortgages.' };
    }

    if (gameState.taxComplianceStatus === 'PENALIZED' || gameState.taxComplianceStatus === 'AUDIT_FLAGGED') {
      return { success: false, newGameState: gameState, error: 'Commercial banks have frozen loan facilities due to unresolved URA tax compliance penalties.' };
    }

    const effectiveLtv = MilestonePerks.getEffectivePropertyLtv(property.maxLtvRatio, gameState.unlockedMilestones);
    const maxBorrowingPower = Math.round(property.currentValuationUGX * effectiveLtv);
    if (requestedAmountUGX > maxBorrowingPower) {
      return {
        success: false,
        newGameState: gameState,
        error: `Requested loan of UGX ${requestedAmountUGX.toLocaleString()} exceeds property LTV borrowing power of UGX ${maxBorrowingPower.toLocaleString()} (${(effectiveLtv * 100).toFixed(0)}% LTV).`,
      };
    }

    const baseAnnualInterestRate = loanType === 'CONSTRUCTION_FACILITY' ? 0.19 : loanType === 'LAND_ACQUISITION' ? 0.21 : 0.17;
    const { effectiveAnnualRate: annualInterestRate, originationFeeRate } = MilestonePerks.getEffectiveLoanTerms(
      baseAnnualInterestRate,
      gameState.unlockedMilestones
    );
    const originationFeeUGX = Math.round(requestedAmountUGX * originationFeeRate);
    const monthlyPaymentUGX = FinanceManager.calculateMonthlyPayment(requestedAmountUGX, annualInterestRate, tenorMonths);
    const netDisbursalUGX = requestedAmountUGX - originationFeeUGX;

    const txRes = FinanceManager.recordTransaction(
      gameState.cashUGX,
      gameState.transactions,
      'LOAN',
      `Commercial Mortgage Disbursal (${loanType}) secured on ${property.title} (Fee: UGX ${originationFeeUGX.toLocaleString()})`,
      netDisbursalUGX,
      property.id,
      true
    );

    if (!txRes.success) {
      return { success: false, newGameState: gameState, error: txRes.error || 'Failed to disburse loan funds.' };
    }

    const newLoan: LoanFacility = {
      id: 'loan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      propertyId: property.id,
      loanType,
      principalUGX: requestedAmountUGX,
      remainingBalanceUGX: requestedAmountUGX,
      interestRateAnnual: annualInterestRate,
      monthlyPaymentUGX,
      tenorMonths,
      monthsPaid: 0,
      status: 'ACTIVE',
      originationFeeUGX,
    };

    const newLoans = [...gameState.loans, newLoan];
    const newLiabilities = FinanceManager.calculateTotalLiabilities(newLoans);

    const updatedState: GameState = {
      ...gameState,
      cashUGX: txRes.newCash,
      transactions: txRes.newTransactions,
      loans: newLoans,
      liabilitiesUGX: newLiabilities,
    };

    return { success: true, newGameState: updatedState };
  }

  /**
   * Processes monthly loan amortizations, interest accruals, and repayments for active loan facilities.
   */
  static processMonthlyLoans(gameState: GameState): { newGameState: GameState; messages: string[] } {
    let currentCash = gameState.cashUGX;
    let transactions = [...gameState.transactions];
    const messages: string[] = [];

    const updatedLoans = gameState.loans.map((loan) => {
      if (loan.status !== 'ACTIVE') return loan;

      const monthlyInterest = Math.round(loan.remainingBalanceUGX * (loan.interestRateAnnual / 12));
      const monthlyPrincipal = Math.max(0, loan.monthlyPaymentUGX - monthlyInterest);
      const totalDue = loan.monthlyPaymentUGX;

      const txRes = FinanceManager.recordTransaction(
        currentCash,
        transactions,
        'LOAN',
        `Monthly Mortgage Servicing (${loan.loanType} - Remaining: UGX ${loan.remainingBalanceUGX.toLocaleString()})`,
        -totalDue,
        loan.propertyId,
        true
      );

      currentCash = txRes.newCash;
      transactions = txRes.newTransactions;

      const newRemainingBalance = Math.max(0, loan.remainingBalanceUGX - monthlyPrincipal);
      const newMonthsPaid = loan.monthsPaid + 1;
      const isPaidOff = newRemainingBalance <= 0 || newMonthsPaid >= loan.tenorMonths;

      messages.push(`Serviced loan ${loan.loanType}: Paid UGX ${totalDue.toLocaleString()} (Principal: UGX ${monthlyPrincipal.toLocaleString()}, Interest: UGX ${monthlyInterest.toLocaleString()}).`);

      return {
        ...loan,
        remainingBalanceUGX: isPaidOff ? 0 : newRemainingBalance,
        monthsPaid: newMonthsPaid,
        status: (isPaidOff ? 'PAID' : 'ACTIVE') as ('ACTIVE' | 'PAID' | 'DEFAULTED'),
      };
    });

    const newLiabilities = FinanceManager.calculateTotalLiabilities(updatedLoans);

    return {
      newGameState: {
        ...gameState,
        cashUGX: currentCash,
        transactions,
        loans: updatedLoans,
        liabilitiesUGX: newLiabilities,
      },
      messages,
    };
  }

  /**
   * Repays or pays off a loan facility early.
   */
  static repayLoanEarly(
    gameState: GameState,
    loanId: string,
    repaymentAmountUGX: number
  ): { success: boolean; newGameState: GameState; error?: string } {
    const loan = gameState.loans.find((l) => l.id === loanId);
    if (!loan || loan.status !== 'ACTIVE') {
      return { success: false, newGameState: gameState, error: 'Active loan facility not found.' };
    }

    const amountToPay = Math.min(repaymentAmountUGX, loan.remainingBalanceUGX);
    if (amountToPay <= 0) {
      return { success: false, newGameState: gameState, error: 'Repayment amount must be greater than zero.' };
    }

    const txRes = FinanceManager.recordTransaction(
      gameState.cashUGX,
      gameState.transactions,
      'LOAN',
      `Early Mortgage Principal Repayment (${loan.loanType})`,
      -amountToPay,
      loan.propertyId,
      false
    );

    if (!txRes.success) {
      return { success: false, newGameState: gameState, error: txRes.error || 'Insufficient funds for loan repayment.' };
    }

    const newRemainingBalance = Math.max(0, loan.remainingBalanceUGX - amountToPay);
    const isPaidOff = newRemainingBalance === 0;

    const updatedLoans = gameState.loans.map((l) =>
      l.id === loanId
        ? {
            ...l,
            remainingBalanceUGX: newRemainingBalance,
            status: (isPaidOff ? 'PAID' : 'ACTIVE') as ('ACTIVE' | 'PAID' | 'DEFAULTED'),
          }
        : l
    );

    const newLiabilities = FinanceManager.calculateTotalLiabilities(updatedLoans);

    return {
      success: true,
      newGameState: {
        ...gameState,
        cashUGX: txRes.newCash,
        transactions: txRes.newTransactions,
        loans: updatedLoans,
        liabilitiesUGX: newLiabilities,
      },
    };
  }

  /**
   * Validates financial invariants across game state.
   */
  static validateInvariants(cash: number, liabilities: number, properties: OwnedProperty[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!Number.isInteger(cash) || !Number.isFinite(cash)) {
      errors.push('Cash balance must be a valid finite integer.');
    }
    if (!Number.isFinite(liabilities) || liabilities < 0) {
      errors.push('Liabilities must be a valid non-negative number.');
    }
    if (cash < -2000000000) {
      errors.push('Cash balance exceeds negative debt floor limits (-2 Billion UGX).');
    }
    for (const p of properties) {
      if (!Number.isFinite(p.currentValuationUGX) || p.currentValuationUGX < 0) {
        errors.push(`Property ${p.id} has invalid or negative valuation.`);
      }
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
