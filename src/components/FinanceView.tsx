import React, { useState } from 'react';
import { Wallet, TrendingUp, Building2, ShieldCheck, AlertCircle, CheckCircle, Landmark, FileText, CreditCard } from 'lucide-react';
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

  const totalAssets = FinanceManager.calculateTotalAssets(gameState.properties, gameState.cashUGX);
  const totalLiabilities = FinanceManager.calculateTotalLiabilities(gameState.loans);
  const netWorth = FinanceManager.calculateNetWorth(totalAssets, totalLiabilities);

  const selectedProperty = gameState.properties.find((p) => p.id === selectedPropertyId);
  const maxBorrowingPower = selectedProperty ? Math.round(selectedProperty.currentValuationUGX * selectedProperty.maxLtvRatio) : 0;

  const handleApplyLoan = () => {
    let msg = '';
    let success = false;

    if (!selectedProperty) {
      setNotification({ message: 'Please select a collateral property.', success: false });
      return;
    }

    if (!selectedProperty.titleVerified && loanType !== 'LAND_ACQUISITION') {
      setNotification({ message: 'Property title must be verified at Ministry of Lands before applying for construction or equity loans.', success: false });
      return;
    }

    if (requestedLoanUGX > maxBorrowingPower) {
      setNotification({ message: `Loan requested exceeds property LTV borrowing power (${formatUGX(maxBorrowingPower)}).`, success: false });
      return;
    }

    if (gameState.taxComplianceStatus === 'PENALIZED') {
      setNotification({ message: 'Loan applications frozen by commercial banks due to active URA tax penalties.', success: false });
      return;
    }

    setGameState((prev) => {
      const prop = prev.properties.find((p) => p.id === selectedPropertyId);
      if (!prop) return prev;

      const interestRate = 0.18; // 18% annual commercial bank rate
      const originationFee = Math.round(requestedLoanUGX * 0.015); // 1.5% origination fee
      const monthlyPayment = FinanceManager.calculateMonthlyPayment(requestedLoanUGX, interestRate, tenorMonths);
      const totalOutflow = originationFee; // cash received = principal - origination fee

      const res = FinanceManager.recordTransaction(
        prev.cashUGX,
        prev.transactions,
        'LOAN',
        `Commercial Bank Loan Disbursal (${loanType}) secured on ${prop.title} (Fee: ${formatUGX(originationFee)})`,
        requestedLoanUGX - originationFee,
        prop.id,
        true
      );

      if (!res.success) {
        msg = res.error || 'Loan processing failed.';
        return prev;
      }

      success = true;
      msg = `Successfully secured loan of ${formatUGX(requestedLoanUGX)} with monthly installment of ${formatUGX(monthlyPayment)}!`;

      const newLoan: LoanFacility = {
        id: 'loan_' + Date.now(),
        propertyId: prop.id,
        loanType,
        principalUGX: requestedLoanUGX,
        remainingBalanceUGX: requestedLoanUGX,
        interestRateAnnual: interestRate,
        monthlyPaymentUGX: monthlyPayment,
        tenorMonths,
        monthsPaid: 0,
        status: 'ACTIVE',
        originationFeeUGX: originationFee,
      };

      return {
        ...prev,
        cashUGX: res.newCash,
        transactions: res.newTransactions,
        loans: [...prev.loans, newLoan],
        liabilitiesUGX: prev.liabilitiesUGX + requestedLoanUGX,
      };
    });

    setNotification({ message: msg, success });
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
                {gameState.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.tenureType} · Valuation: {formatUGX(p.currentValuationUGX)})
                  </option>
                ))}
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
                  <option value="EQUITY_RELEASE">Equity Release Mortgage</option>
                  <option value="CONSTRUCTION_FACILITY">Construction Development Facility</option>
                  <option value="LAND_ACQUISITION">Land Acquisition Loan</option>
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

            <button
              onClick={handleApplyLoan}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
            >
              Apply for Bank Loan Facility
            </button>
          </div>

          {/* Active Loans List */}
          <div className="border-t border-slate-800 pt-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Bank Loans ({gameState.loans.filter(l => l.status === 'ACTIVE').length})</h4>
            {gameState.loans.filter((l) => l.status === 'ACTIVE').length === 0 ? (
              <p className="text-xs text-slate-500">No active commercial bank loans.</p>
            ) : (
              <div className="space-y-2">
                {gameState.loans.filter((l) => l.status === 'ACTIVE').map((loan) => (
                  <div key={loan.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">{loan.loanType}</span>
                      <span className="text-emerald-400 font-mono">{formatUGX(loan.remainingBalanceUGX)} balance</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Monthly Installment: {formatUGX(loan.monthlyPaymentUGX)}</span>
                      <span>Rate: {(loan.interestRateAnnual * 100).toFixed(1)}% p.a.</span>
                    </div>
                  </div>
                ))}
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
