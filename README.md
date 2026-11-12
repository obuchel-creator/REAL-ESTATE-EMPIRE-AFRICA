# REAL ESTATE EMPIRE – AFRICA

**An Africa-first real estate investment and development simulation game.**

REAL ESTATE EMPIRE – AFRICA is a strategy and management simulation in which players build wealth by acquiring land, developing property, managing tenants, financing projects and expanding a real estate portfolio. The first playable market is Uganda, with a modular country system designed for expansion across Africa.

## Target platforms

- Android
- Web
- Windows
- macOS
- Linux

## Project status

**Stage:** Project foundation  
**Implementation status:** Not yet started  
**Initial market:** Uganda  
**Proposed game engine:** Godot 4 (GDScript), subject to a technical export prototype before full production.

## Product principles

1. Uganda-first, Africa-scalable economic simulation.
2. One shared gameplay and simulation codebase wherever practical.
3. Offline-capable single-player core.
4. Transparent, data-driven economic rules.
5. No real-money investment, deposits, lending or property transactions.
6. Clear separation between fictional game economy and real-world property advice.
7. Accessible controls and performance-conscious builds for modest devices.

## Documentation

- [Project Blueprint](docs/PROJECT_BLUEPRINT.md)
- [Game Design Document](docs/GAME_DESIGN_DOCUMENT.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Uganda Economic Model](docs/UGANDA_ECONOMIC_MODEL.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)
- [Technical Decisions](docs/TECHNICAL_DECISIONS.md)

## Proposed repository layout

```text
.
├── docs/
├── game/
│   ├── scenes/
│   ├── scripts/
│   ├── data/
│   ├── assets/
│   └── ui/
├── tests/
├── tools/
├── project.godot
├── README.md
└── .gitignore
```

## Development workflow

Work in small, reviewable phases. Each phase must include acceptance criteria, tests and a documented result. Do not replace established gameplay or UI without a deliberate design decision. Keep secrets, signing keys and private player data out of Git.

## Disclaimer

All property listings, land prices, construction costs, rents, financing terms, taxes and market events in the game are simulated. They are not offers, valuations, legal advice or financial advice. Real-world figures must be sourced, dated and reviewed before being used as calibration data.

## Next milestone

Create a minimal Godot 4 technical prototype, verify exports for Android, Web and desktop, then lock the engine decision before building production systems.
