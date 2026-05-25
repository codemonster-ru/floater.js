# Offset

`offset(value)` shifts floating coordinates away from the reference.

## Signature

The code snippet below illustrates this section.

```ts
offset(value: number)
```

## Parameters

The table below summarizes this section.

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `number` | Distance in pixels. Positive values move the floating element away from the reference side. |

## Return Value

Returns an offset middleware object for `computePosition(..., { middleware })`.

## Behavior

The following items are listed in this section:

- Applies distance before fallback and boundary checks.
- Should run before `flip` and `shift` in most stacks.

## Example

Interactive demo.

````playground-src
mode: component
framework: vue
height: 340
entry: /App.vue

```vue file=/App.vue
<template>
  <section
    class="stage"
    :style="{
      height: '100%',
      minHeight: '230px',
      display: 'grid',
      placeItems: 'center',
      position: 'relative'
    }"
  >
    <div ref="reference" class="trigger">
      <VfButton type="button" @click="update">
        Reference
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
        padding: 'var(--vf-surface-gap-compact) var(--vf-surface-gap)',
        borderRadius: 'var(--vf-radius-control)',
        background: 'var(--vf-color-surface-muted)'
      }"
    >
      offset: 20px
    </VfCard>
  </section>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { computePosition, offset } from '@codemonster-ru/floater.js'
import { VfButton, VfCard } from '@codemonster-ru/vueforge-core'

const getEl = (value) => value?.$el ?? value
const reference = ref(null)
const floating = ref(null)

const update = async () => {
  const referenceEl = getEl(reference.value)
  const floatingEl = getEl(floating.value)
  if (!referenceEl || !floatingEl) {
    return
  }

  const { x, y } = await computePosition(referenceEl, floatingEl, {
    placement: 'bottom',
    middleware: [offset(20)]
  })

  floatingEl.style.left = `${x}px`
  floatingEl.style.top = `${y}px`
}

onMounted(() => {
  void nextTick(update)
})
</script>
```

````

## Common Pitfalls

The following items are listed in this section:

- Passing non-finite values (`NaN`, `Infinity`).
- Placing `offset` after `flip` when offset should be included in fit checks.
