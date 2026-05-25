# Performance

Guidelines for stable and efficient floating-element updates.

## Limit Update Frequency

For animation-heavy interfaces, use animation frame mode with `maxFps`:

- `30 FPS` is usually enough.
- Use `60` only when lower FPS causes visible stepping.

```ts
autoUpdate(reference, update, floating, {
  animationFrame: true,
  maxFps: 30,
});
```

## Minimize Layout Thrashing

Keep each update pass predictable and focused on positioning work.
Use the checklist below to reduce unnecessary layout recalculations:

- Keep updates focused on `style.left/top` and arrow positioning.
- Avoid heavy read/write mixing in a single frame.
- Keep non-positioning work outside `update`.

## Always Cleanup

The code snippet below illustrates this section.

```ts
const cleanup = autoUpdate(reference, update, floating);

// later
cleanup();
```

## Keep Middleware Simple

Start with.

```ts
[offset(8), flip(), shift()];
```

Add `arrow(...)` only when needed.

## Choose Correct Strategy

The following items are listed in this section:

- `absolute`: default and usually cheaper.
- `fixed`: best for `document.body` portals and complex scroll trees.

## Production Checklist

The following items are listed in this section:

- Every `autoUpdate` has matching cleanup function calls.
- No redundant `computePosition` loops outside intended flow.
- Custom DOM measurement logic remains minimal.
- `maxFps` is set when `animationFrame` is enabled.
