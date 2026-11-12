# Technical Decisions and Risks

## Decision 001 — Proposed game engine

**Status:** Provisional  
**Candidate:** Godot 4  
**Rationale:** Open-source engine, GDScript, scene-based UI and export options for mobile, web and desktop.

**Required validation before commitment:**
- Android export and touch interaction
- Web export in current desktop and mobile browsers
- Windows, macOS and Linux exports
- Performance and memory use on modest Android hardware
- Save compatibility and file access per platform
- Any limitations of browser threading, audio, storage or networking

If the platform spike fails a required target, compare alternatives before production implementation. Do not rewrite the project based on assumption alone.

## Decision 002 — Offline-first MVP

**Status:** Accepted  
The core single-player simulation and saves work without an account or network connection. Online services are deferred.

## Decision 003 — Data-driven country packs

**Status:** Accepted  
Country-specific assumptions live in configuration/content data. Generic simulation rules must not contain hard-coded Uganda-only branches.

## Decision 004 — Financial integrity

**Status:** Accepted  
All monetary movements go through a finance/ledger service. Use integer arithmetic and explicit rounding; never let UI controls directly change cash balances.

## Open risks

1. **Cross-platform export differences:** validate early with a minimal prototype.
2. **Economic data quality:** distinguish fictional game balance values from sourced real-world calibration.
3. **Scope growth:** defer multiplayer, real listings and live integrations until the single-player loop is complete.
4. **Low-end device performance:** profile early and keep scenes, assets and simulation workloads modest.
5. **Save corruption:** implement atomic writes, backups and migration tests.
6. **Legal interpretation:** game abstractions must not be presented as current legal, tax or investment advice.

## Change control

Update this file when a material technology or architecture decision changes. Include context, options considered, decision, consequences and date.
