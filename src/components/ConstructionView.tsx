import React from 'react';
import { Hammer, HardHat, Building, Clock, ArrowRight } from 'lucide-react';

interface ConstructionViewProps {
  setActiveTab: (tab: string) => void;
}

export const ConstructionView: React.FC<ConstructionViewProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Construction & Development Studio</h2>
        <p className="text-sm text-slate-400">
          Design and construct rental apartments, commercial plazas, and gated suburban housing estates on your acquired Ugandan land parcels. (Phase 2 feature preview).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Residential Duplex / Townhouses',
            target: 'Wakiso & Entebbe Suburbs',
            cost: 'UGX 120,000,000',
            duration: '6 Months',
            roi: '18% p.a. Rental Yield',
          },
          {
            title: 'Commercial Retail Plaza',
            target: 'Kampala Central Business District',
            cost: 'UGX 450,000,000',
            duration: '12 Months',
            roi: '22% p.a. Rental Yield',
          },
          {
            title: 'Student Hostels',
            target: 'Mukono (University Corridor)',
            cost: 'UGX 220,000,000',
            duration: '8 Months',
            roi: '25% p.a. Rental Yield',
          },
        ].map((blueprint, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{blueprint.title}</h3>
              <p className="text-xs text-slate-400">Ideal for {blueprint.target}</p>
            </div>

            <div className="space-y-2 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Cost</span>
                <span className="text-white font-mono font-semibold">{blueprint.cost}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Build Timeline</span>
                <span className="text-white font-mono">{blueprint.duration}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Projected Return</span>
                <span className="text-emerald-400 font-mono font-bold">{blueprint.roi}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('properties')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors border border-slate-700"
            >
              Select Land Parcel to Build
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
