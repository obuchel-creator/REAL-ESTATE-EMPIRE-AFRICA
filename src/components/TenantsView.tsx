import React, { useState } from 'react';
import {
  Users,
  Building2,
  CheckCircle,
  AlertCircle,
  Wrench,
  DollarSign,
  Phone,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  RefreshCw,
  Trash2,
  Clock,
  Briefcase,
  Home,
  Store,
} from 'lucide-react';
import { GameState, TenantLease, MaintenanceRequest, OwnedProperty } from '../types';
import { formatUGX } from '../data/UgandaConfig';
import { TenantManager } from '../engine/TenantManager';

interface TenantsViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setActiveTab?: (tab: string) => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({ gameState, setGameState, setActiveTab }) => {
  const tenants = gameState.tenants || [];
  const maintenanceTickets = gameState.maintenanceRequests || [];
  const completedProperties = gameState.properties.filter(
    (p) => p.status === 'Completed' || p.status === 'Rented'
  );

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    completedProperties[0]?.id || ''
  );
  const [notification, setNotification] = useState<{ message: string; success: boolean } | null>(null);
  const [applicants, setApplicants] = useState<TenantLease[]>([]);
  const [adjustingLeaseId, setAdjustingLeaseId] = useState<string | null>(null);
  const [newRentInput, setNewRentInput] = useState<number>(3000000);

  const selectedProperty = completedProperties.find((p) => p.id === selectedPropertyId);

  // Portfolio Totals
  const activeTenants = tenants.filter((t) => t.status === 'ACTIVE' || t.status === 'OVERDUE');
  const totalMonthlyRoll = activeTenants.reduce((sum, t) => sum + t.monthlyRentUGX, 0);
  const pendingMaintenanceCost = maintenanceTickets
    .filter((m) => m.status === 'PENDING')
    .reduce((sum, m) => sum + m.costUGX, 0);

  const handleGenerateApplicants = (prop: OwnedProperty) => {
    const pool = TenantManager.generateApplicants(prop, 3);
    setApplicants(pool);
    setNotification({
      message: `Received ${pool.length} prospective tenant applications for ${prop.title}!`,
      success: true,
    });
  };

  const handleSignLease = (applicant: TenantLease) => {
    const res = TenantManager.signLease(gameState, applicant);
    if (!res.success) {
      setNotification({ message: res.error || 'Failed to sign tenancy agreement.', success: false });
    } else {
      setGameState(res.newGameState);
      setApplicants((prev) => prev.filter((a) => a.id !== applicant.id));
      setNotification({
        message: `Tenancy agreement signed with ${applicant.tenantName}! Collected ${formatUGX(applicant.depositUGX)} security deposit.`,
        success: true,
      });
    }
  };

  const handleAdjustRent = (leaseId: string) => {
    const res = TenantManager.adjustRent(gameState, leaseId, newRentInput);
    if (!res.success) {
      setNotification({ message: res.error || 'Failed to adjust rent.', success: false });
    } else {
      setGameState(res.newGameState);
      setNotification({ message: `Monthly rent successfully updated to ${formatUGX(newRentInput)}!`, success: true });
      setAdjustingLeaseId(null);
    }
  };

  const handleEvictTenant = (leaseId: string, tenantName: string) => {
    const res = TenantManager.evictTenant(gameState, leaseId);
    if (!res.success) {
      setNotification({ message: res.error || 'Failed to evict tenant.', success: false });
    } else {
      setGameState(res.newGameState);
      setNotification({
        message: `Vacated tenancy agreement for ${tenantName}. The unit is now open for new applicants.`,
        success: true,
      });
    }
  };

  const handleResolveMaintenance = (ticketId: string) => {
    const res = TenantManager.resolveMaintenance(gameState, ticketId);
    if (!res.success) {
      setNotification({ message: res.error || 'Failed to fund maintenance.', success: false });
    } else {
      setGameState(res.newGameState);
      setNotification({ message: `Maintenance ticket funded and resolved successfully!`, success: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Tenant Acquisition & Lease Administration Desk
        </h2>
        <p className="text-sm text-slate-400">
          Screen prospective Ugandan tenants, execute commercial and residential tenancy agreements, collect security deposits, and oversee property maintenance.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            notification.success
              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.success ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Tenants</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {activeTenants.length}
          </div>
          <p className="text-xs text-slate-500">Across completed developments</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Monthly Rent Roll</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatUGX(totalMonthlyRoll)}
          </div>
          <p className="text-xs text-slate-500">Scheduled monthly inflows</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Developments Ready</span>
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {completedProperties.length}
          </div>
          <p className="text-xs text-slate-500">Properties with leasing capacity</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {formatUGX(pendingMaintenanceCost)}
          </div>
          <p className="text-xs text-slate-500">{maintenanceTickets.filter((m) => m.status === 'PENDING').length} active repair tickets</p>
        </div>
      </div>

      {completedProperties.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">No Completed Properties Ready for Leasing</h3>
            <p className="text-xs text-slate-400">
              Acquire land parcels and complete construction projects through the Construction tab to begin leasing units and collecting recurring rental income.
            </p>
          </div>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('construction')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Go to Construction Pipeline
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Properties & Marketing Desk */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Leasing Portfolio</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Select Development</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {completedProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.tenureType})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProperty && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Occupancy Status:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {(selectedProperty.occupancyRate * 100).toFixed(0)}% Occupied
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Monthly Revenue:</span>
                    <span className="text-white font-mono font-bold">
                      {formatUGX(selectedProperty.monthlyRentalIncomeUGX)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Current Valuation:</span>
                    <span className="text-slate-200 font-mono">
                      {formatUGX(selectedProperty.currentValuationUGX)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleGenerateApplicants(selectedProperty)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Screen Prospective Applicants</span>
                  </button>
                </div>
              )}
            </div>

            {/* Prospective Applicants Queue */}
            {applicants.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Applicant Queue ({applicants.length})</span>
                  </h3>
                  <button
                    onClick={() => setApplicants([])}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-3">
                  {applicants.map((app) => (
                    <div
                      key={app.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-white block font-medium">{app.tenantName}</strong>
                          <span className="text-[10px] text-slate-400">{app.tenantCategory}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                          {(app.paymentReliability * 100).toFixed(0)}% Reliable
                        </span>
                      </div>

                      <div className="bg-slate-900 rounded-lg p-2 space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span>Unit:</span>
                          <span className="text-white">{app.unitName}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Proposed Rent:</span>
                          <span className="text-emerald-400 font-bold">{formatUGX(app.monthlyRentUGX)} / mo</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Deposit (2 Mo):</span>
                          <span>{formatUGX(app.depositUGX)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSignLease(app)}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Sign 12-Month Lease & Collect Deposit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center & Right Column: Active Tenants Roster & Maintenance Desk */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Tenants List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Active Lease Agreements ({activeTenants.length})
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Total Rent: {formatUGX(totalMonthlyRoll)} / mo
                </span>
              </div>

              {activeTenants.length === 0 ? (
                <div className="bg-slate-950 border border-dashed border-slate-800 rounded-lg p-6 text-center text-xs text-slate-400">
                  No active leases signed yet. Click "Screen Prospective Applicants" on the left to review applications and sign tenancy agreements.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTenants.map((lease) => {
                    const prop = gameState.properties.find((p) => p.id === lease.propertyId);
                    const isAdjusting = adjustingLeaseId === lease.id;

                    return (
                      <div
                        key={lease.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              {lease.tenantCategory === 'Corporate Commercial' ? (
                                <Briefcase className="w-4 h-4 text-emerald-400" />
                              ) : lease.tenantCategory === 'Retail / SME' ? (
                                <Store className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Home className="w-4 h-4 text-amber-400" />
                              )}
                              <span className="font-bold text-white text-sm">{lease.tenantName}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  lease.status === 'ACTIVE'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {lease.status}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px]">
                              {lease.unitName} · {prop ? prop.title : 'Development'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase text-slate-400 block">Monthly Rent</span>
                            <span className="text-base font-bold font-mono text-emerald-400">
                              {formatUGX(lease.monthlyRentUGX)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                          <div className="bg-slate-900 p-2 rounded">
                            <span className="text-slate-400 block text-[10px]">Reliability</span>
                            <span className="text-white font-semibold">{(lease.paymentReliability * 100).toFixed(0)}%</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded">
                            <span className="text-slate-400 block text-[10px]">Deposit Held</span>
                            <span className="text-white font-semibold">{formatUGX(lease.depositUGX)}</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded">
                            <span className="text-slate-400 block text-[10px]">Lease Term</span>
                            <span className="text-white font-semibold">{lease.monthsRemaining} mo remaining</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded">
                            <span className="text-slate-400 block text-[10px]">Contact</span>
                            <span className="text-white truncate">{lease.contactPhone}</span>
                          </div>
                        </div>

                        {/* Actions: Adjust Rent or Evict */}
                        <div className="flex items-center justify-between pt-1">
                          {!isAdjusting ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setAdjustingLeaseId(lease.id);
                                  setNewRentInput(lease.monthlyRentUGX);
                                }}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
                              >
                                Adjust Rent
                              </button>
                              <button
                                onClick={() => handleEvictTenant(lease.id, lease.tenantName)}
                                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Evict</span>
                              </button>
                            </div>
                          ) : (
                            <div className="w-full bg-slate-900 p-3 rounded-lg space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-white">Adjust Monthly Rent (UGX)</span>
                                <button
                                  onClick={() => setAdjustingLeaseId(null)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  step="200000"
                                  value={newRentInput}
                                  onChange={(e) => setNewRentInput(parseInt(e.target.value) || 0)}
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
                                />
                                <button
                                  onClick={() => handleAdjustRent(lease.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                                >
                                  Save Rent
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Property Maintenance & Caretaker Desk */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Property Maintenance & Facilities Desk
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {maintenanceTickets.filter((m) => m.status === 'PENDING').length} Pending Issues
                </span>
              </div>

              {maintenanceTickets.filter((m) => m.status === 'PENDING').length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">All properties & facilities in optimal condition.</p>
                  <p className="text-[11px] text-slate-500">
                    Caretakers inspect premises monthly. Maintenance tickets will be logged automatically if repairs arise.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceTickets
                    .filter((m) => m.status === 'PENDING')
                    .map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-white text-sm block">{ticket.title}</span>
                            <span className="text-slate-400 text-[11px]">{ticket.unitName}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              ticket.urgency === 'HIGH'
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : ticket.urgency === 'MEDIUM'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-900 text-slate-300'
                            }`}
                          >
                            {ticket.urgency} URGENCY
                          </span>
                        </div>

                        <p className="text-slate-400 text-xs">{ticket.description}</p>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                          <span className="font-mono text-emerald-400 font-bold">
                            Cost: {formatUGX(ticket.costUGX)}
                          </span>
                          <button
                            onClick={() => handleResolveMaintenance(ticket.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Approve & Fund Repair ({formatUGX(ticket.costUGX)})
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
