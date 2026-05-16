# Getting Started

Floater.js computes robust coordinates for floating elements relative to reference elements.

## Installation

```bash
npm i @codemonster-ru/floater.js
```

## Quick Start

Start with real DOM elements: compute coordinates, then apply them to your floating element.

```ts
import { computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const reference = document.querySelector<HTMLElement>('#reference');
const floating = document.querySelector<HTMLElement>('#floating');

if (reference && floating) {
  const { x, y } = await computePosition(reference, floating, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift()],
  });

  Object.assign(floating.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
  });
}
```

## Interactive Vue Example

The playground below uses Vue and VueForge components for the docs demo, while the positioning logic still comes from Floater.js.

````playground-src
mode: component
framework: vue
height: 360
entry: /App.vue

```vue file=/App.vue
<template>
  <section :style="stageStyle">
    <VfButton ref="reference" type="button">
      Reference
    </VfButton>

    <VfCard ref="floating" compact :style="floatingStyle">
      Positioned by Floater.js
    </VfCard>

    <span ref="arrowEl" :style="arrowStyle">
      <span ref="arrowShape" :style="arrowShapeStyle" />
    </span>
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';
import { VfButton, VfCard } from '@codemonster-ru/vueforge-core';

const reference = ref(null);
const floating = ref(null);
const arrowEl = ref(null);
const arrowShape = ref(null);
let cleanup = null;

const getEl = (value) => value?.$el ?? value;
const stageStyle = {
  height: '100%',
  minHeight: '300px',
  display: 'grid',
  placeItems: 'center',
  position: 'relative',
};
const floatingStyle = {
  position: 'absolute',
  left: '0',
  top: '0',
  background: 'var(--vf-color-surface-muted)',
  zIndex: '1',
};
const arrowStyle = {
  position: 'absolute',
  left: '0',
  top: '0',
  width: '14px',
  height: '14px',
  zIndex: '2',
};
const arrowShapeStyle = {
  position: 'absolute',
  inset: '2px',
  background: 'var(--vf-color-surface-muted)',
  transform: 'rotate(45deg)',
};

const update = async () => {
  const referenceEl = getEl(reference.value);
  const floatingEl = getEl(floating.value);
  if (!referenceEl || !floatingEl || !arrowEl.value || !arrowShape.value) {
    return;
  }

  const { x, y, placement, middlewareData } = await computePosition(referenceEl, floatingEl, {
    placement: 'bottom-start',
    middleware: [offset(10), flip(), shift(), arrow(arrowEl.value)],
  });

  floatingEl.style.left = `${x}px`;
  floatingEl.style.top = `${y}px`;

  const arrowData = middlewareData.arrow;
  if (arrowData) {
    const side = placement.split('-')[0];
    const visibleBorders = {
      top: ['borderRight', 'borderBottom'],
      right: ['borderBottom', 'borderLeft'],
      bottom: ['borderLeft', 'borderTop'],
      left: ['borderTop', 'borderRight'],
    };

    arrowEl.value.style.left = `${arrowData.x}px`;
    arrowEl.value.style.top = `${arrowData.y}px`;

    arrowShape.value.style.border = '0';
    visibleBorders[side].forEach((borderSide) => {
      arrowShape.value.style[borderSide] = '1px solid var(--vf-color-border)';
    });
  }
};

onMounted(async () => {
  await nextTick();
  await update();

  const referenceEl = getEl(reference.value);
  const floatingEl = getEl(floating.value);
  cleanup = referenceEl && floatingEl ? autoUpdate(referenceEl, update, floatingEl) : null;
});

onBeforeUnmount(() => {
  cleanup?.();
});
</script>
```

````

## Positioning Lifecycle

1. Call `computePosition(reference, floating, options)`.
2. Apply the returned coordinates (`x`, `y`) to your floating element.
3. Keep coordinates fresh with `autoUpdate(...)` while the floating element is visible.
4. Always dispose with the `cleanup` callback.

## Strategy: Absolute vs Fixed

- `absolute` (default): best for floating elements within positioned layout containers.
- `fixed`: best for floating elements rendered in `document.body` or other viewport-level layers.

```ts
floating.style.position = 'fixed';
document.body.appendChild(floating);

await computePosition(reference, floating, {
  strategy: 'fixed',
  placement: 'bottom',
  middleware: [offset(8), flip(), shift()],
});
```

## SSR Boundary

- Safe on server: importing the package.
- Browser-only: DOM-dependent calls such as `computePosition(...)` and `autoUpdate(...)`.

Run DOM logic only after mount (or inside client-only branches).

## Where To Next

- [Core API](./api/core.md)
- [Compute Position](./api/compute-position.md)
- [Middleware API](./api/middleware.md)
- [Recipes](./guides/recipes.md)
- [Performance Guide](./guides/performance.md)
