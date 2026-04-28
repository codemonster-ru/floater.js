# Auto Update

`autoUpdate` keeps floating coordinates in sync with layout changes.

## Signature

```ts
autoUpdate(reference, callback, floatingOrOptions?, options?) => () => void
```

Returns a `cleanup` function that must be called when UI is hidden or unmounted.

## Parameters

| Parameter           | Type                                                  | Description                                                               |
| ------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `reference`         | `HTMLElement \| { getBoundingClientRect(): unknown }` | Anchor element or virtual reference.                                      |
| `callback`          | `() => void`                                          | Function called when the position should be recomputed.                   |
| `floatingOrOptions` | `HTMLElement \| AutoUpdateOptions`                    | Optional floating element, or options when no floating element is needed. |
| `options`           | `AutoUpdateOptions`                                   | Options used when `floatingOrOptions` is a floating element.              |

## Modes

### Event mode (default)

Subscribes to:

- scroll events of reference and floating scroll parents
- `window` scroll and resize
- `window.visualViewport` resize and scroll when available
- `ResizeObserver` for reference and floating elements when available

### Animation frame mode

```ts
autoUpdate(reference, update, floating, {
    animationFrame: true,
    maxFps: 30,
});
```

Use animation frame mode for transform-driven movement or heavily animated anchors. In this mode, event and observer subscriptions are not used.

When `maxFps` is omitted, animation frame mode defaults to `30`.

## Options

```ts
interface AutoUpdateOptions {
    animationFrame?: boolean;
    maxFps?: number;
}
```

## Best practices

- Use default mode for most tooltips and dropdowns.
- Use `animationFrame` only when event mode is not enough.
- Keep `maxFps` conservative (`30` is often enough).
- Always call `cleanup`.
