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

```ts
computePosition(reference, floating, {
  placement: 'bottom',
  middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
});
```

## Common Pitfalls

- Overly restrictive `placements` arrays that remove valid fallbacks.
- Running `flip` before `offset` when offset must be part of fit checks.
