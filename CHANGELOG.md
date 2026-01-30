# Changelog

All notable changes to this project will be documented in this file.

## [1.0.7] - 2026-01-30

### Fixed

- Default `flip()` placement selection now follows the canonical placement order (`top` → `top-start` → `top-end` → `right` → `right-start` → `right-end` → `bottom` → `bottom-start` → `bottom-end` → `left` → `left-start` → `left-end`).

### Changed

- `flip` demo now relies on default placement order when `placements` are not provided.

## [1.0.6] - 2026-01-30

### Fixed

- `flip()` now evaluates available space across all directions (including `*-start`/`*-end`) and falls back to the side with the most space when none fit.
- Fit checks for `flip()` continue to ignore `shift()` to avoid false positives.
- `strategy: 'fixed'` flip checks now use viewport coordinates for available space.

### Added

- Tests for flip selection across all placements for both `fixed` and `absolute` strategies.

### Changed

- README fixed-strategy example now highlights viewport-based flipping behavior.

## [1.0.5] - 2026-01-29

### Fixed

- `computePosition` now guarantees numeric `x/y`, adding a fixed-strategy fallback when `y` is not computed.

## [1.0.4] - 2026-01-28

### Added

- `computePosition(..., { strategy: 'fixed' })` to return viewport-based coordinates for fixed/teleported floating elements.
- Fixed-strategy examples/tests covering viewport resize and reference movement behavior.

### Changed

- README now documents `strategy` and fixed-coordinate behavior.
- Dev demo for fixed teleport now uses `strategy: 'fixed'`.

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
