# Cross-Platform Compatibility Guide

Real Estate Empire – Africa is engineered for multi-platform deployment across:
1. **Android**: APK / AAB builds via Godot Android export pipeline (ARM64 & ARMv7). Touch-optimized responsive UI.
2. **Web**: HTML5 / WebAssembly build running in modern browsers with responsive CSS and localStorage persistence.
3. **Windows / macOS / Linux**: Native desktop execution via Godot 4 Vulkan or Compatibility rendering backends.

## Platform Differences & Storage
- Web builds rely on browser `localStorage` and Blob downloads for save backups.
- Desktop and Android builds utilize user data directories (`user://`) for atomic file persistence.
- Input handling abstracts mouse clicks and touch taps seamlessly.
