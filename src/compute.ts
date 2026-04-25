import { sanitizeMiddlewareStack } from './middleware-guard';
import { getPosition } from './positioning';
import { isFixedStrategy } from './strategy';
import { normalizePlacement, type PlacementType } from './placements';
import { getOffsetValue } from './middleware-utils';
import type {
    MiddlewareOutType,
    MiddlewareType,
    OptionType,
    ParamsType,
    PositionType,
    VirtualElement,
} from './float';

export const computePosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): Promise<ParamsType> => {
    const runtimeOptions: OptionType = {
        ...options,
        middleware: sanitizeMiddlewareStack(options.middleware),
    };
    const placement: PlacementType = normalizePlacement(runtimeOptions.placement);
    const params: ParamsType = {
        x: 0,
        y: 0,
        placement: placement,
        middlewareData: {},
    };
    const position: PositionType = getPosition(reference, floating, placement, runtimeOptions);

    params.x = position.x;
    params.y = position.y;
    params.placement = position.placement;

    const primaryX: number = params.x;
    const primaryY: number = params.y;
    runtimeOptions.middleware?.forEach((x: MiddlewareType) => {
        const middleware: MiddlewareOutType = x.fn({
            x: params.x,
            y: params.y,
            options: runtimeOptions,
            primaryX: primaryX,
            primaryY: primaryY,
            floating: floating,
            placement: params.placement,
            reference: reference,
        });

        params.x = middleware.x;
        params.y = middleware.y;
        params.placement = middleware.placement;

        if (x.name === 'arrow') {
            middleware.baseX = middleware.x;
            middleware.baseY = middleware.y;
            middleware.x = middleware.arrowX ?? middleware.x;
            middleware.y = middleware.arrowY ?? middleware.y;
        }

        params.middlewareData[x.name] = middleware;
    });

    const fallbackPosition: PositionType = getPosition(reference, floating, params.placement, runtimeOptions);
    const offsetValue: number = getOffsetValue(runtimeOptions);

    if (!Number.isFinite(params.x)) {
        params.x = fallbackPosition.x;
    }

    if (!Number.isFinite(params.y)) {
        if (isFixedStrategy(runtimeOptions, floating)) {
            const referenceRect = reference.getBoundingClientRect();
            const floatingHeight = floating.getBoundingClientRect().height;

            if (params.placement.startsWith('top')) {
                params.y = referenceRect.top - floatingHeight - offsetValue;
            } else if (params.placement.startsWith('bottom')) {
                params.y = referenceRect.bottom + offsetValue;
            } else {
                params.y = fallbackPosition.y;
            }
        } else {
            params.y = fallbackPosition.y;
        }
    }

    return Promise.resolve(params);
};
