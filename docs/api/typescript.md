# TypeScript API

Floater.js ships with first-class TypeScript declarations (`dist/*.d.ts`).

## Common Types

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

### VirtualElement

```ts
interface VirtualElement {
  offsetTop: number;
  offsetLeft: number;
  getBoundingClientRect(): VirtualRect;
}
```

## Typing Guidelines

- Type reference elements explicitly as `HTMLElement`.
- Use `VirtualElement` for cursor/caret/canvas reference points.
- Guard optional middleware output (`if (middlewareData.arrow)`).
- Import types from `@codemonster-ru/floater.js`, not from `dist/*` paths.

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
