# Troubleshooting

## Floating Element Renders In Wrong Place

Check:

- Floating node uses `position: absolute` or `position: fixed`.
- `options.strategy` matches actual layout behavior.
- Returned `x/y` are applied directly to `left/top`.

## Flip Selects Unexpected Side

Check:

- Middleware order uses `offset` before `flip`.
- `flip({ placements: [...] })` is not overly restrictive.
- There is enough available space in allowed directions.

## Shift Clamps Too Aggressively

Check:

- `parent` boundary is not too small.
- Nested scroll containers are expected.
- Large `offset` is not over-constraining geometry.

## Arrow Looks Misaligned

Check:

- `arrow(arrowElement)` is in middleware chain.
- `middlewareData.arrow.x/y` are applied to arrow styles.
- Arrow dimensions in CSS match expected geometry.

## Position Does Not Update On Scroll/Resize

Check:

- `autoUpdate(...)` is used while floating element is visible.
- `cleanup` is not called too early.
- `animationFrame` mode is enabled for transform-driven motion.

## Middleware Warnings In Console

Floater.js intentionally sanitizes invalid middleware input.

Common causes:

- Custom middleware uses reserved names.
- `offset` value is non-finite.
- `shift.parent` is not an `HTMLElement`.
- `arrow` argument is not an `HTMLElement`.
