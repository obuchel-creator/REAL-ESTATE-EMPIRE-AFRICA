import React from 'react';
import { Users, UserCheck, ShieldCheck } from 'lucide-react';

export const TenantsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Tenant Acquisition & Lease Administration</h2>
        <p className="text-sm text-slate-400">
          Screen tenants, sign Ugandan tenancy agreements, collect monthly rent in UGX, and handle maintenance requests. (Phase 2 feature preview).
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <Users className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-white">No active lease agreements</h3>
          <p className="text-xs text-slate-400">
            Construct buildings on your land parcels to begin leasing space to tenants and generating recurring monthly rental income.
          </p>
        </div>
      </div>
    </div>
  );
};
