import { GameState, TenantLease, MaintenanceRequest, OwnedProperty, TenantCategory } from '../types';
import { FinanceManager } from './FinanceManager';
import { SimulationClock } from './SimulationClock';

const UGANDAN_TENANT_NAMES = [
  'Dr. Ronald Sentamu',
  'Najjuko Florence & Co.',
  'AfriTech Solutions Uganda',
  'Kato Godfrey (Advocate)',
  'Nalubega Prossy (Consultant)',
  'Stanbic Digital Agency',
  'Wasswa & Brothers Logistics',
  'Dr. Brenda Atuhaire',
  'Kigozi Mark (Telecom Eng.)',
  'Namubiru Sarah (Auditor)',
  'Pearl Global Logistics Ltd',
  'Kabali Denis & Associates',
  'Mbabazi Grace (NGO Director)',
  'Mukasa Dennis (Fintech Lead)',
];

const MAINTENANCE_TEMPLATES = [
  { title: 'Borehole Water Pump Pressure Servicing', cost: 1200000, urgency: 'MEDIUM' as const },
  { title: 'Solar Inverter Battery System Overhaul', cost: 2500000, urgency: 'HIGH' as const },
  { title: 'Compound Pavers & Perimeter Gate Repair', cost: 850000, urgency: 'LOW' as const },
  { title: 'Roof Rainwater Drainage & Gutter Clearing', cost: 650000, urgency: 'LOW' as const },
  { title: 'Plumbing Mainline Pressure Valve Replacement', cost: 1400000, urgency: 'HIGH' as const },
];

export class TenantManager {
  /**
   * Generates prospective tenant applicants for a completed property.
   */
  static generateApplicants(property: OwnedProperty, count: number = 3): TenantLease[] {
    const existingCount = 1;
    const baseRent = Math.max(1500000, Math.round(property.monthlyRentalIncomeUGX > 0 ? property.monthlyRentalIncomeUGX / 4 : 2500000));

    return Array.from({ length: count }, (_, idx) => {
      const name = UGANDAN_TENANT_NAMES[(idx + property.title.length) % UGANDAN_TENANT_NAMES.length];
      const isCorp = name.includes('Ltd') || name.includes('Solutions') || name.includes('Agency') || name.includes('Co.');
      const isRetail = name.includes('Logistics') || name.includes('Brothers');
      const category: TenantCategory = isCorp ? 'Corporate Commercial' : isRetail ? 'Retail / SME' : 'Individual Resident';
      const rentMultiplier = isCorp ? 1.3 : isRetail ? 1.1 : 0.95;
      const monthlyRent = Math.round(baseRent * rentMultiplier);
      const deposit = monthlyRent * 2; // 2 months deposit standard in Uganda

      return {
        id: 'applicant_' + Date.now() + '_' + idx,
        propertyId: property.id,
        unitName: `Unit ${idx + existingCount} (${isCorp ? 'Commercial Office' : isRetail ? 'Retail Shop' : 'Apartment'})`,
        tenantName: name,
        tenantCategory: category,
        monthlyRentUGX: monthlyRent,
        depositUGX: deposit,
        leaseStartStr: new Date().toISOString().split('T')[0],
        leaseDurationMonths: 12,
        monthsRemaining: 12,
        paymentReliability: isCorp ? 0.98 : isRetail ? 0.92 : 0.90,
        status: 'PENDING',
        contactPhone: '+256 70' + Math.floor(1000000 + Math.random() * 9000000),
        missedMonths: 0,
      };
    });
  }

  /**
   * Signs a tenancy agreement with an applicant, collecting 2 months deposit.
   */
  static signLease(
    gameState: GameState,
    applicant: TenantLease
  ): { success: boolean; newGameState: GameState; error?: string } {
    const property = gameState.properties.find((p) => p.id === applicant.propertyId);
    if (!property) {
      return { success: false, newGameState: gameState, error: 'Property not found.' };
    }

    if (property.status === 'Raw Land') {
      return { success: false, newGameState: gameState, error: 'Cannot lease raw undeveloped land without approved structures.' };
    }

    // Collect security deposit as cash inflow
    const depositTx = FinanceManager.recordTransaction(
      gameState.cashUGX,
      gameState.transactions,
      'INCOME',
      `Tenancy Deposit Collected from ${applicant.tenantName} (${applicant.unitName} - ${property.title})`,
      applicant.depositUGX,
      property.id
    );

    if (!depositTx.success) {
      return { success: false, newGameState: gameState, error: depositTx.error || 'Failed to record deposit transaction.' };
    }

    const currentTenants = gameState.tenants || [];
    const activeLease: TenantLease = {
      ...applicant,
      id: 'lease_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      status: 'ACTIVE',
      lastPaidDateStr: SimulationClock.formatDate(gameState.date),
    };

    const newTenants = [...currentTenants, activeLease];
    const propertyTenants = newTenants.filter((t) => t.propertyId === property.id && t.status === 'ACTIVE');
    const newMonthlyRent = propertyTenants.reduce((sum, t) => sum + t.monthlyRentUGX, 0);

    const updatedProperties = gameState.properties.map((p) =>
      p.id === property.id
        ? {
            ...p,
            status: 'Rented' as const,
            monthlyRentalIncomeUGX: newMonthlyRent,
            occupancyRate: Math.min(1.0, propertyTenants.length * 0.25),
          }
        : p
    );

    return {
      success: true,
      newGameState: {
        ...gameState,
        cashUGX: depositTx.newCash,
        transactions: depositTx.newTransactions,
        properties: updatedProperties,
        tenants: newTenants,
      },
    };
  }

  /**
   * Collects monthly rent across all active leases during simulation advance.
   */
  static processMonthlyRent(
    gameState: GameState
  ): { newGameState: GameState; totalCollectedUGX: number; summary: string[] } {
    const tenants = gameState.tenants || [];
    let currentCash = gameState.cashUGX;
    let transactions = [...gameState.transactions];
    let totalCollected = 0;
    const summary: string[] = [];

    const updatedTenants: TenantLease[] = tenants.map((lease) => {
      if (lease.status !== 'ACTIVE' && lease.status !== 'OVERDUE') {
        return lease;
      }

      // Roll probability based on payment reliability
      const willPay = Math.random() <= lease.paymentReliability;
      const newRemaining = Math.max(0, lease.monthsRemaining - 1);
      const isExpired = newRemaining === 0;

      if (willPay) {
        const rentAmount = lease.monthlyRentUGX;
        totalCollected += rentAmount;

        const txRes = FinanceManager.recordTransaction(
          currentCash,
          transactions,
          'INCOME',
          `Monthly Rent Collected: ${lease.tenantName} (${lease.unitName})`,
          rentAmount,
          lease.propertyId
        );

        if (txRes.success) {
          currentCash = txRes.newCash;
          transactions = txRes.newTransactions;
        }

        summary.push(`${lease.tenantName}: Paid UGX ${rentAmount.toLocaleString()} rent.`);

        return {
          ...lease,
          monthsRemaining: newRemaining,
          status: isExpired ? ('EXPIRED' as const) : ('ACTIVE' as const),
          missedMonths: 0,
          lastPaidDateStr: SimulationClock.formatDate(gameState.date),
        };
      } else {
        const missed = lease.missedMonths + 1;
        summary.push(`${lease.tenantName}: Rent payment delayed (${missed} month overdue).`);

        return {
          ...lease,
          monthsRemaining: newRemaining,
          status: 'OVERDUE' as const,
          missedMonths: missed,
        };
      }
    });

    // Update property occupancy rates & rental revenue totals
    const updatedProperties = gameState.properties.map((p) => {
      const activeForProp = updatedTenants.filter((t) => t.propertyId === p.id && (t.status === 'ACTIVE' || t.status === 'OVERDUE'));
      if (activeForProp.length === 0) return p;

      const monthlyRentTotal = activeForProp.reduce((acc, t) => acc + t.monthlyRentUGX, 0);
      return {
        ...p,
        monthlyRentalIncomeUGX: monthlyRentTotal,
        occupancyRate: Math.min(1.0, activeForProp.length * 0.25),
      };
    });

    return {
      newGameState: {
        ...gameState,
        cashUGX: currentCash,
        transactions,
        properties: updatedProperties,
        tenants: updatedTenants,
      },
      totalCollectedUGX: totalCollected,
      summary,
    };
  }

  /**
   * Adjusts monthly rent for an active tenant.
   */
  static adjustRent(
    gameState: GameState,
    leaseId: string,
    newRentUGX: number
  ): { success: boolean; newGameState: GameState; error?: string } {
    const tenants = gameState.tenants || [];
    const lease = tenants.find((t) => t.id === leaseId);
    if (!lease) {
      return { success: false, newGameState: gameState, error: 'Lease agreement not found.' };
    }

    if (newRentUGX <= 0) {
      return { success: false, newGameState: gameState, error: 'Rent must be greater than zero.' };
    }

    const updatedTenants = tenants.map((t) =>
      t.id === leaseId
        ? {
            ...t,
            monthlyRentUGX: Math.round(newRentUGX),
            // Substantial rent hikes slightly lower payment reliability
            paymentReliability: newRentUGX > t.monthlyRentUGX * 1.15 ? Math.max(0.75, t.paymentReliability - 0.05) : t.paymentReliability,
          }
        : t
    );

    return {
      success: true,
      newGameState: {
        ...gameState,
        tenants: updatedTenants,
      },
    };
  }

  /**
   * Evicts a delinquent or overdue tenant.
   */
  static evictTenant(
    gameState: GameState,
    leaseId: string
  ): { success: boolean; newGameState: GameState; error?: string } {
    const tenants = gameState.tenants || [];
    const lease = tenants.find((t) => t.id === leaseId);
    if (!lease) {
      return { success: false, newGameState: gameState, error: 'Lease not found.' };
    }

    const updatedTenants = tenants.filter((t) => t.id !== leaseId);
    return {
      success: true,
      newGameState: {
        ...gameState,
        tenants: updatedTenants,
      },
    };
  }

  /**
   * Resolves and funds a maintenance ticket.
   */
  static resolveMaintenance(
    gameState: GameState,
    requestId: string
  ): { success: boolean; newGameState: GameState; error?: string } {
    const requests = gameState.maintenanceRequests || [];
    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, newGameState: gameState, error: 'Maintenance ticket not found.' };
    }

    const txRes = FinanceManager.recordTransaction(
      gameState.cashUGX,
      gameState.transactions,
      'EXPENSE',
      `Property Maintenance: ${req.title} (${req.unitName})`,
      -req.costUGX,
      req.propertyId
    );

    if (!txRes.success) {
      return { success: false, newGameState: gameState, error: txRes.error || 'Insufficient funds to pay maintenance ticket.' };
    }

    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: 'RESOLVED' as const } : r
    );

    return {
      success: true,
      newGameState: {
        ...gameState,
        cashUGX: txRes.newCash,
        transactions: txRes.newTransactions,
        maintenanceRequests: updatedRequests,
      },
    };
  }

  /**
   * Periodically generates realistic property maintenance tickets.
   */
  static triggerMaintenanceTick(gameState: GameState): GameState {
    const rentedProperties = gameState.properties.filter((p) => p.status === 'Rented' || p.status === 'Completed');
    if (rentedProperties.length === 0) return gameState;

    // 25% chance of maintenance issue per month if properties exist
    if (Math.random() > 0.25) return gameState;

    const prop = rentedProperties[Math.floor(Math.random() * rentedProperties.length)];
    const template = MAINTENANCE_TEMPLATES[Math.floor(Math.random() * MAINTENANCE_TEMPLATES.length)];

    const newTicket: MaintenanceRequest = {
      id: 'maint_' + Date.now(),
      propertyId: prop.id,
      unitName: `${prop.title} Main Building`,
      title: template.title,
      description: `Routine wear & tear reported by site caretaker at ${prop.title}. Immediate servicing recommended.`,
      costUGX: template.cost,
      urgency: template.urgency,
      status: 'PENDING',
      reportedDateStr: SimulationClock.formatDate(gameState.date),
    };

    return {
      ...gameState,
      maintenanceRequests: [...(gameState.maintenanceRequests || []), newTicket],
    };
  }
}
