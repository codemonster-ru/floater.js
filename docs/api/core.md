# Core API

This page is a high-level map of the public Floater.js API.

## Primary APIs

- [Compute Position](./compute-position.md)
- [Auto Update](./auto-update.md)
- [Middleware API](./middleware.md)
- [TypeScript API](./typescript.md)
- [Helpers API](./helpers.md)

## Placement types

`placementTypes` exports all supported placements:

- `top`, `top-start`, `top-end`
- `right`, `right-start`, `right-end`
- `bottom`, `bottom-start`, `bottom-end`
- `left`, `left-start`, `left-end`

## Visibility utility

`isVisiblePosition(position, floating, reference, options?)` helps validate whether a calculated position fits the current boundary.

Typical use cases:

- custom fallback placement logic
- debugging `flip` and `shift` behavior

```ts
const visible = isVisiblePosition(position, floating, reference, {
    strategy: 'fixed',
});
```

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
