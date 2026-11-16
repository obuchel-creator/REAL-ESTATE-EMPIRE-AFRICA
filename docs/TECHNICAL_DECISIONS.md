# Technical Decisions & Architecture Records

1. **Godot 4 Architecture with Web Prototype Bridge**: Adopting Godot 4 (GDScript) as the engine direction, while building a robust TypeScript/React technical prototype in the preview environment to validate domain models, UI/UX, and financial ledgers.
2. **Integer-Based Financial Arithmetic**: All financial calculations use integer-based UGX representation to eliminate floating-point precision drift.
3. **Atomic Save Persistence**: Implementing localStorage save rotation with automatic fallback to backup snapshots upon corruption detection.
