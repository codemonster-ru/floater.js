# Arrow Middleware

`arrow(arrowElement)` computes arrow coordinates and stores them in `middlewareData.arrow`.

## Signature

```ts
arrow(arrowElement: HTMLElement)
```

## Parameters

| Parameter      | Type          | Description                                         |
| -------------- | ------------- | --------------------------------------------------- |
| `arrowElement` | `HTMLElement` | Arrow element rendered inside the floating element. |

## Usage

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

## Output fields

| Field                        | Description                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| `middlewareData.arrow.x`     | Arrow `left` coordinate.                                       |
| `middlewareData.arrow.y`     | Arrow `top` coordinate.                                        |
| `middlewareData.arrow.baseX` | Floating element `x` coordinate used during arrow calculation. |
| `middlewareData.arrow.baseY` | Floating element `y` coordinate used during arrow calculation. |

## Notes

- Place `arrow(...)` after `offset`, `flip`, and `shift` so it uses the final floating geometry.
- Guard `middlewareData.arrow` before reading it, especially when middleware stacks are dynamic.
