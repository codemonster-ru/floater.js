# Troubleshooting

## Floating element is rendered in the wrong place

Check:

- `floating` has the correct CSS `position` (`absolute` or `fixed`);
- `options.strategy` matches actual layout behavior;
- returned `x/y` are applied directly to `left/top`.

## `flip()` does not pick the expected side

Check:

- middleware order (`offset` before `flip`);
- `flip({ placements: [...] })` restrictions;
- available space in allowed directions.

## `shift()` clamps too aggressively

Check:

- whether `parent` is too small;
- whether nested containers create unexpected scroll boundaries;
- whether a large `offset` influences resulting bounds.

## Arrow is visually misaligned

Check:

- `arrow(arrowElement)` is included in middleware;
- `middlewareData.arrow.x/y` are applied to the arrow element;
- arrow CSS size matches expected geometry.

## Position does not update on scroll/resize

Check:

- `autoUpdate(...)` is being used;
- `cleanup` is not called too early;
- `ResizeObserver` exists in the runtime;
- `animationFrame` mode is used for transform-driven motion.

## Console warnings about middleware

Floater.js sanitizes invalid middleware stacks intentionally.

Common causes:

- custom middleware uses reserved names;
- `offset` value is not finite;
- `shift.parent` is not an `HTMLElement`;
- `arrow` argument is not an `HTMLElement`.
