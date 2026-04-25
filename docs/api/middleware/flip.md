# flip

`flip(params?)` tries alternative placements when the current one does not fit.

## Signature

```ts
flip(params?: { placements?: PlacementType[] })
```

## Usage

```ts
flip({ placements: ['bottom', 'top'] })
```

## Notes

- without `placements`, the full internal placement order is used;
- with `placements`, fallback is limited to that set.
