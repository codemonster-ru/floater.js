# Shift

`shift(params?)` keeps the floating element within visible bounds.

## Signature

```ts
shift(params?: { parent?: HTMLElement; padding?: number })
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `parent` | `HTMLElement` | Optional explicit boundary element. |
| `padding` | `number` | Optional viewport/boundary padding in pixels. Must be finite and non-negative. |

## Return Value

Returns a shift middleware object for `computePosition(..., { middleware })`.

## Behavior

- Without `parent`, bounds come from viewport and scroll containers.
- When `padding` is set, bounds are inset by that value.
- When `padding` is omitted, `shift` keeps the previous behavior and uses `Math.abs(offset)` as padding if an `offset` middleware is present.
- Clamps coordinates to keep the floating element visible.
- Works best after `offset` and `flip`.

## Example

Interactive demo:

````playground-src
framework: vanilla
height: 360
entry: /main.js

```html file=/index.html
<!doctype html>
<html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><link rel="stylesheet" href="/styles.css" /></head><body><div class="stage"><button id="reference" class="ref">Shift boundary</button><div id="floating" class="float">kept in bounds</div></div><script type="module" src="/main.js"></script></body></html>
```

```css file=/styles.css
body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif}.stage{min-height:300px;padding:16px;position:relative;overflow:hidden;background:#f7f7fb}.ref{position:absolute;right:12px;bottom:18px;padding:10px 14px;border:0;border-radius:10px;background:#5a53d6;color:#fff}.float{position:absolute;left:0;top:0;padding:8px 10px;border-radius:8px;background:#2d2a80;color:#fff}
```

```js file=/main.js
import { computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference');
const floating = document.querySelector('#floating');

computePosition(reference, floating, {
  placement: 'right-start',
  middleware: [offset(8), flip(), shift({ padding: 12 })],
}).then(({ x, y }) => {
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
});
```

````

```ts
computePosition(reference, floating, {
  middleware: [offset(8), flip(), shift({ padding: 8 })],
});
```

## Common Pitfalls

- Using a `parent` boundary that is too small for expected placements.
- Large offsets that force frequent clamping.
