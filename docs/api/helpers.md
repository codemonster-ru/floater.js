# Helpers API

Floater.js exports low-level helpers for advanced positioning and debugging.

Most applications should use `computePosition` and built-in middleware. Use helpers when you are building custom middleware, debug tooling, or behavior that needs direct geometry access.

## Position helpers

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

These helpers return a `PositionType` or a numeric edge coordinate based on the reference, floating element, placement, and strategy options.

## Offset helpers

- `getOffsetX(...)`
- `getOffsetY(...)`

Use these helpers only when implementing offset-aware custom positioning. Standard spacing should use the [offset middleware](./middleware/offset.md).

## Arrow helpers

- `getArrowPosition(...)`
- `getTopArrowPosition(...)`
- `getRightArrowPosition(...)`
- `getBottomArrowPosition(...)`
- `getLeftArrowPosition(...)`
- `getArrowDifferenceWidth(...)`
- `getArrowDifferenceHeight(...)`

Arrow helpers return `ArrowPositionType` values or measurement differences used to compensate for transformed arrow geometry.

## Example

```ts
const base = getPosition(reference, floating, 'bottom-start', {
    strategy: 'fixed',
});

const arrowPosition = getArrowPosition(base.x, base.y, arrowEl, floating, reference, base.placement, {
    strategy: 'fixed',
});
```

## When to use

Use these helpers when you need:

- custom geometry logic on top of core API
- deep debugging for placement differences
- custom middleware or debug overlays

For standard UI behavior, prefer `computePosition` + built-in middleware.
