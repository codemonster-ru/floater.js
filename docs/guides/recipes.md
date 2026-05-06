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

```vue
<template>
  <div class="tooltip-demo-root">
    <button
      ref="referenceRef"
      type="button"
      class="tooltip-demo-reference"
      @mouseenter="show"
      @mouseleave="hide"
      @focus="show"
      @blur="hide"
    >
      Hover me
    </button>

    <div ref="floatingRef" role="tooltip" :hidden="!isVisible" class="tooltip-demo-floating">
      Floater.js computes coordinates and keeps this tooltip aligned.
      <div ref="arrowRef" class="tooltip-demo-arrow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { autoUpdate, arrow, computePosition, flip, offset, shift } from '@codemonster-ru/floater.js';

const referenceRef = ref<HTMLElement | null>(null);
const floatingRef = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);

const isVisible = ref(false);
let cleanup: (() => void) | null = null;

const update = async () => {
  const reference = referenceRef.value;
  const floating = floatingRef.value;
  const arrowElement = arrowRef.value;

  if (!reference || !floating || !arrowElement) return;

  const { x, y, middlewareData, placement } = await computePosition(reference, floating, {
    placement: 'top',
    middleware: [offset(10), flip(), shift({ padding: 8 }), arrow(arrowElement)],
  });

  floating.style.left = `${x}px`;
  floating.style.top = `${y}px`;

  const arrowData = middlewareData.arrow;
  const side = placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
  const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side];

  arrowElement.style.left = arrowData?.x != null ? `${arrowData.x}px` : '';
  arrowElement.style.top = arrowData?.y != null ? `${arrowData.y}px` : '';
  arrowElement.style.right = '';
  arrowElement.style.bottom = '';
  (arrowElement.style as CSSStyleDeclaration & Record<string, string>)[staticSide] = '-6px';
};

const show = () => {
  const reference = referenceRef.value;
  const floating = floatingRef.value;

  if (!reference || !floating) return;

  isVisible.value = true;
  void update();

  cleanup?.();
  cleanup = autoUpdate(reference, update, floating);
};

const hide = () => {
  isVisible.value = false;
  cleanup?.();
  cleanup = null;
};

onBeforeUnmount(() => {
  cleanup?.();
  cleanup = null;
});
</script>

<style scoped>
.tooltip-demo-root {
  width: min(680px, 92vw);
  min-height: 320px;
  border: 1px solid #c9ddf3;
  border-radius: 16px;
  background: #fff;
  display: grid;
  place-items: center;
  position: relative;
  box-shadow: 0 8px 30px rgba(53, 106, 157, 0.12);
  margin: 12px 0;
}

.tooltip-demo-reference {
  border: 0;
  background: #1b6ed6;
  color: #fff;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 16px;
  cursor: pointer;
}

.tooltip-demo-floating {
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  background: #163e72;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.3;
  max-width: 220px;
}

.tooltip-demo-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #163e72;
  transform: rotate(45deg);
}
</style>
```

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

```vue
<template>
  <div ref="stageRef" class="menu-demo-stage" @contextmenu="onContextMenu">
    <p class="menu-demo-note">Right click anywhere in this card to open the menu.</p>

    <div ref="menuRef" role="menu" :hidden="!isOpen" class="menu-demo-menu">
      <button type="button" role="menuitem">Open</button>
      <button type="button" role="menuitem">Rename</button>
      <button type="button" role="menuitem">Duplicate</button>
      <button type="button" role="menuitem">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { computePosition, flip, shift, type VirtualElement } from '@codemonster-ru/floater.js';

const stageRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const cursorX = ref(0);
const cursorY = ref(0);

const virtualReference: VirtualElement = {
  offsetTop: 0,
  offsetLeft: 0,
  getBoundingClientRect: () => ({
    x: cursorX.value,
    y: cursorY.value,
    top: cursorY.value,
    left: cursorX.value,
    right: cursorX.value,
    bottom: cursorY.value,
    width: 0,
    height: 0,
  }),
};

const openMenu = async () => {
  const menu = menuRef.value;
  if (!menu) return;

  isOpen.value = true;

  const { x, y } = await computePosition(virtualReference, menu, {
    placement: 'right-start',
    middleware: [flip(), shift({ padding: 10 })],
  });

  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
};

const onContextMenu = async (event: MouseEvent) => {
  event.preventDefault();
  cursorX.value = event.clientX;
  cursorY.value = event.clientY;
  await openMenu();
};

const onGlobalClick = (event: MouseEvent) => {
  const stage = stageRef.value;
  if (!stage) return;

  if (!stage.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

document.addEventListener('click', onGlobalClick);

onBeforeUnmount(() => {
  document.removeEventListener('click', onGlobalClick);
});
</script>

<style scoped>
.menu-demo-stage {
  width: min(740px, 94vw);
  min-height: 360px;
  border: 1px solid #f1d8b6;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 34px rgba(173, 106, 24, 0.16);
  padding: 22px;
  position: relative;
  margin: 12px 0;
}

.menu-demo-note {
  margin: 0;
  color: #7f5a24;
  font-size: 15px;
}

.menu-demo-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 220px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8cfaa;
  box-shadow: 0 12px 30px rgba(165, 101, 22, 0.2);
  padding: 8px;
  display: grid;
  gap: 4px;
}

.menu-demo-menu button {
  border: 0;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #5a3a0f;
}
</style>
```

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
