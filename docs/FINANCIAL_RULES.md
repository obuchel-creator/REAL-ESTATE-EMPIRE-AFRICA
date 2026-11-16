# Financial Rules & Invariants: Real Estate Empire – Africa

1. **Currency Unit**: Ugandan Shillings (UGX).
2. **Integer Representation**: All monetary balances and transaction amounts are represented as integers in UGX. Floating-point arithmetic is strictly forbidden for financial balances.
3. **Centralized Ledger**: Every financial movement (income, expense, capital, construction, loan) must pass through `FinanceManager` and create an immutable transaction record containing ID, date, type, description, amount, previous balance, and new balance.
4. **Insufficient Funds Protection**: An expense or purchase cannot exceed available cash unless an authorized credit facility is active. Invalid overdrawn transactions are rejected and leave balances unchanged.
5. **Net Worth Calculation**: Net Worth equals Total Assets (Cash + Property Valuations) minus Total Liabilities.
6. **Save Persistence**: Financial state and transaction history are fully persisted and validated upon save/load.
