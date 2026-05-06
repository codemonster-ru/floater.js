# Middleware API

Middleware is executed inside `computePosition(..., { middleware })` from left to right.

## Built-In Middleware

- [Offset](./middleware/offset.md)
- [Flip](./middleware/flip.md)
- [Shift](./middleware/shift.md)
- [Arrow](./middleware/arrow.md)

## Recommended Order

```ts
[offset(8), flip(), shift(), arrow(arrowEl)];
```

This order preserves expected geometry: distance, fallback side, boundary clamping, then arrow alignment.

## Custom Middleware

```ts
const customMiddleware = {
  name: 'snapToPixel',
  fn: ({ x, y, placement }) => ({
    x: Math.round(x),
    y: Math.round(y),
    placement,
  }),
};
```

Custom middleware names must not conflict with reserved built-in names.

## Validation Rules

Floater.js sanitizes invalid middleware input:

- Reserved names (`flip`, `offset`, `shift`, `arrow`) are blocked for custom middleware.
- Invalid built-in parameters are ignored.
- Warnings are emitted through `console.warn`.

## Low-Level Utility

`flipPosition(...)` is exposed for advanced placement flows, but in most cases `flip(...)` is preferred.
