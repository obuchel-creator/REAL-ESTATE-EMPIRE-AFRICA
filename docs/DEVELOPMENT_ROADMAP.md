# Development Roadmap

## Phase 0 — Foundation (current)

Deliverables:
- Product vision and MVP boundary
- Game design and system architecture
- Uganda economic-model specification
- Testing strategy
- Technical decision record

Exit criteria: scope is coherent, major risks are identified and the repository has a documented workflow.

## Phase 1 — Engine and platform spike

Build a tiny Godot project with:
- Main menu and responsive layout
- One sample scene
- Local save/load
- A basic monthly simulation tick
- Export smoke tests for Android, Web, Windows, macOS and Linux

Exit criteria: each target platform has a documented build result, known limitations and a reproducible export procedure. Do not assume all exports work merely because the engine supports them.

## Phase 2 — Simulation foundation

Implement:
- Simulation calendar and deterministic seed
- Currency and rounding utilities
- Event log
- Country/district configuration loader
- Versioned save schema

Exit criteria: deterministic tests pass and a save can be loaded after application restart.

## Phase 3 — Property and acquisition

Implement:
- Market opportunity catalogue
- Parcel and asset models
- Due diligence
- Purchase transaction
- Asset register and valuation display

Exit criteria: buying an asset updates cash, liabilities where applicable and the asset register consistently.

## Phase 4 — Development and construction

Implement:
- Building archetypes
- Project budgets and contingency
- Funding checks
- Construction milestones and time progression
- Completion and unit generation

Exit criteria: project costs, schedule and asset state are correct across normal and adverse events.

## Phase 5 — Leasing and property operations

Implement:
- Units and availability
- Tenant generation
- Lease creation
- Rent invoices and receipts
- Deposits, arrears, vacancy and maintenance

Exit criteria: monthly rent and expenses reconcile to ledger entries and dashboard values.

## Phase 6 — Finance and economy

Implement:
- Accounts and double-entry or equivalent auditable ledger
- Loans, interest and repayment schedules
- Operating statements and cash-flow reports
- Market demand, inflation and construction-cost changes

Exit criteria: accounting invariants and scenario tests pass.

## Phase 7 — Gameplay and content

Implement:
- Tutorial and campaign objectives
- AI competitors
- Events and challenge scenarios
- Progression and achievements
- Initial Uganda content pack

Exit criteria: a complete playable campaign slice is engaging and can be completed without developer intervention.

## Phase 8 — UX, accessibility and optimization

Test on baseline Android devices, tablets, browsers and desktop systems. Improve input, typography, navigation, performance, localization and accessibility.

## Phase 9 — Release preparation

Deliver:
- Platform-specific release builds
- Privacy and store disclosures appropriate to actual data collection
- Crash reporting policy if used
- Backup and recovery guidance
- QA report, known issues and version notes
- Distribution checklist

## Working rules

- Implement one phase at a time.
- Create a Git branch for risky or broad changes.
- Keep the main branch buildable.
- Do not silently replace UI or architecture.
- Every feature requires acceptance criteria and tests.
- Record actual progress; never mark work complete based only on a plan.
