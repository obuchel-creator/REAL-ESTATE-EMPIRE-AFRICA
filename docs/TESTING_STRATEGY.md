# Testing Strategy & Automated Verification

## Overview
Real Estate Empire – Africa enforces rigorous automated test coverage for all deterministic simulation logic and financial transactions.
- **Unit Testing**: Executed via browser-based test suite runner (`GameEngineTests.ts`).
- **Financial Invariant Assertions**: Validates zero-sum integrity, overdrawn expense rejection, net worth accuracy, and save corruption recovery.
- **Persistence Testing**: Tests localStorage roundtrips and JSON import/export reliability.
