import React, { useState } from 'react';
import { Hammer, HardHat, Building, CheckCircle, AlertCircle, ShieldAlert, FileText, Play } from 'lucide-react';
import { GameState, ConstructionProject, ConstructionTemplate, OwnedProperty, ConstructionStage } from '../types';
import { CONSTRUCTION_TEMPLATES } from '../data/ConstructionTemplates';
import { FinanceManager } from '../engine/FinanceManager';
import { formatUGX } from '../data/UgandaConfig';

interface ConstructionViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setActiveTab: (tab: string) => void;
}

export const ConstructionView: React.FC<ConstructionViewProps> = ({ gameState, setGameState, setActiveTab }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(gameState.properties[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(CONSTRUCTION_TEMPLATES[0].id);
  const [buildWithoutPermit, setBuildWithoutPermit] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; success: boolean } | null>(null);

  const selectedProperty = gameState.properties.find((p) => p.id === selectedPropertyId);
  const selectedTemplate = CONSTRUCTION_TEMPLATES.find((t) => t.id === selectedTemplateId) || CONSTRUCTION_TEMPLATES[0];
  const activeProject = gameState.constructionProjects.find((cp) => cp.propertyId === selectedPropertyId);

  const handleStartConstruction = () => {
    let msg = '';
    let success = false;

    if (!selectedProperty) {
      setNotification({ message: 'Please select an eligible land parcel.', success: false });
      return;
    }

    if (activeProject) {
      setNotification({ message: 'This property already has an active construction project.', success: false });
      return;
    }

    // Check prerequisites
    if (!selectedProperty.titleVerified || !selectedProperty.kibanjaCleared) {
      if (!buildWithoutPermit) {
        setNotification({
          message: 'Permit denied: Property requires Kibanja clearance and Ministry of Lands title verification. (Or toggle "Build Without Permit" at your own risk).',
          success: false,
        });
        return;
      }
    }

    setGameState((prev) => {
      const prop = prev.properties.find((p) => p.id === selectedPropertyId);
      if (!prop) return prev;

      // Plan Approval fee (stage 0 cost)
      const planCost = selectedTemplate.stageCostsUGX.planApproval;
      const permitFee = buildWithoutPermit ? 0 : 5000000; // UGX 5M KCCA permit scrutiny fee
      const totalInitialOutflow = planCost + permitFee;

      const res = FinanceManager.recordTransaction(
        prev.cashUGX,
        prev.transactions,
        'CONSTRUCTION',
        `KCCA Plan Approval & Permit Fee: ${selectedTemplate.name} on ${prop.title}`,
        -totalInitialOutflow,
        prop.id
      );

      if (!res.success) {
        msg = res.error || 'Insufficient funds to start construction and secure KCCA permits.';
        return prev;
      }

      success = true;
      msg = buildWithoutPermit
        ? 'Construction started without permit! Beware of KCCA stop-work orders and penalties.'
        : `KCCA Building Permit approved! Started construction of ${selectedTemplate.name}.`;

      const newProject: ConstructionProject = {
        id: 'proj_' + Date.now(),
        propertyId: prop.id,
        templateId: selectedTemplate.id,
        currentStage: 'PLAN_APPROVAL' as ConstructionStage,
        stageIndex: 0,
        totalCostUGX: selectedTemplate.totalCostUGX,
        fundedCostUGX: totalInitialOutflow,
        builtMonths: 1,
        totalMonths: selectedTemplate.durationMonths,
        permitSecured: !buildWithoutPermit,
        builtWithoutPermit: buildWithoutPermit,
        kccaFinePaid: false,
        targetUnits: selectedTemplate.targetUnits,
        projectedMonthlyRentUGX: selectedTemplate.projectedMonthlyRentUGX,
      };

      const updatedProperties = prev.properties.map((p) =>
        p.id === prop.id ? { ...p, status: 'Under Development' as const } : p
      );

      return {
        ...prev,
        cashUGX: res.newCash,
        transactions: res.newTransactions,
        properties: updatedProperties,
        constructionProjects: [...prev.constructionProjects, newProject],
      };
    });

    setNotification({ message: msg, success });
  };

  const handleFundNextStage = (projectId: string) => {
    let msg = '';
    let success = false;

    setGameState((prev) => {
      const project = prev.constructionProjects.find((cp) => cp.id === projectId);
      if (!project) return prev;

      const template = CONSTRUCTION_TEMPLATES.find((t) => t.id === project.templateId);
      if (!template) return prev;

      let stageCost = 0;
      let nextStage: ConstructionStage = project.currentStage;
      let nextIndex = project.stageIndex;

      if (project.currentStage === 'PLAN_APPROVAL') {
        stageCost = template.stageCostsUGX.foundation;
        nextStage = 'FOUNDATION';
        nextIndex = 1;
      } else if (project.currentStage === 'FOUNDATION') {
        stageCost = template.stageCostsUGX.wallingRoofing;
        nextStage = 'WALLING_ROOFING';
        nextIndex = 2;
      } else if (project.currentStage === 'WALLING_ROOFING') {
        stageCost = template.stageCostsUGX.finishing;
        nextStage = 'FINISHING';
        nextIndex = 3;
      } else if (project.currentStage === 'FINISHING') {
        stageCost = template.stageCostsUGX.occupationPermit;
        nextStage = 'OCCUPATION_PERMIT';
        nextIndex = 4;
      } else if (project.currentStage === 'OCCUPATION_PERMIT') {
        stageCost = 0;
        nextStage = 'COMPLETED';
        nextIndex = 5;
      }

      if (stageCost > 0) {
        const res = FinanceManager.recordTransaction(
          prev.cashUGX,
          prev.transactions,
          'CONSTRUCTION',
          `Stage Funding (${nextStage}): ${template.name}`,
          -stageCost,
          project.propertyId
        );

        if (!res.success) {
          msg = res.error || 'Insufficient funds to fund next construction stage.';
          return prev;
        }

        success = true;
        msg = `Successfully funded ${nextStage} stage for ${formatUGX(stageCost)}!`;

        const updatedProjects = prev.constructionProjects.map((cp) =>
          cp.id === projectId
            ? {
                ...cp,
                currentStage: nextStage,
                stageIndex: nextIndex,
                fundedCostUGX: cp.fundedCostUGX + stageCost,
              }
            : cp
        );

        let updatedProperties = prev.properties;
        if (nextStage === 'COMPLETED') {
          updatedProperties = prev.properties.map((p) =>
            p.id === project.propertyId
              ? {
                  ...p,
                  status: 'Rented' as const,
                  monthlyRentalIncomeUGX: project.projectedMonthlyRentUGX,
                  occupancyRate: 0.95,
                  currentValuationUGX: p.currentValuationUGX + template.totalCostUGX * 1.2,
                }
              : p
          );
        }

        return {
          ...prev,
          cashUGX: res.newCash,
          transactions: res.newTransactions,
          properties: updatedProperties,
          constructionProjects: updatedProjects,
        };
      } else if (project.currentStage === 'OCCUPATION_PERMIT') {
        success = true;
        msg = `Occupation Permit issued by KCCA! Project completed and generating rental income.`;

        const updatedProjects = prev.constructionProjects.map((cp) =>
          cp.id === projectId ? { ...cp, currentStage: 'COMPLETED' as ConstructionStage, stageIndex: 5 } : cp
        );

        const updatedProperties = prev.properties.map((p) =>
          p.id === project.propertyId
            ? {
                ...p,
                status: 'Rented' as const,
                monthlyRentalIncomeUGX: project.projectedMonthlyRentUGX,
                occupancyRate: 0.95,
                currentValuationUGX: p.currentValuationUGX + template.totalCostUGX * 1.2,
              }
            : p
        );

        return {
          ...prev,
          properties: updatedProperties,
          constructionProjects: updatedProjects,
        };
      }

      return prev;
    });

    setNotification({ message: msg, success });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Phased Property Development & Construction Pipeline</h2>
        <p className="text-sm text-slate-400">
          Submit KCCA/Municipal architectural plans, manage material costs, and fund multi-stage construction from foundation to occupation permit.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${notification.success ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/50 border-rose-500/30 text-rose-300'}`}>
          {notification.success ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Select Owned Land Parcel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">1. Select Owned Land Parcel</h3>
          {gameState.properties.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-500">No land parcels owned. Acquire land in the Land Market first.</p>
              <button
                onClick={() => setActiveTab('market')}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Go to Land Market
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {gameState.properties.map((prop) => {
                const isSelected = selectedPropertyId === prop.id;
                const hasActiveProject = gameState.constructionProjects.some((cp) => cp.propertyId === prop.id);
                return (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedPropertyId(prop.id)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all space-y-1.5 border ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500/40 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{prop.title}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-semibold">{prop.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Tenure: {prop.tenureType}</span>
                      <span>{hasActiveProject ? '🏗️ Active Project' : '✨ Ready to Build'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Cols: Blueprint Selection & Construction Progress Tracker */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProperty && !activeProject && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">2. Select Construction Blueprint</h3>
                  <p className="text-xs text-slate-400">Building on: <strong className="text-slate-200">{selectedProperty.title}</strong></p>
                </div>
              </div>

              {/* Blueprint Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CONSTRUCTION_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                        isSelected
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{tpl.finishTier}</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{tpl.name}</h4>
                        </div>
                        <span className="text-xs font-mono font-semibold text-emerald-400">{formatUGX(tpl.totalCostUGX)}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono">
                        <div>Timeline: <span className="text-white">{tpl.durationMonths} Mos</span></div>
                        <div>Units: <span className="text-white">{tpl.targetUnits} Units</span></div>
                        <div className="col-span-2">Projected Rent: <span className="text-emerald-400">{formatUGX(tpl.projectedMonthlyRentUGX)} / mo</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Permit Check & Start Action */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">KCCA & Municipal Permit Prerequisites</span>
                    <p className="text-xs text-slate-400">
                      Title Verified: {selectedProperty.titleVerified ? '✅ Yes' : '❌ No'} | Kibanja Cleared: {selectedProperty.kibanjaCleared ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer bg-amber-950/40 border border-amber-500/30 px-3 py-2 rounded-lg">
                    <input
                      type="checkbox"
                      checked={buildWithoutPermit}
                      onChange={(e) => setBuildWithoutPermit(e.target.checked)}
                      className="rounded border-amber-700 text-amber-600 focus:ring-0"
                    />
                    <span>Build Without Permit (Risky)</span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Initial Plan Approval & Permit Stage Cost</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {formatUGX(selectedTemplate.stageCostsUGX.planApproval + (buildWithoutPermit ? 0 : 5000000))}
                    </span>
                  </div>

                  <button
                    onClick={handleStartConstruction}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Submit Plans & Start Construction</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeProject && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Construction Project</span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                    {CONSTRUCTION_TEMPLATES.find((t) => t.id === activeProject.templateId)?.name}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg">
                  Stage: {activeProject.currentStage.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Multi-Stage Visual Progress Tracker */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  { stage: 'PLAN_APPROVAL', label: '1. Plan Approval' },
                  { stage: 'FOUNDATION', label: '2. Foundation' },
                  { stage: 'WALLING_ROOFING', label: '3. Walling & Roof' },
                  { stage: 'FINISHING', label: '4. Finishing' },
                  { stage: 'OCCUPATION_PERMIT', label: '5. Permit' },
                  { stage: 'COMPLETED', label: '6. Completed' },
                ].map((item, idx) => {
                  const isPassed = activeProject.stageIndex >= idx;
                  const isCurrent = activeProject.stageIndex === idx;
                  return (
                    <div
                      key={item.stage}
                      className={`p-3 rounded-xl border text-center space-y-1 ${
                        isCurrent
                          ? 'bg-emerald-600/20 border-emerald-500 text-white'
                          : isPassed
                          ? 'bg-slate-950 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-mono block font-bold">{idx + 1}</span>
                      <span className="text-xs font-semibold block">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Funding Next Stage Action */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Total Funded / Total Cost</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {formatUGX(activeProject.fundedCostUGX)} / {formatUGX(activeProject.totalCostUGX)}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">Projected Monthly Rental Yield: <strong className="text-emerald-400 font-mono">{formatUGX(activeProject.projectedMonthlyRentUGX)}/mo</strong></p>
                </div>

                {activeProject.currentStage !== 'COMPLETED' ? (
                  <button
                    onClick={() => handleFundNextStage(activeProject.id)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    <Hammer className="w-4 h-4" />
                    <span>Fund Next Construction Stage</span>
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold">
                    🎉 Construction Completed & Rented Out!
                  </span>
                )}
              </div>
            </div>
          )}

          {!selectedProperty && gameState.properties.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
              Select an owned land parcel from the left to begin construction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
