# computePosition

`computePosition(reference, floating, options?)` calculates floating coordinates and resolves middleware output.

## Signature

```ts
computePosition(
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options?: OptionType,
): Promise<ParamsType>
```

## Options

- `placement?: PlacementType` (default: `bottom`)
- `middleware?: MiddlewareType[]`
- `strategy?: 'absolute' | 'fixed'`

## Return Value

```ts
{
    x: number;
    y: number;
    placement: PlacementType;
    middlewareData: Record<string, MiddlewareOutType>;
}
```

## Behavior Contract

- middleware runs left-to-right in the provided order;
- each middleware can update `x`, `y`, and `placement`;
- each middleware result is available as `middlewareData[name]`;
- invalid built-in middleware params are sanitized internally.

## Example

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

- `floating` must have a valid CSS positioning context (`absolute` or `fixed`).
- Apply returned `x/y` directly to `left/top`.
- For teleported overlays in `body`, use `strategy: 'fixed'`.
