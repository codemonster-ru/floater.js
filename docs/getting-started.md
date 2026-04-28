# Getting Started

Floater.js is a tiny positioning library for tooltips, popovers, dropdowns, and context menus.

Use it when you need:

- predictable floating element positioning
- fallback placement logic with `flip`
- boundary clamping with `shift`
- reactive updates on scroll and resize with `autoUpdate`

## Installation

```bash
npm i @codemonster-ru/floater.js
```

## First integration

```ts
import { computePosition, offset, flip, shift, arrow, autoUpdate } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference') as HTMLElement;
const floating = document.querySelector('#floating') as HTMLElement;
const arrowEl = document.querySelector('#arrow') as HTMLElement;

const update = () => {
    computePosition(reference, floating, {
        placement: 'bottom',
        middleware: [offset(8), flip(), shift(), arrow(arrowEl)],
    }).then(({ x, y, middlewareData }) => {
        floating.style.left = `${x}px`;
        floating.style.top = `${y}px`;

        if (middlewareData.arrow) {
            arrowEl.style.left = `${middlewareData.arrow.x}px`;
            arrowEl.style.top = `${middlewareData.arrow.y}px`;
        }
    });
};

const cleanup = autoUpdate(reference, update, floating);
update();

// Call cleanup() when the floating UI is hidden/unmounted.
```

## Positioning strategy

- `absolute` (default): coordinates are resolved in offset-parent space
- `fixed`: coordinates are resolved in viewport space

Use `fixed` for teleported overlays attached to `document.body`:

```ts
floating.style.position = 'fixed';
document.body.appendChild(floating);

computePosition(reference, floating, {
    strategy: 'fixed',
    placement: 'bottom',
    middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
});
```

## SSR usage

Floater.js can be imported in SSR environments, but DOM-dependent APIs should run only in the browser.

- Safe on the server: module imports
- Client-only: `computePosition(...)`, `autoUpdate(...)`

## Next steps

- [Documentation overview](./index.md)
- [Core API](./api/core.md)
- [Compute Position](./api/compute-position.md)
- [Auto Update](./api/auto-update.md)
- [Middleware API](./api/middleware.md)
- [TypeScript API](./api/typescript.md)
- [Recipes](./guides/recipes.md)
- [Performance](./guides/performance.md)
- [Troubleshooting](./guides/troubleshooting.md)
