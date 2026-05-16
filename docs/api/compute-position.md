# Compute Position

`computePosition(reference, floating, options?)` computes floating coordinates and middleware output.

## Signature

```ts
computePosition(
  reference: HTMLElement | VirtualElement,
  floating: HTMLElement,
  options?: OptionType,
): Promise<ParamsType>
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `PlacementType` | `'bottom'` | Initial preferred placement. |
| `middleware` | `MiddlewareType[]` | `[]` | Middleware chain executed left to right. |
| `strategy` | `'absolute' \| 'fixed'` | auto | Coordinate system for returned `x` and `y`. Defaults to `'fixed'` when the floating element has CSS `position: fixed`, otherwise `'absolute'`. |

## Return Value

```ts
{
  x: number;
  y: number;
  placement: PlacementType;
  middlewareData: Record<string, MiddlewareOutType>;
}
```

## Behavior

- Middleware runs in the exact order provided.
- Middleware can adjust `x`, `y`, and `placement`.
- Middleware output is available as `middlewareData[name]`.
- Invalid built-in middleware params are sanitized and ignored.

## Example

Interactive demo:

````playground-src
mode: component
framework: vue
height: 380
entry: /App.vue

```vue file=/App.vue
<template>
  <section
    class="stage"
    :style="{
      height: '100%',
      minHeight: '250px',
      padding: '24px',
      boxSizing: 'border-box',
      display: 'grid',
      placeItems: 'center',
      position: 'relative'
    }"
  >
    <VfButton ref="reference" class="reference" type="button" @click="nextStep">
      {{ buttonLabel }}
    </VfButton>

    <VfCard
      ref="floating"
      compact
      class="floating"
      :style="floatingStyle"
    >
      <div :style="{ display: 'grid', gap: '4px' }">
        <span>requested: {{ requestedPlacement }}</span>
        <span>resolved: {{ resolvedPlacement }}</span>
        <span>x: {{ roundedX }}, y: {{ roundedY }}</span>
      </div>
    </VfCard>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { computePosition, offset } from '@codemonster-ru/floater.js'
import { VfButton, VfCard } from '@codemonster-ru/vueforge-core'

const getEl = (value) => value?.$el ?? value
const reference = ref(null)
const floating = ref(null)
const placements = ['top', 'right', 'bottom', 'left']
let placementIndex = 0
const requestedPlacement = ref(placements[placementIndex])
const resolvedPlacement = ref(placements[placementIndex])
const coordinates = ref({ x: 0, y: 0 })
const roundedX = computed(() => Math.round(coordinates.value.x * 10) / 10)
const roundedY = computed(() => Math.round(coordinates.value.y * 10) / 10)
const buttonLabel = computed(() => `Placement: ${requestedPlacement.value}`)
const floatingStyle = computed(() => ({
  position: 'absolute',
  left: `${coordinates.value.x}px`,
  top: `${coordinates.value.y}px`,
  minWidth: '190px',
  background: 'var(--vf-color-surface-muted)'
}))

const update = async () => {
  await nextTick()

  const referenceEl = getEl(reference.value)
  const floatingEl = getEl(floating.value)
  if (!referenceEl || !floatingEl) {
    return
  }

  const result = await computePosition(referenceEl, floatingEl, {
    placement: requestedPlacement.value,
    middleware: [offset(8)]
  })

  resolvedPlacement.value = result.placement
  coordinates.value = { x: result.x, y: result.y }
}

const nextStep = async () => {
  placementIndex = (placementIndex + 1) % placements.length
  requestedPlacement.value = placements[placementIndex]
  await update()
}

const onResize = () => {
  void update()
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onResize, true)
  void nextTick(update)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onResize, true)
})
</script>
```

````

## Common Pitfalls

- Floating element must use `position: absolute` or `position: fixed`.
- Apply returned `x/y` directly to `left/top`.
- Use `strategy: 'fixed'` for floating elements rendered in `document.body`.
