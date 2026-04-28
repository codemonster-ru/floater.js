# Middleware API

Middleware is applied inside `computePosition(..., { middleware })` from left to right.

## Built-in middleware

- [Offset Middleware](./middleware/offset.md)
- [Flip Middleware](./middleware/flip.md)
- [Shift Middleware](./middleware/shift.md)
- [Arrow Middleware](./middleware/arrow.md)

## Recommended order

```ts
[offset(8), flip(), shift(), arrow(arrowEl)];
```

Start with `offset`, then run fallback placement with `flip`, clamp the result with `shift`, and calculate arrow coordinates last.

## Why order matters

- `offset` changes the base distance from the reference.
- `flip` chooses the most suitable side.
- `shift` clamps the result to visible bounds.
- `arrow` resolves arrow coordinates from the final geometry.

## Custom middleware

Custom middleware receives the current positioning state and returns a new state:

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

Custom middleware names must not use reserved built-in names.

## Validation rules

Floater.js sanitizes invalid middleware input:

- reserved names (`flip`, `offset`, `shift`, `arrow`) are blocked for custom middleware
- invalid params for built-ins are ignored
- warnings are emitted through `console.warn`

## Low-level utility

`flipPosition(...)` is exposed for advanced custom placement flows, but most applications should use `flip(...)`.
