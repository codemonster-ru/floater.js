# Recipes

Production-ready patterns for common floating-element scenarios.

All snippets assume `position: absolute` unless stated otherwise.

## Tooltip

```ts
computePosition(reference, floating, {
  placement: 'top',
  middleware: [offset(8), flip(), shift(), arrow(arrowEl)],
}).then(({ x, y, middlewareData }) => {
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;

  if (middlewareData.arrow) {
    arrowEl.style.left = `${middlewareData.arrow.x}px`;
    arrowEl.style.top = `${middlewareData.arrow.y}px`;
  }
});
```

### Tooltip Playground

````playground-src
mode: component
framework: vue
height: 380
entry: /App.vue

```vue file=/App.vue
<template>
  <section :style="tooltipStageStyle">
    <div ref="reference">
      <VfButton
        type="button"
        :style="referenceStyle"
        @mouseenter="show"
        @focus="show"
        @mouseleave="hide"
        @blur="hide"
      >
        Hover me
      </VfButton>
    </div>

    <VfCard
      v-show="visible"
      ref="floating"
      compact
      role="tooltip"
      :style="floatingStyle"
    >
      Floater.js computes coordinates and keeps this tooltip aligned.
    </VfCard>

    <span v-show="visible" ref="arrowEl" :style="arrowStyle">
      <span ref="arrowShape" :style="arrowShapeStyle" />
    </span>
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { autoUpdate, arrow, computePosition, flip, offset, shift } from '@codemonster-ru/floater.js'
import { VfButton, VfCard } from '@codemonster-ru/vueforge-core'

const getEl = (value) => value?.$el ?? value
const reference = ref(null)
const floating = ref(null)
const arrowEl = ref(null)
const arrowShape = ref(null)
const visible = ref(false)
let cleanup = null

const tooltipStageStyle = {
  width: '100%',
  height: '100%',
  minHeight: '320px',
  display: 'grid',
  placeItems: 'center',
  position: 'relative'
}
const referenceStyle = {
  minWidth: '140px'
}
const floatingStyle = {
  position: 'absolute',
  top: '0',
  left: '0',
  maxWidth: '220px',
  background: 'var(--vf-color-surface-muted)',
  zIndex: '1'
}
const arrowStyle = {
  position: 'absolute',
  left: '0',
  top: '0',
  width: '14px',
  height: '14px',
  zIndex: '2'
}
const arrowShapeStyle = {
  position: 'absolute',
  inset: '2px',
  background: 'var(--vf-color-surface-muted)',
  transform: 'rotate(45deg)'
}

const update = async () => {
  const referenceEl = getEl(reference.value)
  const floatingEl = getEl(floating.value)
  if (!referenceEl || !floatingEl || !arrowEl.value || !arrowShape.value) {
    return
  }

  const { x, y, middlewareData, placement } = await computePosition(referenceEl, floatingEl, {
    placement: 'top',
    middleware: [offset(10), flip(), shift({ padding: 8 }), arrow(arrowEl.value)]
  })

  floatingEl.style.left = `${x}px`
  floatingEl.style.top = `${y}px`

  const arrowData = middlewareData.arrow
  if (arrowData) {
    const side = placement.split('-')[0]
    const visibleBorders = {
      top: ['borderRight', 'borderBottom'],
      right: ['borderBottom', 'borderLeft'],
      bottom: ['borderLeft', 'borderTop'],
      left: ['borderTop', 'borderRight']
    }

    arrowEl.value.style.left = `${arrowData.x}px`
    arrowEl.value.style.top = `${arrowData.y}px`

    arrowShape.value.style.border = '0'
    visibleBorders[side].forEach((borderSide) => {
      arrowShape.value.style[borderSide] = '1px solid var(--vf-color-border)'
    })
  }
}

const show = async () => {
  visible.value = true
  await nextTick()
  await update()
  cleanup?.()

  const referenceEl = getEl(reference.value)
  const floatingEl = getEl(floating.value)
  cleanup = referenceEl && floatingEl ? autoUpdate(referenceEl, update, floatingEl) : null
}

const hide = () => {
  visible.value = false
  cleanup?.()
  cleanup = null
}

onBeforeUnmount(() => {
  cleanup?.()
  cleanup = null
})
</script>
```

````

## Dropdown

```ts
computePosition(button, menu, {
  placement: 'bottom-start',
  middleware: [offset(6), flip({ placements: ['bottom-start', 'top-start'] }), shift()],
}).then(({ x, y }) => {
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
});
```

## Context Menu (VirtualElement)

```ts
const pointRef = {
  offsetTop: event.clientY,
  offsetLeft: event.clientX,
  getBoundingClientRect() {
    return {
      x: event.clientX,
      y: event.clientY,
      width: 0,
      height: 0,
      top: event.clientY,
      right: event.clientX,
      bottom: event.clientY,
      left: event.clientX,
    };
  },
};

computePosition(pointRef, menu, {
  placement: 'right-start',
  middleware: [offset(4), flip(), shift()],
}).then(({ x, y }) => {
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
});
```

### Context Menu Playground

````playground-src
mode: component
framework: vue
height: 420
entry: /App.vue

```vue file=/App.vue
<template>
  <section ref="stage" :style="stageStyle" @click="onStageClick" @contextmenu="onContext">
    <p :style="noteStyle">Right click anywhere in this area to open the menu.</p>

    <div
      v-show="visible"
      ref="menu"
      role="menu"
      :style="menuStyle"
      @click.stop
    >
      <button
        v-for="label in labels"
        :key="label"
        class="context-menu__item"
        type="button"
        role="menuitem"
      >
        {{ label }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { computePosition, flip, offset, shift } from '@codemonster-ru/floater.js'

const getEl = (value) => value?.$el ?? value
const stage = ref(null)
const menu = ref(null)
const visible = ref(false)
const cursor = ref({ x: 0, y: 0 })
const labels = ['Open', 'Rename', 'Duplicate', 'Delete']
const stageStyle = {
  width: '100%',
  height: '100%',
  minHeight: '360px',
  padding: '22px',
  boxSizing: 'border-box',
  position: 'relative'
}
const noteStyle = {
  margin: '0',
  color: 'var(--vf-color-muted)'
}
const menuStyle = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '210px',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '2px',
  padding: '6px',
  border: '1px solid var(--vf-color-border)',
  borderRadius: '8px',
  background: 'var(--vf-color-surface-muted)',
  zIndex: '1'
}

const virtualReference = {
  offsetTop: 0,
  offsetLeft: 0,
  getBoundingClientRect: () => ({
    x: cursor.value.x,
    y: cursor.value.y,
    top: cursor.value.y,
    left: cursor.value.x,
    right: cursor.value.x,
    bottom: cursor.value.y,
    width: 0,
    height: 0
  })
}

const openMenu = async () => {
  const menuEl = getEl(menu.value)
  if (!menuEl) {
    return
  }

  visible.value = true
  await nextTick()

  const { x, y } = await computePosition(virtualReference, menuEl, {
    placement: 'right-start',
    middleware: [offset(4), flip(), shift({ padding: 10 })]
  })

  menuEl.style.left = `${x}px`
  menuEl.style.top = `${y}px`
}

const onContext = async (event) => {
  event.preventDefault()
  cursor.value = { x: event.clientX, y: event.clientY }
  await openMenu()
}

const onStageClick = (event) => {
  const menuEl = getEl(menu.value)
  if (menuEl?.contains(event.target)) {
    return
  }

  visible.value = false
}

const onDocClick = (event) => {
  if (!getEl(stage.value)?.contains(event.target)) {
    visible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.context-menu__item {
  border: 0;
  border-radius: 6px;
  color: var(--vf-color-text);
  cursor: pointer;
  font: inherit;
}

.context-menu__item {
  background: transparent;
  padding: 8px 10px;
  text-align: left;
}

.context-menu__item:hover,
.context-menu__item:focus-visible {
  background: var(--vf-color-surface);
  outline: none;
}
</style>
```

````

## Fixed Portal Popover

```ts
floating.style.position = 'fixed';
document.body.appendChild(floating);

computePosition(reference, floating, {
  strategy: 'fixed',
  placement: 'bottom',
  middleware: [offset(8), flip(), shift()],
}).then(({ x, y }) => {
  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;
});
```

## Reactive Updates

```ts
const update = () => {
  computePosition(reference, floating, {
    placement: 'bottom',
    middleware: [offset(8), flip(), shift()],
  }).then(({ x, y }) => {
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
  });
};

const cleanup = autoUpdate(reference, update, floating);
update();

// ...
cleanup();
```
