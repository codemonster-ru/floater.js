import {
    placementTypes,
    type PlacementType,
} from './placements';
import { autoUpdate, type AutoUpdateOptions } from './auto-update';
import { isVisiblePosition } from './visibility';
import { type StrategyType as StrategyTypeBase } from './strategy';

export { placementTypes };
export type { PlacementType };
export { autoUpdate, isVisiblePosition };
export {
    computePosition,
} from './compute';
export {
    flipPosition,
    flip,
    getOffsetX,
    getOffsetY,
    offset,
    shift,
    arrow,
} from './middlewares';
export {
    getArrowPosition,
    getTopArrowPosition,
    getRightArrowPosition,
    getBottomArrowPosition,
    getLeftArrowPosition,
    getArrowDifferenceWidth,
    getArrowDifferenceHeight,
} from './arrow-math';
export {
    getPosition,
    getTopPosition,
    getTopStartPosition,
    getTopEndPosition,
    getRightPosition,
    getRightStartPosition,
    getRightEndPosition,
    getBottomPosition,
    getBottomStartPosition,
    getBottomEndPosition,
    getLeftPosition,
    getLeftStartPosition,
    getLeftEndPosition,
    getTopElementPosition,
    getRightElementPosition,
    getBottomElementPosition,
    getLeftElementPosition,
    getElementOffsets,
} from './positioning';
export type { AutoUpdateOptions };
export type MiddlewareTypes = MiddlewareType[];
export type StrategyType = StrategyTypeBase;

export interface OptionType {
    placement?: PlacementType;
    middleware?: MiddlewareTypes;
    strategy?: StrategyType;
}

export interface PositionType {
    x: number,
    y: number,
    placement: PlacementType,
}

export interface ArrowPositionType extends PositionType {
    arrowX: number,
    arrowY: number,
}

export interface ParamsType {
    x: number,
    y: number,
    placement: PlacementType,
    middlewareData: {
        [key: string]: MiddlewareOutType;
    },
}

export interface MiddlewareParamType extends PositionType {
    options: OptionType,
    primaryX: number,
    primaryY: number,
    floating: HTMLElement,
    reference: HTMLElement | VirtualElement,
}

export interface MiddlewareOutType extends PositionType {
    arrowX?: number,
    arrowY?: number,
    baseX?: number,
    baseY?: number,
}

export interface FlipMiddlewareType {
    fn: (params: MiddlewareParamType) => MiddlewareOutType,
    name: 'flip',
    params?: {
        placements?: PlacementType[];
    },
}

export interface OffsetMiddlewareType {
    fn: (params: MiddlewareParamType) => MiddlewareOutType,
    name: 'offset',
    params: {
        value: number;
    },
}

export interface ShiftMiddlewareType {
    fn: (params: MiddlewareParamType) => MiddlewareOutType,
    name: 'shift',
    params?: {
        parent?: HTMLElement;
    },
}

export interface ArrowMiddlewareType {
    fn: (params: MiddlewareParamType) => MiddlewareOutType,
    name: 'arrow',
    params: {
        arrow: HTMLElement;
    },
}

export interface CustomMiddlewareType {
    fn: (params: MiddlewareParamType) => MiddlewareOutType,
    name: string,
    params?: Record<string, unknown>,
}

export type MiddlewareType =
    | FlipMiddlewareType
    | OffsetMiddlewareType
    | ShiftMiddlewareType
    | ArrowMiddlewareType
    | CustomMiddlewareType;

export interface VirtualRect {
    [key: string]: number;

    x: number,
    y: number,
    width: number,
    height: number,
    top: number,
    right: number,
    bottom: number,
    left: number,
}

export interface VirtualElement {
    offsetTop: number,
    offsetLeft: number,

    getBoundingClientRect(): VirtualRect,
}
