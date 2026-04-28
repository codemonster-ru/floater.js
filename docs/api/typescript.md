# TypeScript API

The package ships with built-in declarations generated at build time (`dist/*.d.ts`).

## Key types

- `PlacementType`
- `StrategyType`
- `OptionType`
- `ParamsType`
- `PositionType`
- `MiddlewareType`
- `MiddlewareTypes`
- `MiddlewareOutType`
- `MiddlewareParamType`
- `AutoUpdateOptions`
- `VirtualElement`
- `VirtualRect`

## Core interfaces

### OptionType

```ts
interface OptionType {
    placement?: PlacementType;
    middleware?: MiddlewareTypes;
    strategy?: StrategyType;
}
```

### ParamsType

```ts
interface ParamsType {
    x: number;
    y: number;
    placement: PlacementType;
    middlewareData: {
        [key: string]: MiddlewareOutType;
    };
}
```

### AutoUpdateOptions

```ts
interface AutoUpdateOptions {
    animationFrame?: boolean;
    maxFps?: number;
}
```

### VirtualRect

```ts
interface VirtualRect {
    [key: string]: number;
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
}
```

### VirtualElement

```ts
interface VirtualElement {
    offsetTop: number;
    offsetLeft: number;
    getBoundingClientRect(): VirtualRect;
}
```

### MiddlewareType

```ts
type MiddlewareType =
    | FlipMiddlewareType
    | OffsetMiddlewareType
    | ShiftMiddlewareType
    | ArrowMiddlewareType
    | CustomMiddlewareType;
```

## Typing tips

- Type anchor nodes explicitly as `HTMLElement`.
- Use `VirtualElement` for cursor, caret, and canvas anchors.
- Guard middleware results before reading optional keys (`if (middlewareData.arrow)`).
- Import public types from `@codemonster-ru/floater.js`; do not import from `dist/*` files.

## Example

```ts
import type { OptionType, ParamsType, VirtualElement } from '@codemonster-ru/floater.js';

const options: OptionType = {
    placement: 'bottom-start',
};

const virtualRef: VirtualElement = {
    offsetTop: 0,
    offsetLeft: 0,
    getBoundingClientRect: () => ({
        x: 100,
        y: 120,
        width: 0,
        height: 0,
        top: 120,
        right: 100,
        bottom: 120,
        left: 100,
    }),
};

const onResolved = (result: ParamsType) => {
    console.log(result.x, result.y, result.placement);
};
```
