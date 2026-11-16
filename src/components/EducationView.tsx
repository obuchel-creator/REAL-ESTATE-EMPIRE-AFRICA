import React from 'react';
import { BookOpen, ShieldCheck, Award } from 'lucide-react';

export const EducationView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Uganda Real Estate Investment Academy</h2>
        <p className="text-sm text-slate-400">
          Learn authentic property investment principles, land tenure systems (Mailo, Freehold, Leasehold), and due diligence practices in Uganda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Understanding Mailo Land Tenure',
            category: 'Legal & Ownership',
            desc: 'Mailo land is unique to Uganda (predominantly Buganda region). It confers permanent ownership with roots in the 1900 Uganda Agreement, often housing tenants by occupancy (bibanja holders).',
          },
          {
            title: 'Ministry of Lands Search & Verification',
            category: 'Due Diligence',
            desc: 'Before purchasing any land parcel in Kampala or Wakiso, an official search at the Ministry of Lands Zonal Office (MZRO) is mandatory to verify rightful umuyiza/owner and check for encumbrances.',
          },
          {
            title: 'Leasehold vs. Freehold in Uganda',
            category: 'Valuation',
            desc: 'Freehold grants absolute ownership in perpetuity, while leaseholds (typically 49 or 99 years) require ground rent payments to district land boards or cultural institutions.',
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{item.category}</span>
            <h3 className="text-base font-bold text-white">{item.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
