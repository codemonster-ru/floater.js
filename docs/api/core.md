# Core API

The Floater.js public API is intentionally small and composable.

## Entry Points

- [Compute Position](./compute-position.md)
- [Auto Update](./auto-update.md)
- [Middleware API](./middleware.md)
- [TypeScript API](./typescript.md)
- [Helpers API](./helpers.md)

## Placement Types

`placementTypes` exports all supported placements:

- `top`, `top-start`, `top-end`
- `right`, `right-start`, `right-end`
- `bottom`, `bottom-start`, `bottom-end`
- `left`, `left-start`, `left-end`

## Virtual Reference

Use `VirtualElement` for non-DOM reference points such as cursor points, editor carets, or canvas coordinates.

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

## Visibility Check

`isVisiblePosition(position, floating, reference, options?)` validates whether a candidate position fits current bounds.

```ts
const visible = isVisiblePosition(position, floating, reference, {
  strategy: 'fixed',
});
```
