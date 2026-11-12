# Testing Strategy

## Quality goals

The game must be financially consistent, deterministic where intended, resilient to interrupted saves and usable across supported screen sizes and platforms.

## Test layers

### Unit tests
- Currency arithmetic and rounding
- Interest and repayment calculations
- Rent proration if included
- Vacancy and occupancy calculations
- Construction cost estimates
- Market modifiers
- State-transition validation
- Save schema validation and migration

### Domain / integration tests
- Acquire property and reconcile ledger
- Fund and complete a development
- Create lease and invoice rent
- Receive partial and full rent payments
- Hold and refund a tenant deposit
- Record maintenance expense
- Advance one month and process all scheduled transactions
- Load a save and continue the same simulation

### Scenario tests
- Low cash before construction milestone
- Construction cost inflation
- Extended vacancy
- Tenant arrears
- Interest-rate increase
- Unexpected maintenance
- Asset sale with outstanding loan
- Save interruption and recovery

### UI tests
- Navigation and back behaviour
- Phone, tablet and desktop layouts
- Keyboard and touch input
- Text scaling and contrast
- Empty, loading, error and confirmation states

### Platform tests
Smoke-test Android, Web, Windows, macOS and Linux builds. Record engine version, export template version, OS/device, build identifier, result and known limitations.

## Financial invariants

- Cash changes only through recorded transactions.
- Every posted transaction has balanced debit and credit totals if using double-entry accounting.
- Deposits held are liabilities, not rental revenue.
- Loan principal outstanding cannot become negative.
- A payment cannot exceed the amount due unless overpayment handling is explicitly defined.
- Sold assets no longer generate rent after the sale effective date.
- Dashboard totals reconcile with underlying records.
- Replaying the same deterministic seed and actions produces the same results.

## Save testing

Test valid saves, corrupted saves, older schema versions, missing optional fields, interrupted writes and backup restoration. Never overwrite the only known-good save before validating the replacement.

## Release gates

A release candidate must have:
- No known critical or high-severity defects
- Passing core financial tests
- Successful save/load and migration tests
- Platform smoke-test results
- Performance checks on baseline Android hardware
- Accessibility review
- Documented known issues and rollback/recovery procedure

## Defect reporting

Record title, build, platform, reproduction steps, expected result, actual result, severity, evidence and owner. A bug is not fixed until the reproduction case passes after the change.
