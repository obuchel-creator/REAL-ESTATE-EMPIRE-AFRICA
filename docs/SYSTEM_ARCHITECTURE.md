# System Architecture

## 1. Architecture goals

Use a modular, data-driven architecture with a deterministic simulation core. Keep UI, persistence, content data and economic rules separate. The game should work offline for the MVP.

## 2. Proposed technology

- **Engine candidate:** Godot 4.
- **Primary language:** GDScript with static typing where practical.
- **Scenes/UI:** Godot Control nodes and reusable scenes.
- **Data:** versioned JSON or Godot Resources for authored content; validate all loaded data.
- **Persistence:** versioned local save files with atomic-write strategy and backup rotation.
- **Testing:** GUT or a lightweight project test harness; choose and document after the engine prototype.
- **Version control:** Git and GitHub.

The engine choice is provisional until export and performance tests pass for Android, Web, Windows, macOS and Linux. Browser platform constraints, memory use and mobile browser compatibility must be tested early.

## 3. Logical modules

- **App / Boot:** startup, platform detection, configuration and navigation.
- **Simulation:** calendar, tick processing, event queue and deterministic random seed.
- **Economy:** currency, prices, inflation, interest, market demand and economic events.
- **World:** countries, cities, districts, locations and infrastructure.
- **Assets:** land parcels, buildings, units and valuation attributes.
- **Development:** project plans, cost estimates, procurement, progress and completion.
- **Leasing:** tenant profiles, leases, invoices, payments, arrears and deposits.
- **Finance:** ledger, accounts, loans, interest, repayments, statements and net worth.
- **AI:** competitor profiles and decision policies.
- **Progression:** missions, objectives, unlocks and achievements.
- **UI:** dashboards, forms, maps, lists, charts and notifications.
- **Persistence:** save schema, migrations, validation and recovery.
- **Content:** country packs, building catalogues, events and localization.

## 4. Data flow

User action → command validation → simulation/domain service → ledger and state update → event log → UI refresh → persistence checkpoint.

UI components must not directly mutate financial balances. All money movements pass through finance services and create auditable ledger entries.

## 5. Domain entities

Initial entities:
- Country, City, District, Parcel
- PropertyAsset, Building, Unit
- DevelopmentProject, CostItem, Milestone
- Tenant, Lease, RentInvoice, Payment, Deposit
- Account, LedgerEntry, Loan, LoanSchedule
- MarketSnapshot, EconomicEvent
- Competitor, Objective, Achievement
- SaveMetadata, EventLogEntry

Use stable IDs. Store relationships by IDs, not duplicated nested copies that can drift out of sync.

## 6. Money and time

Represent money as integer minor units or integer currency units with a documented precision; never use binary floating-point for ledger balances. Store currency code separately (UGX initially). Define explicit rounding rules for percentages, interest and allocation.

Use a simulation calendar independent of device wall-clock time. A monthly tick must execute in a documented order so results are repeatable.

## 7. Country configuration

Country packs should provide:
- ISO country code and display name
- Currency code and formatting
- Administrative hierarchy
- Market segments and district profiles
- Land-use categories
- Construction cost indices
- Rent and vacancy assumptions
- Financing and tax parameters
- Event probabilities and scenario definitions
- Localization strings

Keep country-specific assumptions out of generic simulation code. Every calibration dataset needs source, date, geographic scope, units and confidence metadata. Initial game values may be explicitly fictional.

## 8. Save architecture

Save files include schema version, game version, seed, simulation date, player state, assets, projects, leases, finance ledger, market state and event history. Validate before loading. Write to a temporary file, verify, then replace the prior save; retain a recoverable backup. Implement migration tests before changing schemas.

## 9. Security and privacy

The MVP should not collect sensitive personal data or require accounts. Never embed API keys or secrets in client builds. If online services are added later, use a backend for authentication, authorization, validation and rate limiting. Do not trust client-submitted financial state.

## 10. Proposed code layout

```text
game/
  scenes/
  scripts/
    app/
    simulation/
    economy/
    world/
    assets/
    development/
    leasing/
    finance/
    ai/
    progression/
    persistence/
    ui/
  data/
    countries/uganda/
    buildings/
    events/
  assets/
  ui/
tests/
tools/
docs/
```
