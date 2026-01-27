# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2026-01-27

### Fixed

- `computePosition(...)` now applies middleware-updated `placement`, so `flip()` results are reflected in the returned `placement` field.
- `flip({ placements })` now iterates allowed placements correctly even for short placement lists (e.g. `['bottom', 'top']`).
- `shift()` and visibility checks now treat `position: fixed` elements as viewport-based, improving `Teleport + fixed` behavior.

### Added

- `flip(params?)` now accepts `params.placements?: PlacementType[]` to restrict which placements can be tried.
- Tests for `*-end` placements and for restricted `flip({ placements })`.

## [1.0.2] - 2026-01-27

### Fixed

- `flip()` now checks whether a placement fits without applying `shift()` during the fit check, preventing false positives when `flip` and `shift` are used together.

### Changed

- The demo now includes a dedicated `Flip + Shift` example in `index.html`.

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
