# Floater.js

Floater.js is a TypeScript library for positioning tooltips, popovers, dropdowns, and context
menus relative to an anchor. It can offset the floating element, flip it to another side, or shift
it to keep it in view.

## Get started

```bash
npm install @codemonster-ru/floater.js
```

With `#reference` and `#floating` in the page, calculate and apply the coordinates in the browser.

```ts
import { computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector<HTMLElement>('#reference');
const floating = document.querySelector<HTMLElement>('#floating');

if (reference && floating) {
    floating.style.position = 'absolute';
    const { x, y } = await computePosition(reference, floating, {
        placement: 'bottom-start',
        middleware: [offset(8), flip(), shift()],
    });
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
}
```

See the [getting started guide](docs/getting-started.md) and the
[`autoUpdate` reference](docs/api/auto-update.md) to keep the element positioned while it is visible.

## Development and support

Run `npm ci` and `npm run check` to lint, test, build, and check the published entry points.
Use [GitHub Issues](https://github.com/codemonster-ru/floater.js/issues) for questions and reproducible bugs.

Follow the [contribution guide](./CONTRIBUTING.md) to propose changes.
Report vulnerabilities through the [security policy](./SECURITY.md).

Licensed under the [MIT License](LICENSE.md).
