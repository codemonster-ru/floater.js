# Recipes

Production-ready patterns for common floating-element scenarios.

All snippets assume `position: absolute` unless stated otherwise.

## Tooltip

```ts
computePosition(reference, floating, {
  placement: 'top',
  middleware: [offset(8), flip(), shift(), arrow(arrowEl)],
}).then(({ x, y, middlewareData }) => {
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;

  if (middlewareData.arrow) {
    arrowEl.style.left = `${middlewareData.arrow.x}px`;
    arrowEl.style.top = `${middlewareData.arrow.y}px`;
  }
});
```

### Tooltip Playground

````playground-src
framework: vanilla
height: 380
entry: /main.js

```html file=/index.html
<!doctype html>
<html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><link rel="stylesheet" href="/styles.css" /></head><body><div class="tooltip-demo-root"><button id="reference" type="button" class="tooltip-demo-reference">Hover me</button><div id="floating" role="tooltip" hidden class="tooltip-demo-floating">Floater.js computes coordinates and keeps this tooltip aligned.<div id="arrow" class="tooltip-demo-arrow"></div></div></div><script type="module" src="/main.js"></script></body></html>
```

```css file=/styles.css
.tooltip-demo-root{width:min(680px,92vw);min-height:320px;border:1px solid #c9ddf3;border-radius:16px;background:#fff;display:grid;place-items:center;position:relative;box-shadow:0 8px 30px rgba(53,106,157,.12);margin:12px 0}.tooltip-demo-reference{border:0;background:#1b6ed6;color:#fff;border-radius:12px;padding:12px 18px;font-size:16px;cursor:pointer}.tooltip-demo-floating{position:absolute;top:0;left:0;color:#fff;background:#163e72;border-radius:10px;padding:10px 12px;font-size:14px;line-height:1.3;max-width:220px}.tooltip-demo-arrow{position:absolute;width:12px;height:12px;background:#163e72;transform:rotate(45deg)}
```

```js file=/main.js
import { autoUpdate, arrow, computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference');
const floating = document.querySelector('#floating');
const arrowEl = document.querySelector('#arrow');

let cleanup = null;

const update = async () => {
  const { x, y, middlewareData, placement } = await computePosition(reference, floating, {
    placement: 'top',
    middleware: [offset(10), flip(), shift({ padding: 8 }), arrow(arrowEl)],
  });

  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;

  const arrowData = middlewareData.arrow;
  const side = placement.split('-')[0];
  const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side];

  arrowEl.style.left = arrowData?.x != null ? `${arrowData.x}px` : '';
  arrowEl.style.top = arrowData?.y != null ? `${arrowData.y}px` : '';
  arrowEl.style.right = '';
  arrowEl.style.bottom = '';
  arrowEl.style[staticSide] = '-6px';
};

const show = async () => {
  floating.hidden = false;
  await update();
  cleanup?.();
  cleanup = autoUpdate(reference, update, floating);
};

const hide = () => {
  floating.hidden = true;
  cleanup?.();
  cleanup = null;
};

reference.addEventListener('mouseenter', show);
reference.addEventListener('focus', show);
reference.addEventListener('mouseleave', hide);
reference.addEventListener('blur', hide);
```

````

## Dropdown

```ts
computePosition(button, menu, {
  placement: 'bottom-start',
  middleware: [offset(6), flip({ placements: ['bottom-start', 'top-start'] }), shift()],
}).then(({ x, y }) => {
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
});
```

## Context Menu (VirtualElement)

```ts
const pointRef = {
  offsetTop: event.clientY,
  offsetLeft: event.clientX,
  getBoundingClientRect() {
    return {
      x: event.clientX,
      y: event.clientY,
      width: 0,
      height: 0,
      top: event.clientY,
      right: event.clientX,
      bottom: event.clientY,
      left: event.clientX,
    };
  },
};

computePosition(pointRef, menu, {
  placement: 'right-start',
  middleware: [offset(4), flip(), shift()],
}).then(({ x, y }) => {
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
});
```

### Context Menu Playground

````playground-src
framework: vanilla
height: 420
entry: /main.js

```html file=/index.html
<!doctype html>
<html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><link rel="stylesheet" href="/styles.css" /></head><body><div id="stage" class="menu-demo-stage"><p class="menu-demo-note">Right click anywhere in this card to open the menu.</p><div id="menu" role="menu" hidden class="menu-demo-menu"><button type="button" role="menuitem">Open</button><button type="button" role="menuitem">Rename</button><button type="button" role="menuitem">Duplicate</button><button type="button" role="menuitem">Delete</button></div></div><script type="module" src="/main.js"></script></body></html>
```

```css file=/styles.css
.menu-demo-stage{width:min(740px,94vw);min-height:360px;border:1px solid #f1d8b6;border-radius:18px;background:#fff;box-shadow:0 10px 34px rgba(173,106,24,.16);padding:22px;position:relative;margin:12px 0}.menu-demo-note{margin:0;color:#7f5a24;font-size:15px}.menu-demo-menu{position:absolute;top:0;left:0;width:220px;background:#fff;border-radius:12px;border:1px solid #e8cfaa;box-shadow:0 12px 30px rgba(165,101,22,.2);padding:8px;display:grid;gap:4px}.menu-demo-menu button{border:0;width:100%;text-align:left;padding:8px 10px;border-radius:8px;background:transparent;cursor:pointer;color:#5a3a0f}
```

```js file=/main.js
import { computePosition, flip, shift } from '@codemonster-ru/floater.js';

const stage = document.querySelector('#stage');
const menu = document.querySelector('#menu');

let cursorX = 0;
let cursorY = 0;

const virtualReference = {
  offsetTop: 0,
  offsetLeft: 0,
  getBoundingClientRect: () => ({
    x: cursorX,
    y: cursorY,
    top: cursorY,
    left: cursorX,
    right: cursorX,
    bottom: cursorY,
    width: 0,
    height: 0,
  }),
};

const openMenu = async () => {
  menu.hidden = false;

  const { x, y } = await computePosition(virtualReference, menu, {
    placement: 'right-start',
    middleware: [flip(), shift({ padding: 10 })],
  });

  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
};

stage.addEventListener('contextmenu', async (event) => {
  event.preventDefault();
  cursorX = event.clientX;
  cursorY = event.clientY;
  await openMenu();
});

document.addEventListener('click', (event) => {
  if (!stage.contains(event.target)) {
    menu.hidden = true;
  }
});
```

````

## Fixed Portal Popover

```ts
floating.style.position = 'fixed';
document.body.appendChild(floating);

computePosition(reference, floating, {
  strategy: 'fixed',
  placement: 'bottom',
  middleware: [offset(8), flip(), shift()],
}).then(({ x, y }) => {
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
});
```

## Reactive Updates

```ts
const update = () => {
  computePosition(reference, floating, {
    placement: 'bottom',
    middleware: [offset(8), flip(), shift()],
  }).then(({ x, y }) => {
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
  });
};

const cleanup = autoUpdate(reference, update, floating);
update();

// ...
cleanup();
```
