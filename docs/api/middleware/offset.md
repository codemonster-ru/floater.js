# Offset

`offset(value)` shifts floating coordinates away from the reference.

## Signature

```ts
offset(value: number)
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `number` | Distance in pixels. Positive values move the floating element away from the reference side. |

## Return Value

Returns an offset middleware object for `computePosition(..., { middleware })`.

## Behavior

- Applies distance before fallback and boundary checks.
- Should run before `flip` and `shift` in most stacks.

## Example

```ts
computePosition(reference, floating, {
  middleware: [offset(8), flip(), shift()],
});
```

## Common Pitfalls

- Passing non-finite values (`NaN`, `Infinity`).
- Placing `offset` after `flip` when offset should be included in fit checks.
