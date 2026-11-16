import { FinancialTransaction, TransactionType, OwnedProperty } from '../types';

export class FinanceManager {
  /**
   * Records a financial transaction ensuring strict integer arithmetic and balance verification.
   * Throws an error if an expense exceeds available cash without credit or if amount is invalid.
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
   * Calculates total asset valuation across all owned properties.
   */
  static calculateTotalAssets(properties: OwnedProperty[], currentCash: number): number {
    const propertyValueSum = properties.reduce((acc, p) => acc + Math.round(p.currentValuationUGX), 0);
    return Math.round(currentCash + propertyValueSum);
  }

  /**
   * Calculates net worth: Assets minus Liabilities.
   */
  static calculateNetWorth(totalAssets: number, totalLiabilities: number): number {
    return Math.round(totalAssets - totalLiabilities);
  }

  /**
   * Validates financial invariants across game state.
   */
  static validateInvariants(cash: number, liabilities: number, properties: OwnedProperty[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!Number.isInteger(cash)) {
      errors.push('Cash balance must be an integer.');
    }
    if (cash < -1000000000) {
      errors.push('Cash balance exceeds negative debt floor limits.');
    }
    for (const p of properties) {
      if (p.currentValuationUGX < 0) {
        errors.push(`Property ${p.id} has negative valuation.`);
      }
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
