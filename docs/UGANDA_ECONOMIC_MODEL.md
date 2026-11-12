# Uganda Economic Model — Initial Specification

## Purpose and boundary

This document defines the structure for the first game economy. It does not assert that any listed value is a current Ugandan market fact. Initial numerical values must be labelled as fictional balancing parameters until researched, sourced, dated and reviewed.

## Geographic model

Start with a compact, fictionalized set of market areas inspired by Uganda. Kampala may be the first urban market, with other locations introduced as content packs. District and neighbourhood labels should not imply that fictional parcel data represents actual available land.

Each district profile can contain:
- Market tier and demand index
- Residential, retail, office and mixed-use demand
- Access and infrastructure score
- Utility availability score
- Development intensity / planning constraint
- Vacancy baseline
- Construction-cost index
- Market volatility and growth potential

## Currency

UGX is the initial display currency. Store monetary amounts in integer units with explicit precision and rounding. Do not mix UGX and foreign currencies without an explicit exchange-rate model and timestamp.

## Property categories

- Residential: room, apartment, house and multi-unit block
- Commercial: shop, office and mixed-use building
- Industrial / storage: warehouse and light industrial
- Land: undeveloped parcel with simulated permitted uses

## Market mechanics

A property's asking price and achievable rent should be influenced by location, size, permitted use, condition, access, utility availability, demand, supply and market cycle. Avoid a single universal price per decimal or rent per unit.

The valuation model should expose a range and uncertainty rather than presenting an exact number as guaranteed. Player research can improve information quality.

## Acquisition cost model

Total acquisition outlay may include:
- Negotiated purchase price
- Simulated due-diligence cost
- Simulated transaction and professional fees
- Improvement or remediation budget
- Contingency

Actual taxes, fees, title procedures and planning requirements must not be represented as authoritative legal guidance. Keep them configurable and label them as simplified game mechanics.

## Construction model

Construction estimates should be decomposed into:
- Design and professional services
- Site preparation
- Structure and labour
- Materials
- Utilities and services
- Finishes
- Approvals / compliance abstraction
- Contingency

Costs vary by building archetype, quality tier, floor area, location index and event modifiers. Construction time depends on scale, complexity, available funds and disruptions.

## Rental model

Monthly rent is influenced by unit type, floor area, location, condition, amenities and demand. Occupancy is probabilistic but explainable. Model:
- Contractual rent
- Amount invoiced
- Amount collected
- Arrears
- Vacancy loss
- Deposits held
- Operating expenses
- Net operating income

Deposits are refundable liabilities in the game model and must not be counted as earned rent.

## Financing model

Loans may specify principal, interest rate, term, fees, repayment frequency, collateral and covenants. Show the player total repayment and affordability risks before acceptance. Interest-rate shocks should be communicated clearly. Avoid implying that game terms are real lender offers.

## Tax and regulation abstraction

Use simplified, scenario-configurable tax and compliance rules. Display a clear notice that game rules are not a guide to current URA, land, tenancy, building or local-government requirements. Real-world calibration requires professional review and current official sources.

## Data provenance

Every real-world calibration record must include:
- Source title and publisher
- Source URL or document reference
- Publication / observation date
- Geographic scope
- Units and methodology
- Confidence rating
- Date last reviewed

Never fabricate a source or silently mix old and current data. Where reliable data is unavailable, use clearly labelled fictional values.

## Balancing objectives

The economy should reward:
- Maintaining liquidity
- Diversifying risk
- Completing projects on budget
- Managing vacancy and maintenance
- Matching financing duration to asset cash flow
- Avoiding over-leverage

It should also create meaningful trade-offs: high-growth districts may have higher acquisition costs and volatility; cheaper areas may have weaker demand or infrastructure.
