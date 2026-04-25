import { clamp, normalizeMax } from './bounds';

export type ShiftBounds = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};

export const getViewportBounds = (
    viewportWidth: number,
    viewportHeight: number,
    floatingWidth: number,
    floatingHeight: number,
    marginX: number,
    marginY: number,
): ShiftBounds => {
    const minX = marginX;
    const maxX = normalizeMax(minX, viewportWidth - floatingWidth - marginX);
    const minY = marginY;
    const maxY = normalizeMax(minY, viewportHeight - floatingHeight - marginY);

    return { minX, maxX, minY, maxY };
};

export const getScrollParentBounds = (
    scrollLeft: number,
    scrollTop: number,
    scrollRight: number,
    scrollBottom: number,
    floatingWidth: number,
    floatingHeight: number,
    marginX: number,
    marginY: number,
): ShiftBounds => {
    const minX = scrollLeft + marginX;
    const maxX = normalizeMax(minX, scrollRight - floatingWidth - marginX);
    const minY = scrollTop + marginY;
    const maxY = normalizeMax(minY, scrollBottom - floatingHeight - marginY);

    return { minX, maxX, minY, maxY };
};

export const getCustomParentBounds = (
    parentWidth: number,
    parentHeight: number,
    floatingWidth: number,
    floatingHeight: number,
    marginX: number,
    marginY: number,
): ShiftBounds => {
    const minX = marginX;
    const maxX = normalizeMax(minX, parentWidth - floatingWidth - marginX);
    const minY = marginY;
    const maxY = normalizeMax(minY, parentHeight - floatingHeight - marginY);

    return { minX, maxX, minY, maxY };
};

export const applyOffsetBounds = (
    bounds: ShiftBounds,
    applyOffsetLater: boolean,
    offsetX: number,
    offsetY: number,
): ShiftBounds => {
    if (!applyOffsetLater) {
        return bounds;
    }

    return {
        minX: bounds.minX + offsetX,
        maxX: bounds.maxX + offsetX,
        minY: bounds.minY + offsetY,
        maxY: bounds.maxY + offsetY,
    };
};

export const clampPoint = (
    point: { x: number; y: number },
    bounds: ShiftBounds,
): void => {
    point.x = clamp(point.x, bounds.minX, bounds.maxX);
    point.y = clamp(point.y, bounds.minY, bounds.maxY);
};
