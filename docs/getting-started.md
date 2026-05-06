# Getting Started

Floater.js computes robust coordinates for floating elements relative to reference elements.

## Installation

```bash
npm i @codemonster-ru/floater.js
```

## Quick Start

```ts
import { autoUpdate, computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference') as HTMLElement;
const floating = document.querySelector('#floating') as HTMLElement;

const update = async () => {
  const { x, y } = await computePosition(reference, floating, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
};

const cleanup = autoUpdate(reference, update, floating);
update();

// Call cleanup() when the floating element is hidden or unmounted.
```

## Positioning Lifecycle

1. Call `computePosition(reference, floating, options)`.
2. Apply the returned coordinates (`x`, `y`) to your floating element.
3. Keep coordinates fresh with `autoUpdate(...)` while the floating element is visible.
4. Always dispose with the `cleanup` callback.

## Strategy: Absolute vs Fixed

- `absolute` (default): best for floating elements within positioned layout containers.
- `fixed`: best for floating elements rendered in `document.body` or other viewport-level layers.

```ts
floating.style.position = 'fixed';
document.body.appendChild(floating);

await computePosition(reference, floating, {
  strategy: 'fixed',
  placement: 'bottom',
  middleware: [offset(8), flip(), shift()],
});
```

## SSR Boundary

- Safe on server: importing the package.
- Browser-only: DOM-dependent calls such as `computePosition(...)` and `autoUpdate(...)`.

Run DOM logic only after mount (or inside client-only branches).

## Where To Next

- [Core API](./api/core.md)
- [Compute Position](./api/compute-position.md)
- [Middleware API](./api/middleware.md)
- [Recipes](./guides/recipes.md)
- [Performance Guide](./guides/performance.md)
