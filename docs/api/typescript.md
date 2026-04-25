# TypeScript API

The package ships with built-in declarations generated at build time (`dist/*.d.ts`).

## Key Types

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

## Core Interfaces

### OptionType

```ts
interface OptionType {
    placement?: PlacementType;
    middleware?: MiddlewareType[];
    strategy?: 'absolute' | 'fixed';
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

## Typing Tips

- type anchor nodes explicitly as `HTMLElement`;
- use `VirtualElement` for cursor/caret/canvas anchors;
- guard middleware results before reading optional keys (`if (middlewareData.arrow)`).

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
