# Core API

This page is the high-level map of Floater.js APIs.

## Primary APIs

- [computePosition](./compute-position.md)
- [autoUpdate](./auto-update.md)
- [Middleware API](./middleware.md)

## Placement Types

`placementTypes` exports all supported placements:

- `top`, `top-start`, `top-end`
- `right`, `right-start`, `right-end`
- `bottom`, `bottom-start`, `bottom-end`
- `left`, `left-start`, `left-end`

## Visibility Utility

`isVisiblePosition(position, floating, reference, options?)` helps validate whether a calculated position fits the current boundary.

Typical use cases:

- custom fallback placement logic;
- debugging `flip` and `shift` behavior.

## VirtualElement

Use `VirtualElement` for non-DOM anchors (mouse pointer, editor caret, canvas geometry):

```ts
interface VirtualElement {
    offsetTop: number;
    offsetLeft: number;
    getBoundingClientRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
```
