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
