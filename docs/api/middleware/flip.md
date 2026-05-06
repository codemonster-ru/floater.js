# Flip

`flip(params?)` tries alternative placements when the current placement does not fit.

## Signature

```ts
flip(params?: { placements?: PlacementType[] })
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `placements` | `PlacementType[]` | Optional ordered fallback list. |

## Return Value

Returns a flip middleware object for `computePosition(..., { middleware })`.

## Behavior

- Without `placements`, the internal full fallback order is used.
- With `placements`, fallback is restricted to that list.
- Works best after `offset` and before `shift`.

## Example

Interactive demo:

````playground-src
framework: vanilla
height: 340
entry: /main.js

```html file=/index.html
<!doctype html>
<html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><link rel="stylesheet" href="/styles.css" /></head><body><div class="stage"><button id="reference">Move mouse near edge</button><div id="floating">flip fallback</div></div><script type="module" src="/main.js"></script></body></html>
```

```css file=/styles.css
body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif}.stage{min-height:280px;display:grid;place-items:center;position:relative;background:#fff9f2}#reference{padding:10px 14px;border:0;border-radius:10px;background:#c45b12;color:#fff}#floating{position:absolute;left:0;top:0;background:#7a3208;color:#fff;padding:8px 10px;border-radius:8px;white-space:nowrap}
```

```js file=/main.js
import { computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference');
const floating = document.querySelector('#floating');

const update = async () => {
  const { x, y, placement } = await computePosition(reference, floating, {
    placement: 'bottom',
    middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift({ padding: 8 })],
  });

  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
  floating.textContent = `resolved: ${placement}`;
};

window.addEventListener('resize', update);
window.addEventListener('scroll', update, true);
update();
```

````

```ts
computePosition(reference, floating, {
  placement: 'bottom',
  middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
});
```

## Common Pitfalls

- Overly restrictive `placements` arrays that remove valid fallbacks.
- Running `flip` before `offset` when offset must be part of fit checks.
