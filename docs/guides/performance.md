# Performance

Guidelines for stable and efficient floating UI updates.

## 1. Limit update frequency

For animation-heavy UI, use animation frame mode with `maxFps`:

```ts
autoUpdate(reference, update, floating, {
    animationFrame: true,
    maxFps: 30,
});
```

- `30 FPS` is usually enough for floating UI.
- Use `60` only if lower FPS causes visible stepping.

## 2. Minimize layout thrashing

- Keep updates focused on `style.left/top` and arrow styles.
- Avoid mixing many reads and writes in the same frame.
- Avoid heavy work inside every `update` call.

## 3. Always clean up subscriptions

```ts
const cleanup = autoUpdate(reference, update, floating);

// later
cleanup();
```

This prevents listener leaks and redundant re-renders.

## 4. Keep middleware stack simple

Start with:

```ts
[offset(8), flip(), shift()];
```

Add `arrow(...)` only when arrow rendering is needed.

## 5. Pick the right strategy

- `absolute`: default and often cheaper.
- `fixed`: better for body-level portals and complex scroll trees.

## 6. Production checklist

- Every `autoUpdate` has matching cleanup.
- There are no redundant `computePosition` calls outside the event or frame flow.
- Custom DOM measurements are kept small and deliberate.
- `maxFps` is set when `animationFrame` is enabled.
