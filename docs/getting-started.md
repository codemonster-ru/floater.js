# Getting Started

Floater.js computes robust coordinates for floating elements relative to reference elements.

## Installation

```bash
npm i @codemonster-ru/floater.js
```

## Quick Start

Interactive example (runs directly in docs):

````playground-src
framework: vanilla
height: 360
entry: /main.js

```html file=/index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Floater.js Quick Start</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="stage">
      <button id="reference" class="reference">Toggle tooltip</button>
      <div id="floating" class="floating" hidden>
        Positioned by Floater.js
      </div>
    </div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

```css file=/styles.css
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
.stage { min-height: 300px; display: grid; place-items: center; background: #f5f8fc; position: relative; }
.reference { border: 0; background: #1b6ed6; color: #fff; border-radius: 10px; padding: 10px 14px; cursor: pointer; }
.floating { position: absolute; left: 0; top: 0; background: #123765; color: #fff; border-radius: 8px; padding: 8px 10px; font-size: 13px; }
```

```js file=/main.js
import { autoUpdate, computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference');
const floating = document.querySelector('#floating');

let cleanup = null;

const update = async () => {
  const { x, y } = await computePosition(reference, floating, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
};

reference.addEventListener('click', async () => {
  if (!floating.hidden) {
    floating.hidden = true;
    cleanup?.();
    cleanup = null;
    return;
  }

  floating.hidden = false;
  await update();

  cleanup?.();
  cleanup = autoUpdate(reference, update, floating);
});
```

````

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

- `absolute`: best for floating elements within positioned layout containers.
- `fixed`: best for floating elements rendered in `document.body` or other viewport-level layers.
- Default is auto-detected: `fixed` when the floating element has CSS `position: fixed`, otherwise `absolute`.

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
