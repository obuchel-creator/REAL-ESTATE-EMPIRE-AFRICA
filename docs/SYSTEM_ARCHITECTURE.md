# System Architecture: Real Estate Empire – Africa

## Architecture Overview
The game architecture is structured into loosely coupled, highly testable domains:
- **GameManager**: Coordinates game state, calendar, and high-level progression.
- **SimulationClock**: Handles deterministic calendar increments and monthly simulation ticks.
- **PlayerManager**: Manages player profile, company name, experience points, and business titles.
- **FinanceManager**: Dedicated financial service enforcing strict integer arithmetic and transaction verification.
- **SaveManager**: Local storage persistence with atomic backup rotation and JSON import/export.
- **UgandaConfiguration**: Data-driven regional market definitions and macroeconomic parameters.
