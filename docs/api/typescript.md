# TypeScript API

Floater.js ships with first-class TypeScript declarations (`dist/*.d.ts`).

## Common Types

The following items are listed in this section:

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

These interfaces describe the main runtime contracts returned by positioning APIs.

### OptionType

The code snippet below illustrates this section.

```ts
interface OptionType {
  placement?: PlacementType;
  middleware?: MiddlewareTypes;
  strategy?: StrategyType;
}
```

### ParamsType

The code snippet below illustrates this section.

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

The code snippet below illustrates this section.

```ts
interface AutoUpdateOptions {
  animationFrame?: boolean;
  maxFps?: number;
}
```

### VirtualElement

The code snippet below illustrates this section.

```ts
interface VirtualElement {
  offsetTop: number;
  offsetLeft: number;
  getBoundingClientRect(): VirtualRect;
}
```

## Typing Guidelines

The following items are listed in this section:

- Type reference elements explicitly as `HTMLElement`.
- Use `VirtualElement` for cursor/caret/canvas reference points.
- Guard optional middleware output (`if (middlewareData.arrow)`).
- Import types from `@codemonster-ru/floater.js`, not from `dist/*` paths.

## Example

The code snippet below illustrates this section.

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
