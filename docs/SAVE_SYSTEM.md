# Save System & Persistence Architecture

1. **Storage Mechanism**: LocalStorage with versioned keys (`real_estate_empire_africa_save_v1`).
2. **Atomic Backup Rotation**: Prior to writing a new save, the existing save is rotated into a backup slot (`real_estate_empire_africa_backup_v1`) to prevent data loss.
3. **Schema Validation**: Saves are verified upon loading. If schema validation fails or JSON is corrupted, the system automatically falls back to the backup save, and if that fails, initializes a clean default game state.
4. **JSON Export/Import**: Players can export their save state as a downloadable `.json` file or paste JSON strings to restore or transfer progress across browsers and devices.
