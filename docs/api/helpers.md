# Helpers API

Floater.js exposes low-level helpers for advanced geometry workflows.

Most applications should use `computePosition` with built-in middleware. Use helpers for custom middleware, diagnostics, or custom geometry pipelines.

## Position Helpers

- `getPosition(...)`
- `getTopPosition(...)`
- `getTopStartPosition(...)`
- `getTopEndPosition(...)`
- `getRightPosition(...)`
- `getRightStartPosition(...)`
- `getRightEndPosition(...)`
- `getBottomPosition(...)`
- `getBottomStartPosition(...)`
- `getBottomEndPosition(...)`
- `getLeftPosition(...)`
- `getLeftStartPosition(...)`
- `getLeftEndPosition(...)`
- `getTopElementPosition(...)`
- `getRightElementPosition(...)`
- `getBottomElementPosition(...)`
- `getLeftElementPosition(...)`

## Offset Helpers

- `getOffsetX(...)`
- `getOffsetY(...)`

For standard spacing behavior, prefer [offset middleware](./middleware/offset.md).

## Arrow Helpers

- `getArrowPosition(...)`
- `getTopArrowPosition(...)`
- `getRightArrowPosition(...)`
- `getBottomArrowPosition(...)`
- `getLeftArrowPosition(...)`
- `getArrowDifferenceWidth(...)`
- `getArrowDifferenceHeight(...)`

## Example

```ts
const base = getPosition(reference, floating, 'bottom-start', {
  strategy: 'fixed',
});

const arrowPosition = getArrowPosition(base.x, base.y, arrowEl, floating, reference, base.placement, {
  strategy: 'fixed',
});
```

## Use Helpers When

- You are writing custom geometry logic.
- You need deep placement diagnostics.
- You are building custom middleware or custom floating behaviors.
