# Compute Position

`computePosition(reference, floating, options?)` computes floating coordinates and middleware output.

## Signature

```ts
computePosition(
  reference: HTMLElement | VirtualElement,
  floating: HTMLElement,
  options?: OptionType,
): Promise<ParamsType>
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `PlacementType` | `'bottom'` | Initial preferred placement. |
| `middleware` | `MiddlewareType[]` | `[]` | Middleware chain executed left to right. |
| `strategy` | `'absolute' \| 'fixed'` | auto-detect | Coordinate system for returned `x` and `y`. Defaults to `fixed` when the floating element has CSS `position: fixed`; otherwise `absolute`. |

## Return Value

```ts
{
  x: number;
  y: number;
  placement: PlacementType;
  middlewareData: Record<string, MiddlewareOutType>;
}
```

## Behavior

- Middleware runs in the exact order provided.
- Middleware can adjust `x`, `y`, and `placement`.
- Middleware output is available as `middlewareData[name]`.
- Invalid built-in middleware params are sanitized and ignored.

## Example

Interactive demo:

````playground-src
framework: vanilla
height: 380
entry: /main.js

```html file=/index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>computePosition demo</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="stage">
      <button id="reference" class="reference">Reference</button>
      <div id="floating" class="floating">Floating</div>
      <pre id="log" class="log"></pre>
    </div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

```css file=/styles.css
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
.stage { min-height: 320px; background: #f6f9ff; padding: 24px; position: relative; }
.reference { border: 0; border-radius: 10px; background: #1f5fd0; color: #fff; padding: 10px 14px; }
.floating { position: absolute; left: 0; top: 0; background: #17345e; color: #fff; border-radius: 8px; padding: 8px 10px; }
.log { margin-top: 100px; background: #eef3ff; border-radius: 8px; padding: 10px; font-size: 12px; }
```

```js file=/main.js
import { computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector('#reference');
const floating = document.querySelector('#floating');
const log = document.querySelector('#log');

const update = async () => {
  const result = await computePosition(reference, floating, {
    placement: 'right-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  floating.style.left = `${result.x}px`;
  floating.style.top = `${result.y}px`;

  log.textContent = JSON.stringify(
    { x: result.x, y: result.y, placement: result.placement },
    null,
    2,
  );
};

window.addEventListener('resize', update);
window.addEventListener('scroll', update, true);
update();
```

````

```ts
computePosition(reference, floating, {
  placement: 'right-start',
  middleware: [offset(8), flip(), shift()],
}).then(({ x, y }) => {
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
});
```

## Common Pitfalls

- Floating element must use `position: absolute` or `position: fixed`.
- Apply returned `x/y` directly to `left/top`.
- Use `strategy: 'fixed'` for floating elements rendered in `document.body`.
