# Phase 1 — Godot Engine Spike

## Status
Scaffold committed. Runtime and export validation are **not yet performed**. Godot 4 remains a provisional engine choice.

## Prototype included
- Godot 4 project configuration using the Compatibility renderer.
- Main menu and profile creation.
- Uganda, Kenya, Tanzania and Rwanda market selector (Uganda is the initial content focus).
- Basic investor dashboard.
- Monthly calendar progression.
- Local JSON save/load with a version field.
- UI built with Godot Control nodes to support different screen sizes.

## Validation required on a development computer
1. Install the current stable Godot 4 standard editor (not the .NET build).
2. Open this repository folder using Godot's Project Manager.
3. Import the project and run the main scene.
4. Create a player, advance several months, save, close, reopen and load.
5. Resize the desktop window and verify controls remain usable.
6. Install export templates and test a Windows desktop build.
7. Test Android export only after configuring the Android SDK/JDK.
8. Record Godot version, operating system, test results, errors and screenshots.

## Exit criteria
- Project opens without parse errors.
- New Game and dashboard work.
- Month progression correctly rolls December into January of the next year.
- Save/load preserves all displayed player state.
- No data is lost when the app is closed after saving.
- Desktop export launches on a clean Windows test environment.
- Mobile layout is usable at a phone viewport size.

## Known limitations
- Starting capital is a placeholder balancing value.
- No property acquisition, construction, rent, debt, tax or AI competitor systems exist yet.
- No cloud account, analytics or online multiplayer.
- Android, Web, macOS and Linux export compatibility is not yet proven.
