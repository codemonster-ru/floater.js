# Compute Position

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

| Option       | Type                    | Default      | Description                                       |
| ------------ | ----------------------- | ------------ | ------------------------------------------------- |
| `placement`  | `PlacementType`         | `'bottom'`   | Preferred placement before middleware runs.       |
| `middleware` | `MiddlewareType[]`      | `[]`         | Middleware stack executed from left to right.     |
| `strategy`   | `'absolute' \| 'fixed'` | `'absolute'` | Coordinate strategy for the returned `x` and `y`. |

## Return value

```ts
{
    x: number;
    y: number;
    placement: PlacementType;
    middlewareData: Record<string, MiddlewareOutType>;
}
```

## Behavior contract

- Middleware runs left to right in the provided order.
- Each middleware can update `x`, `y`, and `placement`.
- Each middleware result is available as `middlewareData[name]`.
- Invalid built-in middleware params are sanitized internally and ignored.
- With `strategy: 'absolute'`, `x` and `y` are resolved in the floating element's offset-parent coordinate space.
- With `strategy: 'fixed'`, `x` and `y` are resolved in viewport coordinates.

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

## Common pitfalls

- `floating` must have a valid CSS positioning context (`absolute` or `fixed`).
- Apply returned `x/y` directly to `left/top`.
- For teleported overlays in `body`, use `strategy: 'fixed'`.
