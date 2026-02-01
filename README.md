# Floater.js

![npm version](https://img.shields.io/npm/v/@codemonster-ru/floater.js)
![npm downloads](https://img.shields.io/npm/dm/@codemonster-ru/floater.js)
![publish](https://img.shields.io/github/actions/workflow/status/codemonster-ru/floater.js/publish.yml?label=publish)
![license](https://img.shields.io/npm/l/@codemonster-ru/floater.js)

A tiny JS/TS library for positioning floating UI elements (tooltips, popovers, menus).

## Install

```bash
npm i @codemonster-ru/floater.js
```

## Usage

```ts
import { computePosition, offset, shift, flip, arrow, autoUpdate } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference') as HTMLElement;
const floating = document.querySelector('#floating') as HTMLElement;
const arrowEl = document.querySelector('#arrow') as HTMLElement;

const update = () => {
    computePosition(reference, floating, {
        placement: 'right',
        middleware: [shift(), offset(8), arrow(arrowEl)],
    }).then(({ x, y, middlewareData }) => {
        floating.style.left = `${x}px`;
        floating.style.top = `${y}px`;

        if (middlewareData.arrow) {
            arrowEl.style.left = `${middlewareData.arrow.x}px`;
            arrowEl.style.top = `${middlewareData.arrow.y}px`;
        }
    });
};

const cleanup = autoUpdate(reference, update);
update();

// Later: cleanup();
```

## API

### computePosition(reference, floating, options?)

Returns a Promise that resolves to `{ x, y, placement, middlewareData }`.

- `reference`: `HTMLElement | VirtualElement`
- `floating`: `HTMLElement`
- `options.placement`: one of `placementTypes` (default: `bottom`)
- `options.middleware`: array of middleware
- `options.strategy`: `'absolute' | 'fixed'` (default: `'absolute'`)

#### Stability contract

- With `strategy: 'absolute'`, `x` and `y` are coordinates in the floating element's offset parent coordinate space (suitable for `style.left/top`).
- With `strategy: 'fixed'`, `x` and `y` are viewport coordinates (suitable for `position: fixed` elements teleported to `body`).
- Middleware runs in the order provided and can change `x`, `y`, and `placement`.
- `middlewareData[name]` stores the final result returned by that middleware.
- When `arrow(...)` is used, `middlewareData.arrow` includes:
    - `x` / `y`: arrow coordinates relative to the floating element
    - `baseX` / `baseY`: floating coordinates used for arrow calculation

#### Fixed strategy example (teleport to body)

```ts
floating.style.position = 'fixed';
document.body.appendChild(floating);

// With strategy: 'fixed', flip() checks space in viewport coordinates
// and picks the first fitting placement (or the side with the most space).
computePosition(reference, floating, {
    placement: 'bottom',
    strategy: 'fixed',
    middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
}).then(({ x, y }) => {
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
});
```

### placementTypes

Array of supported placements:

```
top, top-start, top-end,
right, right-start, right-end,
bottom, bottom-start, bottom-end,
left, left-start, left-end
```

### offset(value)

Offsets the floating element from the reference by `value` pixels.

### shift(params?)

Keeps the floating element inside the visible area.

- `params.parent`: optional container element. If provided, clamping uses that container; otherwise it uses the scroll parent.

### flip(params?)

If the placement is not visible, tries other placements.
When used together with `shift()`, the fit check ignores `shift()` to avoid picking placements that only fit after shifting.
When used together with `offset()`, put `offset()` before `flip()` so the fit check includes the offset.

- `params.placements`: optional list of placements to try, in order. Useful to restrict flipping (e.g. only `top`/`bottom`).

Example: restrict flipping to vertical directions only.

```ts
computePosition(reference, floating, {
    placement: 'bottom',
    middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
});
```

### arrow(arrowEl)

Computes arrow position and exposes it through `middlewareData.arrow`.

- `middlewareData.arrow.x/y`: arrow coordinates relative to the floating element
- `middlewareData.arrow.baseX/baseY`: floating coordinates used for arrow calculation

### autoUpdate(reference, callback)

Watches scroll/resize and calls `callback`.
Returns a cleanup function to remove listeners.

#### Stability contract

- Listeners are attached to:
    - the nearest scroll parent (if found)
    - `window` scroll
    - `window` resize
    - `ResizeObserver` for `reference` when available
- The returned cleanup function removes all listeners/observers added by `autoUpdate`.

### VirtualElement

Use when you need a virtual reference (e.g. mouse position).

```ts
const virtualEl: VirtualElement = {
    offsetTop: 100,
    offsetLeft: 200,
    getBoundingClientRect() {
        return {
            x: 200,
            y: 100,
            width: 0,
            height: 0,
            top: 100,
            right: 200,
            bottom: 100,
            left: 200,
        };
    },
};
```

## TypeScript

The package ships with types generated at build time via `tsc`. See `index.ts` for full exports.

## Migration notes (0.x -> 1.0)

- `autoUpdate(...)` now returns a cleanup function. Call it when the floating UI unmounts.
- `middlewareData.arrow` now keeps arrow coordinates (`x/y`) and also exposes `baseX/baseY`.
- Positioning and clamping behavior was hardened for scroll containers, viewport checks, and `shift + offset` interactions.

## License

[MIT](https://github.com/codemonster-ru/floater.js/blob/main/LICENSE)

## Author

[@KolesnikovKirill](https://github.com/kolesnikovKirill)
