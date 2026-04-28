# Troubleshooting

## Floating element is rendered in the wrong place

Check:

- `floating` has the correct CSS `position` (`absolute` or `fixed`).
- `options.strategy` matches actual layout behavior.
- Returned `x/y` values are applied directly to `left/top`.

## `flip()` does not pick the expected side

Check:

- Middleware order uses `offset` before `flip`.
- `flip({ placements: [...] })` is not restricting fallback too much.
- There is enough available space in the allowed directions.

## `shift()` clamps too aggressively

Check:

- `parent` is not too small.
- Nested containers do not create unexpected scroll boundaries.
- A large `offset` is not influencing resulting bounds.

## Arrow is visually misaligned

Check:

- `arrow(arrowElement)` is included in middleware.
- `middlewareData.arrow.x/y` values are applied to the arrow element.
- Arrow CSS size matches expected geometry.

## Position does not update on scroll/resize

Check:

- `autoUpdate(...)` is being used.
- `cleanup` is not called too early.
- `ResizeObserver` exists in the runtime.
- `animationFrame` mode is used for transform-driven motion.

## Console warnings about middleware

Floater.js sanitizes invalid middleware stacks intentionally.

Common causes:

- Custom middleware uses reserved names.
- `offset` value is not finite.
- `shift.parent` is not an `HTMLElement`.
- `arrow` argument is not an `HTMLElement`.
