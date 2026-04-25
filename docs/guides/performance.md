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

- keep updates focused on `style.left/top` and arrow styles;
- avoid mixing many reads/writes in the same frame;
- avoid heavy work inside every `update` call.

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
[offset(8), flip(), shift()]
```

Add `arrow(...)` only when arrow rendering is needed.

## 5. Pick the right strategy

- `absolute`: default and often cheaper.
- `fixed`: better for body-level portals and complex scroll trees.

## 6. Production checklist

- every `autoUpdate` has matching cleanup;
- no redundant `computePosition` calls outside event/frame flow;
- no excessive custom DOM measurements;
- `maxFps` is set when `animationFrame` is enabled.
