# Auto Update

`autoUpdate(reference, callback, floatingOrOptions?, options?)` subscribes to layout and viewport changes and calls `callback` when position should be recomputed.

## Signature

The code snippet below illustrates this section.

```ts
autoUpdate(reference, callback, floatingOrOptions?, options?) => () => void
```

## Parameters

The table below summarizes this section.

| Parameter | Type | Description |
| --- | --- | --- |
| `reference` | `HTMLElement \| { getBoundingClientRect(): unknown }` | Reference element or virtual reference. |
| `callback` | `() => void` | Function that recomputes and applies position. |
| `floatingOrOptions` | `HTMLElement \| AutoUpdateOptions` | Floating element or options (when element is omitted). |
| `options` | `AutoUpdateOptions` | Options when `floatingOrOptions` is an element. |

## Return Value

Returns a `cleanup` function. Call it when the floating element is hidden or unmounted.

## Behavior

Choose the update mode based on how dynamic your reference and floating elements are.

### Event Mode (Default)

Subscribes to scroll/resize sources and `ResizeObserver` when available.

### Animation Frame Mode

The code snippet below illustrates this section.

```ts
autoUpdate(reference, update, floating, {
  animationFrame: true,
  maxFps: 30,
});
```

Use for transform-driven or continuously animated reference elements.

## Options

The code snippet below illustrates this section.

```ts
interface AutoUpdateOptions {
  animationFrame?: boolean;
  maxFps?: number;
}
```

## Example

The code snippet below illustrates this section.

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

The following items are listed in this section:

- Forgetting to call `cleanup` on hide/unmount.
- Treating `autoUpdate(...)` as the initial positioning call. Run `update()` once before subscribing.
- Using animation-frame mode when event mode is already sufficient.
- Running heavy non-positioning logic inside `callback`.
