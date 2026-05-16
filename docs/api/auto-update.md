# Auto Update

`autoUpdate(reference, callback, floatingOrOptions?, options?)` subscribes to layout and viewport changes and calls `callback` when position should be recomputed.

## Signature

```ts
autoUpdate(reference, callback, floatingOrOptions?, options?) => () => void
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `reference` | `HTMLElement \| { getBoundingClientRect(): unknown }` | Reference element or virtual reference. |
| `callback` | `() => void` | Function that recomputes and applies position. |
| `floatingOrOptions` | `HTMLElement \| AutoUpdateOptions` | Floating element or options (when element is omitted). |
| `options` | `AutoUpdateOptions` | Options when `floatingOrOptions` is an element. |

## Return Value

Returns a `cleanup` function. Call it when the floating element is hidden or unmounted.

## Behavior

### Event Mode (Default)

Subscribes to scroll/resize sources and `ResizeObserver` when available.

### Animation Frame Mode

```ts
autoUpdate(reference, update, floating, {
  animationFrame: true,
  maxFps: 30,
});
```

Use for transform-driven or continuously animated reference elements.

## Options

```ts
interface AutoUpdateOptions {
  animationFrame?: boolean;
  maxFps?: number;
}
```

## Example

```ts
const update = async () => {
  const { x, y } = await computePosition(reference, floating, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
};

await update();
const cleanup = autoUpdate(reference, update, floating);
```

## Common Pitfalls

- Forgetting to call `cleanup` on hide/unmount.
- Treating `autoUpdate(...)` as the initial positioning call. Run `update()` once before subscribing.
- Using animation-frame mode when event mode is already sufficient.
- Running heavy non-positioning logic inside `callback`.
