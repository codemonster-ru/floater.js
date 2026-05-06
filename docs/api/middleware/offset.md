# Offset

`offset(value)` shifts floating coordinates away from the reference.

## Signature

```ts
offset(value: number)
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `number` | Distance in pixels. Positive values move the floating element away from the reference side. |

## Return Value

Returns an offset middleware object for `computePosition(..., { middleware })`.

## Behavior

- Applies distance before fallback and boundary checks.
- Should run before `flip` and `shift` in most stacks.

## Example

Interactive demo:

````playground-src
framework: vanilla
height: 340
entry: /main.js

```html file=/index.html
<!doctype html>
<html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><link rel="stylesheet" href="/styles.css" /></head><body><div class="stage"><button id="reference">Reference</button><div id="floating">offset: 20px</div></div><script type="module" src="/main.js"></script></body></html>
```

```css file=/styles.css
body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif}.stage{min-height:280px;display:grid;place-items:center;position:relative;background:#f7fafc}#reference{padding:10px 14px;border:0;border-radius:10px;background:#2d7a4f;color:#fff}#floating{position:absolute;left:0;top:0;background:#16442b;color:#fff;padding:8px 10px;border-radius:8px}
```

```js file=/main.js
import { computePosition, offset } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference');
const floating = document.querySelector('#floating');

computePosition(reference, floating, {
  placement: 'bottom',
  middleware: [offset(20)],
}).then(({ x, y }) => {
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
});
```

````

```ts
computePosition(reference, floating, {
  middleware: [offset(8), flip(), shift()],
});
```

## Common Pitfalls

- Passing non-finite values (`NaN`, `Infinity`).
- Placing `offset` after `flip` when offset should be included in fit checks.
