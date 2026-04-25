# autoUpdate

`autoUpdate` keeps floating coordinates in sync with layout changes.

## Signature

```ts
autoUpdate(reference, callback, floatingOrOptions?, options?) => () => void
```

Returns a `cleanup` function that must be called when UI is hidden or unmounted.

## Modes

### Event Mode (default)

Subscribes to:

- scroll events of reference/floating scroll parents;
- `window` scroll and resize;
- `window.visualViewport` resize and scroll (when available);
- `ResizeObserver` for reference/floating (when available).

### Animation Frame Mode

```ts
autoUpdate(reference, update, floating, {
    animationFrame: true,
    maxFps: 30,
});
```

Use for transform-driven movement or heavily animated anchors.

## Best Practices

- Use default mode for most tooltips and dropdowns.
- Use `animationFrame` only when event mode is not enough.
- Keep `maxFps` conservative (`30` is often enough).
- Always call `cleanup`.
