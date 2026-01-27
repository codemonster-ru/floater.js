# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-01-27

### Changed

- Library build outputs now use clean filenames: `dist/index.mjs` and `dist/index.cjs`.
- Vite library formats were aligned to `es` and `cjs` to match those filenames.
- `package.json` entry points (`main`, `module`, and `exports`) were updated to point at the new files.
- Type entry for both `import` and `require` now points to the generated `dist/index.d.ts`.

## [1.0.0] - 2026-01-27

### Added

- A test setup based on Vitest + JSDOM.
- Unit tests covering core behavior: placement, offset, shift, flip, arrow, and autoUpdate cleanup.
- Explicit API stability contracts and migration notes in `README.md`.

### Changed

- `autoUpdate(reference, callback)` now returns a cleanup function that removes listeners.
- `middlewareData.arrow` now keeps arrow coordinates (`x/y`) and exposes `baseX/baseY`.
- Clamping and visibility logic was hardened for:
    - scroll containers
    - viewport checks when no scroll parent exists
    - `shift + offset` interactions and padding consistency at edges
- Virtual element handling in the demo was improved to avoid scroll artifacts.

### Notes

- Behavior is intended to be more predictable at edges and in scroll containers.
- If you relied on older edge-case behavior, see migration notes in `README.md`.
