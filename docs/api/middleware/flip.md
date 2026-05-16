# Flip

`flip(params?)` tries alternative placements when the current placement does not fit.

## Signature

```ts
flip(params?: { placements?: PlacementType[] })
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `placements` | `PlacementType[]` | Optional ordered fallback list. |

## Return Value

Returns a flip middleware object for `computePosition(..., { middleware })`.

## Behavior

- Without `placements`, the internal full fallback order is used.
- With `placements`, fallback is restricted to that list.
- Works best after `offset` and before `shift`.

## Example

Interactive demo:

````playground-src
mode: component
framework: vue
height: 340
entry: /App.vue

```vue file=/App.vue
<template>
  <section
    ref="stage"
    class="stage"
    :style="{
      height: '100%',
      minHeight: '230px',
      overflow: 'auto',
      position: 'relative'
    }"
  >
    <div :style="contentStyle">
      <VfButton ref="reference" type="button" :style="referenceStyle">
        Scroll preview
      </VfButton>

      <VfCard
        ref="floating"
        compact
        class="float"
        :style="floatingStyle"
      >
        requested: bottom
        <br />
        resolved: {{ resolvedPlacement }}
      </VfCard>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { computePosition, flip, offset, shift } from '@codemonster-ru/floater.js'
import { VfButton, VfCard } from '@codemonster-ru/vueforge-core'

const getEl = (value) => value?.$el ?? value
const stage = ref(null)
const reference = ref(null)
const floating = ref(null)
const resolvedPlacement = ref('bottom')
const coordinates = ref({ x: 0, y: 0 })
const referenceTop = 420
const contentStyle = {
  height: '720px',
  position: 'relative'
}
const referenceStyle = {
  position: 'absolute',
  left: '50%',
  top: `${referenceTop}px`,
  transform: 'translateX(-50%)'
}
const floatingStyle = computed(() => ({
  position: 'absolute',
  left: `${coordinates.value.x}px`,
  top: `${coordinates.value.y}px`,
  padding: '8px 10px',
  minWidth: '160px',
  whiteSpace: 'nowrap',
  background: 'var(--vf-color-surface-muted)'
}))

const update = async () => {
  await nextTick()

  const referenceEl = getEl(reference.value)
  const floatingEl = getEl(floating.value)
  if (!referenceEl || !floatingEl) {
    return
  }

  const { x, y, placement } = await computePosition(referenceEl, floatingEl, {
    placement: 'bottom',
    middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift({ padding: 8 })]
  })

  coordinates.value = { x, y }
  resolvedPlacement.value = placement
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

- Overly restrictive `placements` arrays that remove valid fallbacks.
- Running `flip` before `offset` when offset must be part of fit checks.
