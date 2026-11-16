import { FinancialTransaction, TransactionType, OwnedProperty, LoanFacility, LoanType, UraTaxRecord, TaxComplianceStatus } from '../types';

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
