# Shift

`shift(params?)` keeps the floating element within visible bounds.

## Signature

```ts
shift(params?: { parent?: HTMLElement; padding?: number })
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `parent` | `HTMLElement` | Optional explicit boundary element. |
| `padding` | `number` | Optional viewport/boundary padding in pixels. |

## Return Value

Returns a shift middleware object for `computePosition(..., { middleware })`.

## Behavior

- Without `parent`, bounds come from viewport and scroll containers.
- Clamps coordinates to keep the floating element visible.
- Works best after `offset` and `flip`.

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
    ref="stage"
    class="stage"
    :style="{
      height: '100%',
      minHeight: '240px',
      overflow: 'auto',
      position: 'relative'
    }"
  >
    <div :style="contentStyle">
      <VfButton ref="reference" type="button" :style="referenceStyle">
        Reference
      </VfButton>

      <VfCard
        ref="floating"
        compact
        class="float"
        :style="floatingStyle"
      >
        requested: top
        <br />
        placement stays, coordinates shift
      </VfCard>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { computePosition, offset, shift } from '@codemonster-ru/floater.js'
import { VfButton, VfCard } from '@codemonster-ru/vueforge-core'

const getEl = (value) => value?.$el ?? value
const stage = ref(null)
const reference = ref(null)
const floating = ref(null)
const referenceTop = 420
const coordinates = ref({ x: 0, y: 0 })
const contentStyle = {
  height: '720px',
  position: 'relative'
}
const referenceStyle = {
  position: 'absolute',
  left: '50%',
  top: `${referenceTop}px`,
  transform: 'translateX(-50%)',
  zIndex: '2'
}
const floatingStyle = computed(() => ({
  position: 'absolute',
  left: `${coordinates.value.x}px`,
  top: `${coordinates.value.y}px`,
  width: '220px',
  padding: '8px 10px',
  background: 'var(--vf-color-surface-muted)',
  zIndex: '1'
}))

const update = async () => {
  await nextTick()

  const referenceEl = getEl(reference.value)
  const floatingEl = getEl(floating.value)
  if (!referenceEl || !floatingEl) {
    return
  }

  const { x, y } = await computePosition(referenceEl, floatingEl, {
    placement: 'top',
    middleware: [offset(8), shift({ padding: 12 })]
  })

  coordinates.value = { x, y }
}

const onViewportChange = () => {
  void update()
}

onMounted(async () => {
  await nextTick()

  const stageEl = stage.value
  const referenceEl = getEl(reference.value)
  if (stageEl && referenceEl) {
    stageEl.scrollTop = referenceEl.offsetTop - (stageEl.clientHeight - referenceEl.offsetHeight) / 2
    stageEl.addEventListener('scroll', onViewportChange)
  }

  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
  await update()
})

onBeforeUnmount(() => {
  stage.value?.removeEventListener('scroll', onViewportChange)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})
</script>
```

````

## Common Pitfalls

- Using a `parent` boundary that is too small for expected placements.
- Large offsets that force frequent clamping.
