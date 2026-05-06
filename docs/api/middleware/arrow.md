# Arrow

`arrow(arrowElement)` computes arrow coordinates and writes them to `middlewareData.arrow`.

## Signature

```ts
arrow(arrowElement: HTMLElement)
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `arrowElement` | `HTMLElement` | Arrow node rendered inside the floating element. |

## Return Value

Returns an arrow middleware object for `computePosition(..., { middleware })`.

## Behavior

- Computes arrow coordinates from the final floating geometry.
- Exposes coordinates as `middlewareData.arrow`.
- Should run after `offset`, `flip`, and `shift`.

## Output

- `middlewareData.arrow.x`: Arrow `left` coordinate.
- `middlewareData.arrow.y`: Arrow `top` coordinate.
- `middlewareData.arrow.baseX`: Base floating `x` used for arrow calculation.
- `middlewareData.arrow.baseY`: Base floating `y` used for arrow calculation.

## Example

Interactive demo:

````playground-src
framework: vanilla
height: 360
entry: /main.js

```html file=/index.html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="stage">
      <button id="reference" class="ref">Arrow middleware</button>
      <div id="floating" class="float">
        tooltip
        <div id="arrow" class="arrow"></div>
      </div>
    </div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

```css file=/styles.css
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.stage {
  min-height: 300px;
  display: grid;
  place-items: center;
  position: relative;
  background: #f2f8fb;
}

.ref {
  padding: 10px 14px;
  border: 0;
  border-radius: 10px;
  background: #0f7a88;
  color: #fff;
}

.float {
  position: absolute;
  left: 0;
  top: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: #0b4d56;
  color: #fff;
}

.arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #0b4d56;
  transform: rotate(45deg);
}
```

```js file=/main.js
import { arrow, computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference');
const floating = document.querySelector('#floating');
const arrowEl = document.querySelector('#arrow');

computePosition(reference, floating, {
  placement: 'top',
  middleware: [offset(10), flip(), shift({ padding: 8 }), arrow(arrowEl)],
}).then(({ x, y, placement, middlewareData }) => {
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;

  const data = middlewareData.arrow;
  const side = placement.split('-')[0];
  const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side];

  arrowEl.style.left = data?.x != null ? `${data.x}px` : '';
  arrowEl.style.top = data?.y != null ? `${data.y}px` : '';
  arrowEl.style.right = '';
  arrowEl.style.bottom = '';
  arrowEl.style[staticSide] = '-5px';
});
```
````

```ts
computePosition(reference, floating, {
  middleware: [offset(8), flip(), shift(), arrow(arrowEl)],
}).then(({ middlewareData }) => {
  if (middlewareData.arrow) {
    arrowEl.style.left = `${middlewareData.arrow.x}px`;
    arrowEl.style.top = `${middlewareData.arrow.y}px`;
  }
});
```

## Common Pitfalls

- Running `arrow(...)` before geometry middleware (`offset`, `flip`, `shift`).
- Reading `middlewareData.arrow` without a guard in dynamic middleware stacks.
