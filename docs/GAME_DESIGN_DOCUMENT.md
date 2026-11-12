# Game Design Document

## Game identity

**Title:** REAL ESTATE EMPIRE – AFRICA  
**Genre:** Real estate tycoon / business strategy / management simulation  
**Perspective:** Interface-led strategy simulation, with map and property-detail views  
**Initial setting:** A fictionalized, Uganda-inspired market  
**Primary loop:** Research → acquire → finance → develop → operate → reinvest

## Player fantasy

The player builds a property enterprise from a modest starting position into a respected regional real estate group. Success comes from good decisions, operational discipline and adapting to changing market conditions—not from guaranteed profits.

## Player interface

Primary navigation:
- Overview
- Map / Market
- Properties
- Projects
- Tenants
- Finance
- Research
- Objectives

The interface should prioritize legibility, short task paths and clear financial summaries. Mobile uses touch-first controls; desktop adds mouse and keyboard shortcuts. Avoid dense desktop-only tables on phone screens.

## Property lifecycle

A property may move through states such as:
- Opportunity
- Under due diligence
- Owned / undeveloped
- Planning
- Under construction
- Completed / vacant
- Partially occupied
- Fully occupied
- Listed for sale
- Sold

State transitions must be validated. For example, construction cannot begin without ownership, a valid project plan, sufficient funding or an explicitly supported financing arrangement.

## Land and due diligence

Each opportunity can include area, location tier, permitted use, access, utilities, terrain, title-risk rating, planning-risk rating and asking price. These are game attributes, not legal representations. Due diligence should expose uncertainty and allow the player to spend time or money to reduce it.

## Development

The player selects a building archetype and scale, then reviews:
- Estimated construction cost
- Contingency
- Project duration
- Financing requirement
- Expected rentable or saleable area
- Expected operating costs
- Risk factors

Construction progresses by game time. Events may change costs or schedules. The player should receive warnings before a project becomes insolvent.

## Leasing and operations

Units have type, floor area, asking rent, condition and availability. Tenants have affordability, reliability and lease preferences represented by game attributes. Leases define rent, deposit, duration, escalation rules and payment status. Deposits must be tracked as liabilities, not treated as operating income.

Operations include maintenance, utilities where landlord-paid, management costs, vacancy and arrears. Avoid presenting unlawful or discriminatory tenant-screening mechanics as recommended real-world practice.

## Finance

The finance screen distinguishes:
- Cash and cash equivalents
- Property book value
- Other assets
- Loan principal outstanding
- Deposits held
- Payables
- Equity / net worth
- Rental income
- Operating expenses
- Net operating income
- Debt service
- Net cash flow

Do not confuse property value appreciation with cash received. Loan principal repayment reduces cash and liability; it is not an operating expense in the same way as interest.

## Time and events

The default simulation advances monthly. Events may include demand changes, material price changes, interest-rate changes, infrastructure improvements, weather disruptions and regulatory changes. Events must be bounded, explainable and recorded in the event log.

## AI competitors

Competitors use the same market rules as the player, with simplified decision-making appropriate to performance limits. They should have distinct strategies, budgets and risk tolerance. Avoid hidden cheating that makes the simulation feel arbitrary.

## Tutorial

Teach one concept at a time:
1. Read a market opportunity.
2. Estimate acquisition and due-diligence costs.
3. Buy a small property.
4. Improve or develop it.
5. Lease units.
6. Review monthly cash flow.
7. Handle a maintenance or vacancy event.

## MVP acceptance criteria

A new player can complete a full monthly cycle, acquire an asset, complete a small development, lease at least one unit, receive rent, pay expenses, see correct cash and balance-sheet changes, save, close and reload without losing state.
