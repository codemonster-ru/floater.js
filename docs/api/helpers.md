# Helpers API

Floater.js exports low-level helpers for advanced positioning and debugging.

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

## Arrow Helpers

- `getArrowPosition(...)`
- `getTopArrowPosition(...)`
- `getRightArrowPosition(...)`
- `getBottomArrowPosition(...)`
- `getLeftArrowPosition(...)`
- `getArrowDifferenceWidth(...)`
- `getArrowDifferenceHeight(...)`

## When To Use

Use these helpers when you need:

- custom geometry logic on top of core API;
- deep debugging for placement differences;
- custom middleware or debug overlays.

For standard UI behavior, prefer `computePosition` + built-in middleware.
