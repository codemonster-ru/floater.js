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
| `padding` | `number` | Optional viewport/boundary padding in pixels. |

## Return Value

Returns a shift middleware object for `computePosition(..., { middleware })`.

## Behavior

- Without `parent`, bounds come from viewport and scroll containers.
- Clamps coordinates to keep the floating element visible.
- Works best after `offset` and `flip`.

## Example

```ts
computePosition(reference, floating, {
  middleware: [offset(8), flip(), shift({ padding: 8 })],
});
```

## Common Pitfalls

- Using a `parent` boundary that is too small for expected placements.
- Large offsets that force frequent clamping.
