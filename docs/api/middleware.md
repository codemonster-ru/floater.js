# Middleware API

Middleware is applied inside `computePosition(..., { middleware })` from left to right.

## Built-in Middleware

- [offset](./middleware/offset.md)
- [flip](./middleware/flip.md)
- [shift](./middleware/shift.md)
- [arrow](./middleware/arrow.md)

## Recommended Base Order

```ts
[offset(8), flip(), shift(), arrow(arrowEl)]
```

## Why Order Matters

- `offset` changes base distance;
- `flip` chooses the most suitable side;
- `shift` clamps to boundaries;
- `arrow` resolves arrow coordinates from final geometry.

## Validation Rules

Floater.js sanitizes invalid middleware input:

- reserved names (`flip`, `offset`, `shift`, `arrow`) are blocked for custom middleware;
- invalid params for built-ins are ignored;
- warnings are emitted through `console.warn`.

## Low-level Utility

`flipPosition(...)` is exposed for advanced custom placement flows, but most applications should use `flip(...)`.
