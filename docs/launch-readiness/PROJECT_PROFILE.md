# Project Profile: Real Estate Empire – Africa

## 1. Actual Application Architecture
The application is currently implemented as a high-fidelity, production-grade Single Page Application (SPA) built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and an **Express** backend proxy. It serves as a fully functional web-based technical prototype and economic simulation engine of the intended Godot 4 game concept.

## 2. Technology Stack
- **Frontend Framework**: React 19, React DOM
- **Build Tool**: Vite 8.3 with `@tailwindcss/vite`
- **Styling**: Tailwind CSS v4 with custom dark mode variants and tabular typography
- **Language**: TypeScript 7.0 (Strict mode)
- **Backend**: Node.js & Express 4.21
- **Icons**: Lucide React
- **Persistence**: Browser `localStorage` with atomic backup rotation and JSON import/export

## 3. Project Structure
```text
/
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── docs/
│   ├── PHASE_1_IMPLEMENTATION_REPORT.md
│   ├── PROJECT_BLUEPRINT.md
│   ├── GAME_DESIGN_DOCUMENT.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── UGANDA_ECONOMIC_MODEL.md
│   ├── TESTING_STRATEGY.md
│   ├── TECHNICAL_DECISIONS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── FINANCIAL_RULES.md
│   ├── SAVE_SYSTEM.md
│   ├── PLATFORM_COMPATIBILITY.md
│   └── TEST_RESULTS.md
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types.ts
    ├── engine/
    │   ├── GameManager.ts
    │   ├── SimulationClock.ts
    │   ├── PlayerManager.ts
    │   ├── FinanceManager.ts
    │   └── SaveManager.ts
    ├── data/
    │   ├── UgandaConfig.ts
    │   └── MarketNewsData.ts
    ├── tests/
    │   └── GameEngineTests.ts
    └── components/
        ├── Header.tsx
        ├── DashboardView.tsx
        ├── LandMarketView.tsx
        ├── PropertiesView.tsx
        ├── ConstructionView.tsx
        ├── TenantsView.tsx
        ├── FinanceView.tsx
        ├── MarketView.tsx
        ├── EngineInspectorView.tsx
        ├── EducationView.tsx
        ├── SettingsView.tsx
        ├── MarketNews.tsx
        └── TestRunnerModal.tsx
```

## 4. Implemented Features
- **Simulation Clock**: Deterministic monthly calendar progression with month/year transitions.
- **Player Manager**: Uganda starting profile in Kampala with UGX 50,000,000 seed capital and experience level progression.
- **Finance Manager**: Strict integer-based UGX financial ledger, balance validation, and transaction history recording.
- **Save Manager**: LocalStorage persistence with atomic backup rotation, schema validation, and JSON export/import.
- **Uganda Regional Market**: Locations (Kampala, Wakiso, Entebbe, Mukono, Jinja, Mbarara, Gulu, Mbale, Soroti) with price per decimal, rental demand indices, and appreciation rates.
- **Market News System**: Randomized Ugandan real estate news wire updating on month advancement.
- **Automated Test Suite**: 9 automated test assertions covering initialization, player profile, date advancement, financial transactions, insufficient balance rejection, net worth, save/load roundtrips, and corruption recovery.

## 5. Partially Implemented Features
- Property Construction & Development (UI blueprints present; execution mechanics slated for Phase 2).
- Tenant Lease Administration (Dashboard preview present).

## 6. Missing Features
- Multi-region African expansion beyond Uganda (Kenya, Rwanda, Tanzania, Nigeria).
- AI competitor moguls bidding on land parcels.
- Commercial bank mortgages and debt servicing.

## 7. Existing Testing Infrastructure
- Browser-based automated unit test runner (`GameEngineTests.ts`) with interactive test results modal.

## 8. Persistence Mechanisms
- LocalStorage key `real_estate_empire_africa_save_v1` with backup slot `real_estate_empire_africa_backup_v1`.

## 9. External Integrations
- None (fully self-contained economic simulation).

## 10. Architecture Discrepancies
- Master specifications describe Godot 4 with GDScript. The actual build is a high-fidelity React/TypeScript web prototype serving as the technical proof-of-concept and web target platform.

## 11. Current Build Status
- **Passing** (`compile_applet` and `lint_applet` pass with zero errors).
