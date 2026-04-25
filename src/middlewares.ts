import { getPlacementSide, getPreferredPlacement, placementTypes, type PlacementType } from './placements';
import { markInternalMiddleware, sanitizeMiddlewareStack } from './middleware-guard';
import { getScrollParent } from './scroll-parents';
import { isFixedStrategy } from './strategy';
import {
    applyOffsetBounds,
    clampPoint,
    getCustomParentBounds,
    getScrollParentBounds,
    getViewportBounds,
} from './shift-bounds';
import {
    getArrowDifferenceHeight,
    getArrowDifferenceWidth,
    getArrowPosition,
} from './arrow-math';
import {
    getBottomElementPosition,
    getElementOffsets,
    getLeftElementPosition,
    getPosition,
    getRightElementPosition,
    getTopElementPosition,
} from './positioning';
import {
    getScrollBottom,
    getScrollRight,
    toShiftBottom,
    toShiftLeft,
    toShiftRight,
    toShiftTop,
} from './shift-math';
import { getAvailableSpace, isVisiblePosition } from './visibility';
import { findMiddleware, getOffsetValue, hasMiddleware } from './middleware-utils';
import type {
    ArrowMiddlewareType,
    ArrowPositionType,
    FlipMiddlewareType,
    MiddlewareOutType,
    MiddlewareParamType,
    MiddlewareType,
    OffsetMiddlewareType,
    OptionType,
    ShiftMiddlewareType,
} from './float';

export const flipPosition = ({
    options,
    primaryX,
    primaryY,
    floating,
    placement,
    reference,
}: MiddlewareParamType): false | MiddlewareOutType => {
    const runtimeOptions: OptionType = {
        ...options,
        middleware: sanitizeMiddlewareStack(options.middleware),
    };
    const position = getPosition(reference, floating, placement, runtimeOptions);
    const offsetMiddleware = findMiddleware(runtimeOptions, 'offset');

    if (offsetMiddleware) {
        const offsetResult: MiddlewareOutType = offsetMiddleware.fn({
            x: position.x,
            y: position.y,
            options: runtimeOptions,
            primaryX: primaryX,
            primaryY: primaryY,
            floating: floating,
            placement: placement,
            reference: reference,
        });

        position.x = offsetResult.x;
        position.y = offsetResult.y;
    }

    if (isVisiblePosition(position, floating, reference, runtimeOptions)) {
        return {
            x: position.x,
            y: position.y,
            placement: placement,
        };
    }

    return false;
};

export const flip = (params?: {
    placements?: PlacementType[];
}): FlipMiddlewareType => markInternalMiddleware({
    name: 'flip',
    params: params,
    fn: ({
        x,
        y,
        options,
        primaryX,
        primaryY,
        floating,
        placement,
        reference,
    }: MiddlewareParamType): MiddlewareOutType => {
        const result: MiddlewareOutType = {
            x: x,
            y: y,
            placement: placement,
        };
        const optionsWithoutShift: OptionType = {
            ...options,
            middleware: options.middleware?.filter((m: MiddlewareType): boolean => m.name !== 'shift'),
        };
        const allowedPlacements: PlacementType[] = params?.placements ? [...params.placements] : [...placementTypes];
        const isDefaultOrder = !params?.placements;
        const orderedPlacements: PlacementType[] = isDefaultOrder ? [...placementTypes] : allowedPlacements;
        let positionCalculated: boolean = false;
        const checkPlacement = (placementType: PlacementType): void => {
            if (positionCalculated) {
                return;
            }

            const flipPositioned: false | MiddlewareOutType = flipPosition({
                x,
                y,
                options: optionsWithoutShift,
                primaryX,
                primaryY,
                floating,
                placement: placementType,
                reference,
            });

            if (flipPositioned) {
                result.x = flipPositioned.x;
                result.y = flipPositioned.y;
                result.placement = flipPositioned.placement;
                positionCalculated = true;
            }
        };
        const availableSpace = getAvailableSpace(reference, floating, optionsWithoutShift);
        if (!isDefaultOrder && allowedPlacements.includes(placement)) {
            checkPlacement(placement);
        }

        if (!positionCalculated) {
            orderedPlacements.forEach(checkPlacement);
        }

        if (!positionCalculated) {
            const bestFit = allowedPlacements.reduce<{ result: MiddlewareOutType; space: number } | null>(
                (current, placementType) => {
                    const flipPositioned: false | MiddlewareOutType = flipPosition({
                        x,
                        y,
                        options: optionsWithoutShift,
                        primaryX,
                        primaryY,
                        floating,
                        placement: placementType,
                        reference,
                    });

                    if (!flipPositioned) {
                        return current;
                    }

                    const side = getPlacementSide(placementType);
                    const space = availableSpace[side];

                    if (!current || space > current.space) {
                        return { result: flipPositioned, space };
                    }

                    return current;
                },
                null,
            );

            if (bestFit) {
                result.x = bestFit.result.x;
                result.y = bestFit.result.y;
                result.placement = bestFit.result.placement;
                positionCalculated = true;
            }
        }

        if (!positionCalculated && allowedPlacements.length > 0) {
            const currentSide = getPlacementSide(placement);
            let bestSide = currentSide;
            let bestSpace = availableSpace[currentSide];

            allowedPlacements.forEach((placementType) => {
                const side = getPlacementSide(placementType);
                const space = availableSpace[side];

                if (space > bestSpace) {
                    bestSpace = space;
                    bestSide = side;
                }
            });

            const bestPlacement = getPreferredPlacement(bestSide, placement, allowedPlacements);
            const fallbackPosition = getPosition(reference, floating, bestPlacement, optionsWithoutShift);
            const offsetMiddleware = findMiddleware(optionsWithoutShift, 'offset');

            if (offsetMiddleware) {
                const offsetResult: MiddlewareOutType = offsetMiddleware.fn({
                    x: fallbackPosition.x,
                    y: fallbackPosition.y,
                    options: optionsWithoutShift,
                    primaryX,
                    primaryY,
                    floating,
                    placement: bestPlacement,
                    reference,
                });

                fallbackPosition.x = offsetResult.x;
                fallbackPosition.y = offsetResult.y;
            }

            result.x = fallbackPosition.x;
            result.y = fallbackPosition.y;
            result.placement = fallbackPosition.placement;
        }

        return result;
    },
});

export const getOffsetX = (
    value: number,
    options: OptionType,
    primaryX: number,
    placement: string,
    floating: HTMLElement,
) => {
    let xValue: number = 0;

    if (placement.startsWith('right')) {
        xValue = -value;
    } else if (placement.startsWith('left')) {
        xValue = value;
    }

    const arrowMiddleware = findMiddleware(options, 'arrow');
    const shiftMiddleware = findMiddleware(options, 'shift');

    if (arrowMiddleware) {
        const arrowElement = arrowMiddleware.params.arrow;
        const arrowRect = arrowElement.getBoundingClientRect();

        if (placement.startsWith('right')) {
            xValue -= arrowRect.width / 2;
        } else if (placement.startsWith('left')) {
            xValue += arrowRect.width / 2;
        }
    }

    if (hasMiddleware(options, 'shift') && arrowMiddleware) {
        let shiftParent: null | HTMLElement = null;
        let arrowDifferenceWidth: number = 0;

        if (shiftMiddleware) {
            shiftParent = shiftMiddleware.params?.parent ?? null;
        }

        const arrowElement = arrowMiddleware.params.arrow;
        const arrowRect = arrowElement.getBoundingClientRect();

        arrowDifferenceWidth = arrowRect.width / 2;
        arrowDifferenceWidth += getArrowDifferenceWidth(arrowElement);
        arrowDifferenceWidth -= value;

        if (placement.startsWith('right')) {
            if (toShiftRight(primaryX - xValue, floating, shiftParent, options) <= value) {
                if (toShiftRight(primaryX, floating, shiftParent, options) > 0) {
                    xValue = value - toShiftRight(primaryX, floating, shiftParent, options);
                } else {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating, shiftParent, options) <= value) {
                if (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating, shiftParent, options) >= 0) {
                    xValue = -value - (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating, shiftParent, options) + value);

                    if (shiftParent) {
                        xValue = -value;
                    }
                } else {
                    xValue = -value;
                }
            }
        } else if (placement.startsWith('left')) {
            if (toShiftRight(primaryX - xValue + arrowDifferenceWidth, floating, shiftParent, options) <= value) {
                xValue = value + toShiftRight(primaryX - arrowDifferenceWidth, floating, shiftParent, options);

                if (xValue <= value) {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue, floating, shiftParent, options) <= value) {
                xValue = -value + toShiftLeft(primaryX, floating, shiftParent, options);

                if (xValue <= -value) {
                    xValue = -value;
                }
            }
        } else {
            if (toShiftRight(primaryX - xValue, floating, shiftParent, options) <= value) {
                if (toShiftRight(primaryX - xValue, floating, shiftParent, options) <= value && toShiftRight(primaryX, floating, shiftParent, options) > 0) {
                    xValue = value - toShiftRight(primaryX, floating, shiftParent, options);
                } else {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue, floating, shiftParent, options) <= value) {
                if (toShiftLeft(primaryX - xValue, floating, shiftParent, options) <= value && toShiftLeft(primaryX, floating, shiftParent, options) > 0) {
                    xValue = -(value - toShiftLeft(primaryX, floating, shiftParent, options));
                } else {
                    xValue = -value;
                }
            }
        }
    }

    return xValue;
};

export const getOffsetY = (
    value: number,
    options: OptionType,
    primaryY: number,
    placement: string,
    floating: HTMLElement,
) => {
    let yValue: number = 0;

    if (placement.startsWith('top')) {
        yValue = value;
    } else if (placement.startsWith('bottom')) {
        yValue = -value;
    }

    const arrowMiddleware = findMiddleware(options, 'arrow');
    const shiftMiddleware = findMiddleware(options, 'shift');

    if (arrowMiddleware) {
        const arrowElement = arrowMiddleware.params.arrow;
        const arrowRect = arrowElement.getBoundingClientRect();

        if (placement.startsWith('top')) {
            yValue += arrowRect.height / 2;
        } else if (placement.startsWith('bottom')) {
            yValue -= arrowRect.height / 2;
        }
    }

    if (hasMiddleware(options, 'shift') && arrowMiddleware) {
        let shiftParent: null | HTMLElement = null;
        let arrowDifferenceHeight: number = 0;

        if (shiftMiddleware) {
            shiftParent = shiftMiddleware.params?.parent ?? null;
        }

        const arrowElement = arrowMiddleware.params.arrow;
        const arrowRect = arrowElement.getBoundingClientRect();

        arrowDifferenceHeight = arrowRect.height / 2;
        arrowDifferenceHeight += getArrowDifferenceHeight(arrowElement);
        arrowDifferenceHeight -= value;

        if (placement.startsWith('top')) {
            if (toShiftTop(primaryY - yValue, floating, shiftParent, options) <= value) {
                if (toShiftTop(primaryY, floating, shiftParent, options) >= 0) {
                    yValue = -(value - toShiftTop(primaryY, floating, shiftParent, options));
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue + arrowDifferenceHeight, floating, shiftParent, options) <= value) {
                yValue = value + toShiftBottom(primaryY - arrowDifferenceHeight, floating, shiftParent, options);

                if (yValue <= value) {
                    yValue = value;
                }
            }
        } else if (placement.startsWith('bottom')) {
            if (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating, shiftParent, options) <= value) {
                if (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating, shiftParent, options) >= 0) {
                    yValue = -value - (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating, shiftParent, options) + value);

                    if (shiftParent) {
                        yValue = -value;
                    }
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue, floating, shiftParent, options) <= value) {
                if (toShiftBottom(primaryY, floating, shiftParent, options) >= 0) {
                    yValue = value - toShiftBottom(primaryY, floating, shiftParent, options);
                } else {
                    yValue = value;
                }
            }
        } else {
            if (toShiftTop(primaryY - yValue, floating, shiftParent, options) <= value) {
                if (toShiftTop(primaryY - yValue, floating, shiftParent, options) >= 0) {
                    yValue = -(value - toShiftTop(primaryY - yValue, floating, shiftParent, options));
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue, floating, shiftParent, options) <= value) {
                if (toShiftBottom(primaryY - yValue, floating, shiftParent, options) >= 0) {
                    yValue = value - toShiftBottom(primaryY - yValue, floating, shiftParent, options);
                } else {
                    yValue = value;
                }
            }
        }
    }

    return yValue;
};

export const offset = (value: number): OffsetMiddlewareType => markInternalMiddleware({
    name: 'offset',
    params: { value },
    fn: ({
        x,
        y,
        options,
        primaryX,
        primaryY,
        floating,
        placement,
    }: MiddlewareParamType): MiddlewareOutType => {
        return {
            x: x - getOffsetX(value, options, primaryX, placement, floating),
            y: y - getOffsetY(value, options, primaryY, placement, floating),
            placement: placement,
        };
    },
});

export const shift = (params?: {
    parent?: HTMLElement;
}): ShiftMiddlewareType => markInternalMiddleware({
    name: 'shift',
    params: params,
    fn: ({
        x,
        y,
        options,
        primaryX,
        primaryY,
        floating,
        placement,
        reference,
    }: MiddlewareParamType): MiddlewareOutType => {
        const result: MiddlewareOutType = {
            x: x,
            y: y,
            placement: placement,
        };
        const middleware = options.middleware || [];
        const shiftIndex = middleware.findIndex((m) => m.name === 'shift');
        const offsetIndex = middleware.findIndex((m) => m.name === 'offset');
        const applyOffsetLater = offsetIndex !== -1 && (shiftIndex === -1 || offsetIndex > shiftIndex);
        const offsetValue: number = getOffsetValue(options);
        const offsetMiddleware = findMiddleware(options, 'offset');
        const offsetX = applyOffsetLater ? getOffsetX(offsetValue, options, primaryX, placement, floating) : 0;
        const offsetY = applyOffsetLater ? getOffsetY(offsetValue, options, primaryY, placement, floating) : 0;
        const adjustedX = x - offsetX;
        const adjustedY = y - offsetY;
        let workingX = adjustedX;
        let workingY = adjustedY;
        const padding = offsetMiddleware ? Math.abs(offsetValue) : 0;
        const marginX = padding;
        const marginY = padding;
        const fixed = isFixedStrategy(options, floating);

        if (fixed && typeof window !== 'undefined' && !params?.parent) {
            const bounds = getViewportBounds(
                window.innerWidth,
                window.innerHeight,
                floating.clientWidth,
                floating.clientHeight,
                marginX,
                marginY,
            );
            const workingPoint = { x: workingX, y: workingY };

            clampPoint(workingPoint, bounds);
            workingX = workingPoint.x;
            workingY = workingPoint.y;

            if (applyOffsetLater) {
                result.x = x + (workingX - adjustedX);
                result.y = y + (workingY - adjustedY);
            } else {
                result.x = workingX;
                result.y = workingY;
            }

            clampPoint(result, applyOffsetBounds(bounds, applyOffsetLater, offsetX, offsetY));

            return result;
        }

        const parent: HTMLElement | null = getScrollParent(floating.parentElement);

        if (params?.parent === undefined && parent !== null) {
            const referenceOffsets = getElementOffsets(reference, floating, options);
            const referenceLeft = referenceOffsets.left;
            const referenceRight = referenceOffsets.left + referenceOffsets.width;
            const referenceTop = referenceOffsets.top;
            const referenceBottom = referenceOffsets.top + referenceOffsets.height;
            const viewLeft = parent.scrollLeft;
            const viewRight = getScrollRight(parent);
            const viewTop = parent.scrollTop;
            const viewBottom = getScrollBottom(parent);
            const bounds = getScrollParentBounds(
                parent.scrollLeft,
                parent.scrollTop,
                viewRight,
                viewBottom,
                floating.clientWidth,
                floating.clientHeight,
                marginX,
                marginY,
            );

            if (referenceRight <= viewLeft) {
                workingX = bounds.minX;
            } else if (referenceLeft >= viewRight) {
                workingX = bounds.maxX;
            }

            if (referenceBottom <= viewTop) {
                workingY = bounds.minY;
            } else if (referenceTop >= viewBottom) {
                workingY = bounds.maxY;
            }
            const workingPoint = { x: workingX, y: workingY };
            clampPoint(workingPoint, bounds);
            workingX = workingPoint.x;
            workingY = workingPoint.y;
        } else if (params?.parent === undefined && parent === null && typeof window !== 'undefined') {
            const bounds = getViewportBounds(
                window.innerWidth,
                window.innerHeight,
                floating.clientWidth,
                floating.clientHeight,
                marginX,
                marginY,
            );
            const workingPoint = { x: workingX, y: workingY };
            clampPoint(workingPoint, bounds);
            workingX = workingPoint.x;
            workingY = workingPoint.y;
        } else if (params?.parent) {
            const parentRect = params?.parent.getBoundingClientRect();
            const bounds = getCustomParentBounds(
                parentRect.width,
                parentRect.height,
                floating.clientWidth,
                floating.clientHeight,
                marginX,
                marginY,
            );
            const workingPoint = { x: workingX, y: workingY };
            clampPoint(workingPoint, bounds);
            workingX = workingPoint.x;
            workingY = workingPoint.y;
        }

        if (applyOffsetLater) {
            result.x = x + (workingX - adjustedX);
            result.y = y + (workingY - adjustedY);
        } else {
            result.x = workingX;
            result.y = workingY;
        }

        if (params?.parent === undefined && parent !== null) {
            const bounds = getScrollParentBounds(
                parent.scrollLeft,
                parent.scrollTop,
                getScrollRight(parent),
                getScrollBottom(parent),
                floating.clientWidth,
                floating.clientHeight,
                marginX,
                marginY,
            );

            clampPoint(result, applyOffsetBounds(bounds, applyOffsetLater, offsetX, offsetY));
        } else if (params?.parent === undefined && parent === null && typeof window !== 'undefined') {
            const bounds = getViewportBounds(
                window.innerWidth,
                window.innerHeight,
                floating.clientWidth,
                floating.clientHeight,
                marginX,
                marginY,
            );

            clampPoint(result, applyOffsetBounds(bounds, applyOffsetLater, offsetX, offsetY));
        } else if (params?.parent) {
            const parentRect = params?.parent.getBoundingClientRect();
            const bounds = getCustomParentBounds(
                parentRect.width,
                parentRect.height,
                floating.clientWidth,
                floating.clientHeight,
                marginX,
                marginY,
            );

            clampPoint(result, applyOffsetBounds(bounds, applyOffsetLater, offsetX, offsetY));
        }

        return result;
    },
});

export const arrow = (arrow: HTMLElement): ArrowMiddlewareType => markInternalMiddleware({
    name: 'arrow',
    params: { arrow },
    fn: ({
        x,
        y,
        options,
        primaryX,
        primaryY,
        floating,
        placement,
        reference,
    }: MiddlewareParamType): MiddlewareOutType => {
        const result: MiddlewareOutType = {
            x: x,
            y: y,
            arrowX: 0,
            arrowY: 0,
            placement: placement,
        };

        if (!hasMiddleware(options, 'offset')) {
            result.x = x - getOffsetX(getArrowDifferenceWidth(arrow), options, primaryX, placement, floating);
            result.y = y - getOffsetY(getArrowDifferenceHeight(arrow), options, primaryY, placement, floating);
        }

        const arrowPosition: ArrowPositionType = getArrowPosition(result.x, result.y, arrow, floating, reference, placement, options);

        if (hasMiddleware(options, 'shift')) {
            const offsetValue: number = getOffsetValue(options);
            const floatingRect = floating.getBoundingClientRect();
            const arrowRect = arrow.getBoundingClientRect();
            const arrowDifferenceWidth = getArrowDifferenceWidth(arrow);
            const arrowDifferenceHeight = getArrowDifferenceHeight(arrow);

            if (arrowPosition.placement.startsWith('top')) {
                if (
                    result.x + arrowDifferenceWidth >= arrowPosition.arrowX ||
                    result.x + arrowDifferenceWidth + floatingRect.width - arrowRect.width <= arrowPosition.arrowX ||
                    result.y + floatingRect.height + arrowRect.height / 2 >= getTopElementPosition(reference, floating, options) ||
                    toShiftBottom(arrowPosition.arrowY + arrowDifferenceHeight, arrow, null, options, floating) <= 0
                ) {
                    arrowPosition.arrowY = arrowPosition.arrowY - arrowRect.height / 2;
                }
            } else if (arrowPosition.placement.startsWith('right')) {
                if (
                    result.y + arrowDifferenceHeight >= arrowPosition.arrowY ||
                    result.y + arrowDifferenceHeight + floatingRect.height - arrowRect.height <= arrowPosition.arrowY ||
                    result.x - arrowRect.width / 2 <= getRightElementPosition(reference, floating, options) ||
                    toShiftLeft(arrowPosition.arrowX - arrowDifferenceWidth - offsetValue, arrow, null, options, floating) <= 0
                ) {
                    arrowPosition.arrowX = arrowPosition.arrowX + arrowRect.width / 2;
                }
            } else if (arrowPosition.placement.startsWith('bottom')) {
                if (
                    result.x + arrowDifferenceWidth >= arrowPosition.arrowX ||
                    result.x + arrowDifferenceWidth + floatingRect.width - arrowRect.width <= arrowPosition.arrowX ||
                    result.y - arrowRect.height / 2 <= getBottomElementPosition(reference, floating, options) ||
                    toShiftTop(arrowPosition.arrowY - arrowDifferenceHeight, arrow, null, options, floating) <= 0
                ) {
                    arrowPosition.arrowY = arrowPosition.arrowY + arrowRect.height / 2;
                }
            } else if (arrowPosition.placement.startsWith('left')) {
                if (
                    result.y + arrowDifferenceHeight >= arrowPosition.arrowY ||
                    result.y + arrowDifferenceHeight + floatingRect.height - arrowRect.height <= arrowPosition.arrowY ||
                    result.x + floatingRect.width + arrowRect.width / 2 >= getLeftElementPosition(reference, floating, options) ||
                    toShiftRight(arrowPosition.arrowX + arrowDifferenceWidth + offsetValue, arrow, null, options, floating) <= 0
                ) {
                    arrowPosition.arrowX = arrowPosition.arrowX - arrowRect.width / 2;
                }
            }
        }

        result.arrowX = arrowPosition.arrowX;
        result.arrowY = arrowPosition.arrowY;

        return result;
    },
});
