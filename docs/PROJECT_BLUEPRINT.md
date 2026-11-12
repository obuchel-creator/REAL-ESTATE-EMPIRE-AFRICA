# Project Blueprint

## 1. Vision

Build a high-quality real estate investment and development simulation rooted in African property markets. The player starts with limited capital and grows a property business through disciplined acquisition, development, leasing, operations and strategic expansion.

Uganda is the initial market and tutorial environment. The game architecture must support additional countries through configuration and data packs rather than country-specific rewrites.

## 2. Game pillars

- **Acquire:** identify opportunities, inspect plots, assess title and planning risk, negotiate and purchase.
- **Develop:** select a use, commission designs, obtain simulated approvals, budget, procure materials and construct.
- **Operate:** advertise units, screen tenants, sign leases, collect rent, maintain assets and manage vacancies.
- **Finance:** manage cash flow, equity, debt, interest, repayment and liquidity.
- **Invest:** compare yields, risks, locations and development opportunities.
- **Expand:** enter new districts, cities and countries as the business grows.
- **Compete:** respond to AI investors, developers, landlords, market cycles and economic shocks.

## 3. Intended audience

Strategy and tycoon-game players, aspiring property developers, students interested in business and economics, and players interested in African cities. The game must remain entertaining first; it is not a professional valuation or investment platform.

## 4. Core game loop

1. Review the market, objectives and available cash.
2. Research an opportunity.
3. Conduct due diligence and estimate total acquisition cost.
4. Acquire or reject the opportunity.
5. Plan and finance a development or choose to hold the asset.
6. Build, lease or sell.
7. Collect income and pay operating expenses, debt service and simulated taxes.
8. Review performance and reinvest.
9. Advance time and respond to new events.

## 5. Game modes

- **Campaign:** guided progression through a fictional Uganda property-business journey.
- **Sandbox:** configurable starting capital, difficulty, market volatility and objectives.
- **Challenge scenarios:** bounded situations such as a construction-cost shock, high vacancy or a financing squeeze.
- **Future expansion:** optional multiplayer or shared market features only after the offline core is stable.

## 6. Progression

Progression should be earned through business performance, reputation, completed projects, risk management and unlockable capabilities. Avoid pay-to-win mechanics. Difficulty settings should alter economic conditions transparently.

## 7. Simulation scope

The simulation includes land, buildings, units, construction projects, tenants, leases, income, expenses, loans, market indicators, competitors, events and player objectives. Every monetary calculation must use a consistent currency representation and explicit rounding rules.

## 8. MVP boundary

The first playable MVP is a single-player, offline Uganda market with:
- One compact fictionalized city map or district selection screen.
- A small set of land and building opportunities.
- Buy, hold, develop, lease and sell actions.
- Construction duration and budget.
- Tenants, occupancy and rent collection.
- Operating expenses and basic financing.
- Monthly time advancement.
- Save/load.
- A dashboard showing cash, assets, liabilities and monthly net operating income.

Defer multiplayer, live property feeds, real-money payments, user-generated marketplaces and advanced procedural city simulation.

## 9. Quality requirements

- Stable save files and safe migration strategy.
- Responsive UI for phone, tablet, browser and desktop.
- Readable text and accessible colour contrast.
- Deterministic core financial calculations.
- No hard-coded market values scattered across gameplay scripts.
- Automated tests for critical economic rules.
- Clear distinction between game data and real-world reference data.

## 10. Success measures

Track completion of the tutorial, successful completion of a first development, player understanding of cash flow and debt, save reliability, crash-free sessions, performance on baseline Android hardware and successful platform exports. Do not claim traction or commercial success without measured evidence.
