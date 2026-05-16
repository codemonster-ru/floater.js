# Arrow

`arrow(arrowElement)` computes arrow coordinates and writes them to `middlewareData.arrow`.

## Signature

```ts
arrow(arrowElement: HTMLElement)
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `arrowElement` | `HTMLElement` | Arrow node positioned in the same coordinate context as the floating element. |

## Return Value

Returns an arrow middleware object for `computePosition(..., { middleware })`.

## Behavior

- Computes arrow coordinates from the final floating geometry.
- Exposes coordinates as `middlewareData.arrow`.
- Should run after `offset`, `flip`, and `shift`.

## Output

- `middlewareData.arrow.x`: Arrow `left` coordinate, not the floating element `x`.
- `middlewareData.arrow.y`: Arrow `top` coordinate, not the floating element `y`.
- `middlewareData.arrow.baseX`: Base floating `x` used for arrow calculation.
- `middlewareData.arrow.baseY`: Base floating `y` used for arrow calculation.

## Example

Interactive demo:

````playground-src
mode: component
framework: vue
height: 360
entry: /App.vue

```vue file=/App.vue
<template>
  <section
    class="stage"
    :style="{
      height: '100%',
      minHeight: '240px',
      display: 'grid',
      placeItems: 'center',
      position: 'relative'
    }"
  >
    <div ref="reference">
      <VfButton class="ref" type="button" @click="onRun">
        Arrow middleware
      </VfButton>
    </div>

    <VfCard
      ref="floating"
      compact
      class="float"
      :style="{
        position: 'absolute',
        left: '0',
        top: '0',
        padding: '8px 10px',
        background: 'var(--vf-color-surface-muted)',
        zIndex: '1'
      }"
    >
      tooltip
    </VfCard>

    <span ref="arrowEl" :style="arrowStyle">
      <span ref="arrowShape" :style="arrowShapeStyle" />
    </span>
  </section>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { arrow, computePosition, flip, offset, shift } from '@codemonster-ru/floater.js'
import { VfButton, VfCard } from '@codemonster-ru/vueforge-core'

const getEl = (value) => value?.$el ?? value
const reference = ref(null)
const floating = ref(null)
const arrowEl = ref(null)
const arrowShape = ref(null)
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

  const { x, y, placement, middlewareData } = await computePosition(referenceEl, floatingEl, {
    placement: 'top',
    middleware: [offset(10), flip(), shift({ padding: 8 }), arrow(arrowEl.value)]
  })

  floatingEl.style.left = `${x}px`
  floatingEl.style.top = `${y}px`

  const data = middlewareData.arrow
  if (data) {
    const side = placement.split('-')[0]
    const visibleBorders = {
      top: ['borderRight', 'borderBottom'],
      right: ['borderBottom', 'borderLeft'],
      bottom: ['borderLeft', 'borderTop'],
      left: ['borderTop', 'borderRight']
    }

    arrowEl.value.style.left = `${data.x}px`
    arrowEl.value.style.top = `${data.y}px`

    arrowShape.value.style.border = '0'
    visibleBorders[side].forEach((borderSide) => {
      arrowShape.value.style[borderSide] = '1px solid var(--vf-color-border)'
    })
  }
}

const onRun = async () => {
  await nextTick()
  await update()
}

onMounted(() => {
  void onRun()
})
</script>
```

````

## Common Pitfalls

- Running `arrow(...)` before geometry middleware (`offset`, `flip`, `shift`).
- Reading `middlewareData.arrow` without a guard in dynamic middleware stacks.
