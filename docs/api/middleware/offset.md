# Offset Middleware

`offset(value)` shifts floating coordinates away from the reference.

## Signature

```ts
offset(value: number)
```

## Parameters

| Parameter | Type     | Description                                                                                 |
| --------- | -------- | ------------------------------------------------------------------------------------------- |
| `value`   | `number` | Distance in pixels. Positive values move the floating element away from the reference side. |

## Usage

```ts
computePosition(reference, floating, {
    middleware: [offset(8), flip(), shift()],
});
```

## Notes

- Place `offset` before `flip` and `shift` so fallback checks and boundary clamping include the offset.
- Invalid values such as `NaN` or `Infinity` are ignored by middleware sanitization.
