# Flip Middleware

`flip(params?)` tries alternative placements when the current one does not fit.

## Signature

```ts
flip(params?: { placements?: PlacementType[] })
```

## Parameters

| Parameter    | Type              | Description                                 |
| ------------ | ----------------- | ------------------------------------------- |
| `placements` | `PlacementType[]` | Optional ordered list of placements to try. |

## Usage

```ts
flip({ placements: ['bottom', 'top'] });
```

## Notes

- Without `placements`, the full internal placement order is used.
- With `placements`, fallback is limited to that set.
- When `shift()` is also present, `flip()` checks placement fit without `shift()` so it does not pick a placement that only fits after clamping.
- Put `offset()` before `flip()` when the offset should be part of the fit check.
