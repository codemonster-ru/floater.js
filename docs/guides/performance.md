# Performance

Guidelines for stable and efficient floating-element updates.

## 1. Limit Update Frequency

For animation-heavy interfaces, use animation frame mode with `maxFps`:

```ts
autoUpdate(reference, update, floating, {
  animationFrame: true,
  maxFps: 30,
});
```

- `30 FPS` is usually enough.
- Use `60` only when lower FPS causes visible stepping.

## 2. Minimize Layout Thrashing

- Keep updates focused on `style.left/top` and arrow positioning.
- Avoid heavy read/write mixing in a single frame.
- Keep non-positioning work outside `update`.

## 3. Always Cleanup

```ts
const cleanup = autoUpdate(reference, update, floating);

// later
cleanup();
```

## 4. Keep Middleware Simple

Start with:

```ts
[offset(8), flip(), shift()];
```

Add `arrow(...)` only when needed.

## 5. Choose Correct Strategy

- `absolute`: usually cheaper for positioned layout containers.
- `fixed`: best for `document.body` portals and complex scroll trees.
- Default is auto-detected from the floating element CSS position.

## 6. Production Checklist

- Every `autoUpdate` has matching cleanup function calls.
- No redundant `computePosition` loops outside intended flow.
- Custom DOM measurement logic remains minimal.
- `maxFps` is set when `animationFrame` is enabled.
