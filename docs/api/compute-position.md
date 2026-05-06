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
| `strategy` | `'absolute' \| 'fixed'` | `'absolute'` | Coordinate system for returned `x` and `y`. |

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
