import React, { useState } from 'react';
import { Wallet, TrendingUp, Building2, AlertCircle, CheckCircle, Landmark, FileText, CreditCard, ChevronDown, ChevronUp, Percent, Calendar } from 'lucide-react';
import { GameState, LoanFacility, LoanType, UraTaxRecord } from '../types';
import { formatUGX } from '../data/UgandaConfig';
import { FinanceManager } from '../engine/FinanceManager';

interface FinanceViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ gameState, setGameState }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(gameState.properties[0]?.id || '');
  const [loanType, setLoanType] = useState<LoanType>('EQUITY_RELEASE');
  const [requestedLoanUGX, setRequestedLoanUGX] = useState<number>(50000000); // 50M UGX default
  const [tenorMonths, setTenorMonths] = useState<number>(60); // 5 years
  const [notification, setNotification] = useState<{ message: string; success: boolean } | null>(null);
  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null);
  const [customRepayAmount, setCustomRepayAmount] = useState<number>(10000000);

  const totalAssets = FinanceManager.calculateTotalAssets(gameState.properties, gameState.cashUGX);
  const totalLiabilities = FinanceManager.calculateTotalLiabilities(gameState.loans);
  const netWorth = FinanceManager.calculateNetWorth(totalAssets, totalLiabilities);

  const selectedProperty = gameState.properties.find((p) => p.id === selectedPropertyId);
  const maxBorrowingPower = selectedProperty ? Math.round(selectedProperty.currentValuationUGX * selectedProperty.maxLtvRatio) : 0;

  const currentRate = loanType === 'CONSTRUCTION_FACILITY' ? 0.19 : loanType === 'LAND_ACQUISITION' ? 0.21 : 0.17;
  const currentOriginationFee = Math.round(requestedLoanUGX * 0.015);
  const estimatedMonthlyPayment = FinanceManager.calculateMonthlyPayment(requestedLoanUGX, currentRate, tenorMonths);
  const netDisbursal = requestedLoanUGX - currentOriginationFee;

  const handleApplyLoan = () => {
    const res = FinanceManager.takeOutLoan(gameState, selectedPropertyId, loanType, requestedLoanUGX, tenorMonths);
    if (!res.success) {
      setNotification({ message: res.error || 'Loan application failed.', success: false });
    } else {
      setGameState(res.newGameState);
      setNotification({
        message: `Successfully secured loan facility of ${formatUGX(requestedLoanUGX)} with monthly installment of ${formatUGX(estimatedMonthlyPayment)}!`,
        success: true,
      });
    }
  };

  const handleRepayEarly = (loanId: string, amount: number) => {
    const res = FinanceManager.repayLoanEarly(gameState, loanId, amount);
    if (!res.success) {
      setNotification({ message: res.error || 'Loan repayment failed.', success: false });
    } else {
      setGameState(res.newGameState);
      setNotification({ message: `Successfully repaid ${formatUGX(amount)} towards loan principal!`, success: true });
      setRepayingLoanId(null);
    }
  };

  const handlePayUraTax = (recordId: string) => {
    let msg = '';
    let success = false;

    setGameState((prev) => {
      const rec = prev.uraTaxRecords.find((r) => r.id === recordId);
      if (!rec || rec.isPaid) {
        msg = 'Tax record already paid or not found.';
        return prev;
      }

      const totalDue = rec.taxDueUGX + rec.penaltyUGX;
      const res = FinanceManager.recordTransaction(
        prev.cashUGX,
        prev.transactions,
        'TAX',
        `URA Rental Income Tax & Penalty Payment (${rec.periodStr})`,
        -totalDue
      );

      if (!res.success) {
        msg = res.error || 'Insufficient funds to pay URA tax assessment.';
        return prev;
      }

      success = true;
      msg = `Successfully paid URA tax of ${formatUGX(totalDue)}! Compliance status restored to COMPLIANT.`;

      const updatedRecords = prev.uraTaxRecords.map((r) => (r.id === recordId ? { ...r, isPaid: true } : r));

      return {
        ...prev,
        cashUGX: res.newCash,
        transactions: res.newTransactions,
        uraTaxRecords: updatedRecords,
        taxComplianceStatus: 'COMPLIANT',
      };
    });

    setNotification({ message: msg, success });
  };

  const activeLoans = gameState.loans.filter((l) => l.status === 'ACTIVE');

  const getLoanTypeLabel = (type: LoanType): string => {
    switch (type) {
      case 'CONSTRUCTION_FACILITY':
        return 'Construction Development Facility';
      case 'LAND_ACQUISITION':
        return 'Land Acquisition Loan';
      case 'EQUITY_RELEASE':
      default:
        return 'Equity Release Mortgage';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Ugandan Commercial Banking & URA Tax Desk</h2>
        <p className="text-sm text-slate-400">
          Manage mortgage facilities, land acquisition loans, and Uganda Revenue Authority (URA) rental income tax compliance.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${notification.success ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/50 border-rose-500/30 text-rose-300'}`}>
          {notification.success ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Assets</span>
          <div className="text-2xl font-bold font-mono text-white">{formatUGX(totalAssets)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Debt / Liabilities</span>
          <div className="text-2xl font-bold font-mono text-rose-400">{formatUGX(totalLiabilities)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Net Worth</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{formatUGX(netWorth)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banking & Credit Desk */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Commercial Banking & Credit Desk</h3>
              <p className="text-xs text-slate-400">Apply for collateralized UGX credit facilities</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Select Collateral Property</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {gameState.properties.length === 0 ? (
                  <option value="">No properties owned - acquire land first</option>
                ) : (
                  gameState.properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.tenureType} · Valuation: {formatUGX(p.currentValuationUGX)})
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedProperty && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Max LTV Ratio:</span>
                  <span className="text-emerald-400 font-mono">{(selectedProperty.maxLtvRatio * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Borrowing Power (Valuation × LTV):</span>
                  <span className="text-white font-mono font-bold">{formatUGX(maxBorrowingPower)}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Facility Type</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value as LoanType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="EQUITY_RELEASE">Equity Release Mortgage (17.0% p.a.)</option>
                  <option value="CONSTRUCTION_FACILITY">Construction Development Facility (19.0% p.a.)</option>
                  <option value="LAND_ACQUISITION">Land Acquisition Loan (21.0% p.a.)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Requested Amount (UGX)</label>
                <input
                  type="number"
                  step="5000000"
                  value={requestedLoanUGX}
                  onChange={(e) => setRequestedLoanUGX(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Loan Tenor (Months)</label>
                <select
                  value={tenorMonths}
                  onChange={(e) => setTenorMonths(parseInt(e.target.value) || 60)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                  <option value={60}>60 Months (5 Years)</option>
                  <option value={120}>120 Months (10 Years)</option>
                </select>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs flex flex-col justify-center">
                <span className="text-slate-400 text-[10px]">Estimated Monthly Payment</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">{formatUGX(estimatedMonthlyPayment)}</span>
                <span className="text-slate-500 text-[10px]">Origination fee: {formatUGX(currentOriginationFee)}</span>
              </div>
            </div>

            <button
              onClick={handleApplyLoan}
              disabled={gameState.properties.length === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              Apply for Bank Loan Facility
            </button>
          </div>

          {/* Active Mortgages & Loan Facilities */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Mortgages & Credit Facilities ({activeLoans.length})
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Total Debt: <strong className="text-rose-400">{formatUGX(totalLiabilities)}</strong>
              </span>
            </div>

            {activeLoans.length === 0 ? (
              <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-lg p-5 text-center space-y-1">
                <p className="text-xs text-slate-400 font-medium">No active commercial mortgages or loans.</p>
                <p className="text-[11px] text-slate-500">
                  Select an owned property with a verified title above to take out a construction or equity mortgage facility.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeLoans.map((loan) => {
                  const collateralProp = gameState.properties.find((p) => p.id === loan.propertyId);
                  const isRepaying = repayingLoanId === loan.id;
                  const progressPct = Math.min(100, Math.round(((loan.principalUGX - loan.remainingBalanceUGX) / loan.principalUGX) * 100));
                  const maxRepayable = Math.min(loan.remainingBalanceUGX, gameState.cashUGX);

                  return (
                    <div
                      key={loan.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-xs transition-all hover:border-slate-700"
                    >
                      {/* Top Bar: Loan Type & Collateral */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs tracking-tight">
                              {getLoanTypeLabel(loan.loanType)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                              ACTIVE
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Collateral: <strong className="text-slate-300">{collateralProp ? collateralProp.title : 'Owned Property'}</strong>
                            {collateralProp && ` (${collateralProp.tenureType})`}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Remaining Principal</span>
                          <span className="text-base font-bold font-mono text-rose-400">
                            {formatUGX(loan.remainingBalanceUGX)}
                          </span>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Interest Rate</span>
                          <span className="font-mono font-semibold text-emerald-400 text-xs">
                            {(loan.interestRateAnnual * 100).toFixed(1)}% p.a.
                          </span>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Monthly Installment</span>
                          <span className="font-mono font-semibold text-white text-xs">
                            {formatUGX(loan.monthlyPaymentUGX)}
                          </span>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Original Loan</span>
                          <span className="font-mono font-semibold text-slate-300 text-xs">
                            {formatUGX(loan.principalUGX)}
                          </span>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Tenor Progress</span>
                          <span className="font-mono font-semibold text-slate-300 text-xs">
                            {loan.monthsPaid} / {loan.tenorMonths} mo
                          </span>
                        </div>
                      </div>

                      {/* Principal Amortization Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                          <span>Principal Amortized: {progressPct}%</span>
                          <span>Remaining Term: {loan.tenorMonths - loan.monthsPaid} months</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Early Principal Repayment Action Button */}
                      <div className="pt-1">
                        {!isRepaying ? (
                          <button
                            onClick={() => {
                              setRepayingLoanId(loan.id);
                              setCustomRepayAmount(Math.min(10000000, loan.remainingBalanceUGX));
                            }}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Make Early Principal Repayment</span>
                          </button>
                        ) : (
                          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                                Early Principal Repayment Desk
                              </span>
                              <button
                                onClick={() => setRepayingLoanId(null)}
                                className="text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>

                            <p className="text-[11px] text-slate-400">
                              Paying down principal early saves future interest and lowers your overall liabilities.
                              Available liquid cash: <strong className="text-emerald-400 font-mono">{formatUGX(gameState.cashUGX)}</strong>
                            </p>

                            <div className="space-y-2">
                              <label className="text-[11px] font-medium text-slate-300">
                                Repayment Amount (UGX)
                              </label>
                              <input
                                type="number"
                                step="1000000"
                                min="100000"
                                max={loan.remainingBalanceUGX}
                                value={customRepayAmount}
                                onChange={(e) => setCustomRepayAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            {/* Quick Preset Buttons */}
                            <div className="flex flex-wrap gap-1.5">
                              {[5000000, 10000000, 25000000].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setCustomRepayAmount(Math.min(amt, loan.remainingBalanceUGX))}
                                  disabled={amt > loan.remainingBalanceUGX}
                                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-[11px] rounded font-mono text-slate-300 hover:text-white"
                                >
                                  +{formatUGX(amt)}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setCustomRepayAmount(loan.remainingBalanceUGX)}
                                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-[11px] rounded font-mono text-emerald-300"
                              >
                                Pay Full Balance ({formatUGX(loan.remainingBalanceUGX)})
                              </button>
                            </div>

                            {customRepayAmount > gameState.cashUGX && (
                              <div className="text-[11px] text-rose-400 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Insufficient cash. You have {formatUGX(gameState.cashUGX)} available.</span>
                              </div>
                            )}

                            <button
                              onClick={() => handleRepayEarly(loan.id, customRepayAmount)}
                              disabled={customRepayAmount <= 0 || customRepayAmount > gameState.cashUGX}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                            >
                              Confirm Early Repayment of {formatUGX(customRepayAmount)}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* URA Tax Compliance Desk */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">URA Rental Income Tax Ledger</h3>
              <p className="text-xs text-slate-400">Uganda Revenue Authority compliance & assessments</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Tax Compliance Rating</span>
              <span className={`text-sm font-bold ${gameState.taxComplianceStatus === 'COMPLIANT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {gameState.taxComplianceStatus}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Active Assessments</span>
              <span className="text-sm font-bold font-mono text-white">
                {gameState.uraTaxRecords.filter((r) => !r.isPaid).length} Pending
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tax Assessments & Filings</h4>
            {gameState.uraTaxRecords.length === 0 ? (
              <p className="text-xs text-slate-500">No URA tax assessments generated yet. Complete rental properties to incur rental income tax.</p>
            ) : (
              <div className="space-y-2">
                {gameState.uraTaxRecords.map((rec) => (
                  <div key={rec.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Period: {rec.periodStr}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${rec.isPaid ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                        {rec.isPaid ? 'PAID' : 'UNPAID'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-slate-400 font-mono">
                      <div>Gross Rent: {formatUGX(rec.grossRentalIncomeUGX)}</div>
                      <div>Tax Due: {formatUGX(rec.taxDueUGX)}</div>
                      {rec.penaltyUGX > 0 && <div className="col-span-2 text-rose-400">Late Penalty: {formatUGX(rec.penaltyUGX)}</div>}
                    </div>
                    {!rec.isPaid && (
                      <button
                        onClick={() => handlePayUraTax(rec.id)}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition-colors"
                      >
                        File & Pay URA Assessment ({formatUGX(rec.taxDueUGX + rec.penaltyUGX)})
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
