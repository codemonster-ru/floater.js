# arrow

`arrow(arrowElement)` computes arrow coordinates and stores them in `middlewareData.arrow`.

## Signature

```ts
arrow(arrowElement: HTMLElement)
```

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

## Output Fields

- `middlewareData.arrow.x`
- `middlewareData.arrow.y`
- `middlewareData.arrow.baseX`
- `middlewareData.arrow.baseY`
