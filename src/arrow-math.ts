import { defaultPlacement, type PlacementType } from './placements';
import { getElementOffsets } from './positioning';
import type { ArrowPositionType, OptionType, VirtualElement } from './float';

const getArrowDifferenceWidthByRect = (arrowRect: DOMRect, arrow: HTMLElement): number => {
    return arrowRect.width !== arrow.clientWidth ? (arrowRect.width - arrow.clientWidth) / 2 : 0;
};

const getArrowDifferenceHeightByRect = (arrowRect: DOMRect, arrow: HTMLElement): number => {
    return arrowRect.height !== arrow.clientHeight ? (arrowRect.height - arrow.clientHeight) / 2 : 0;
};

export const getArrowDifferenceWidth = (arrow: HTMLElement): number => {
    const arrowRect = arrow.getBoundingClientRect();

    return getArrowDifferenceWidthByRect(arrowRect, arrow);
};

export const getArrowDifferenceHeight = (arrow: HTMLElement): number => {
    const arrowRect = arrow.getBoundingClientRect();

    return getArrowDifferenceHeightByRect(arrowRect, arrow);
};

const getArrowPositionX = (
    x: number,
    arrowX: number,
    floatingWidth: number,
    arrowWidth: number,
    arrowDifferenceWidth: number,
): number => {
    const minX = x + arrowDifferenceWidth;
    const maxX = x + floatingWidth + arrowDifferenceWidth - arrowWidth;

    if (arrowX < minX) {
        return minX;
    }
    if (arrowX > maxX) {
        return maxX;
    }

    return arrowX;
};

const getArrowPositionY = (
    y: number,
    arrowY: number,
    floatingHeight: number,
    arrowHeight: number,
    arrowDifferenceHeight: number,
): number => {
    const minY = y + arrowDifferenceHeight;
    const maxY = y + floatingHeight + arrowDifferenceHeight - arrowHeight;

    if (arrowY < minY) {
        return minY;
    }
    if (arrowY > maxY) {
        return maxY;
    }

    return arrowY;
};

export const getTopArrowPosition = (
    x: number,
    y: number,
    arrow: HTMLElement,
    floating: HTMLElement,
    reference: HTMLElement | VirtualElement,
    options: OptionType = {},
): ArrowPositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);
    const arrowRect = arrow.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    const arrowDifferenceWidth = getArrowDifferenceWidthByRect(arrowRect, arrow);
    const arrowDifferenceHeight = getArrowDifferenceHeightByRect(arrowRect, arrow);
    let arrowX: number = referenceOffsets.left + arrowDifferenceWidth + referenceOffsets.width / 2 - arrowRect.width / 2;
    const arrowY: number = y + arrowDifferenceHeight + floatingRect.height - arrowRect.height / 2;

    arrowX = getArrowPositionX(x, arrowX, floatingRect.width, arrowRect.width, arrowDifferenceWidth);

    return {
        x: x,
        y: y,
        arrowX: arrowX,
        arrowY: arrowY,
        placement: 'top',
    };
};

export const getRightArrowPosition = (
    x: number,
    y: number,
    arrow: HTMLElement,
    floating: HTMLElement,
    reference: HTMLElement | VirtualElement,
    options: OptionType = {},
): ArrowPositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);
    const arrowRect = arrow.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    const arrowDifferenceWidth = getArrowDifferenceWidthByRect(arrowRect, arrow);
    const arrowDifferenceHeight = getArrowDifferenceHeightByRect(arrowRect, arrow);
    const arrowX: number = x + arrowDifferenceWidth - arrowRect.width / 2;
    let arrowY: number = referenceOffsets.top + arrowDifferenceHeight - arrowRect.height / 2 + referenceOffsets.height / 2;

    arrowY = getArrowPositionY(y, arrowY, floatingRect.height, arrowRect.height, arrowDifferenceHeight);

    return {
        x: x,
        y: y,
        arrowX: arrowX,
        arrowY: arrowY,
        placement: 'right',
    };
};

export const getBottomArrowPosition = (
    x: number,
    y: number,
    arrow: HTMLElement,
    floating: HTMLElement,
    reference: HTMLElement | VirtualElement,
    options: OptionType = {},
): ArrowPositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);
    const arrowRect = arrow.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    const arrowDifferenceWidth = getArrowDifferenceWidthByRect(arrowRect, arrow);
    const arrowDifferenceHeight = getArrowDifferenceHeightByRect(arrowRect, arrow);
    let arrowX: number = referenceOffsets.left + arrowDifferenceWidth + referenceOffsets.width / 2 - arrowRect.width / 2;
    const arrowY: number = y + arrowDifferenceHeight - arrowRect.height / 2;

    arrowX = getArrowPositionX(x, arrowX, floatingRect.width, arrowRect.width, arrowDifferenceWidth);

    return {
        x: x,
        y: y,
        arrowX: arrowX,
        arrowY: arrowY,
        placement: 'bottom',
    };
};

export const getLeftArrowPosition = (
    x: number,
    y: number,
    arrow: HTMLElement,
    floating: HTMLElement,
    reference: HTMLElement | VirtualElement,
    options: OptionType = {},
): ArrowPositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);
    const arrowRect = arrow.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    const arrowDifferenceWidth = getArrowDifferenceWidthByRect(arrowRect, arrow);
    const arrowDifferenceHeight = getArrowDifferenceHeightByRect(arrowRect, arrow);
    const arrowX: number = x + floatingRect.width + arrowDifferenceWidth - arrowRect.width / 2;
    let arrowY: number = referenceOffsets.top + arrowDifferenceHeight - arrowRect.height / 2 + referenceOffsets.height / 2;

    arrowY = getArrowPositionY(y, arrowY, floatingRect.height, arrowRect.height, arrowDifferenceHeight);

    return {
        x: x,
        y: y,
        arrowX: arrowX,
        arrowY: arrowY,
        placement: 'left',
    };
};

export const getArrowPosition = (
    x: number,
    y: number,
    arrow: HTMLElement,
    floating: HTMLElement,
    reference: HTMLElement | VirtualElement,
    placement: PlacementType,
    options: OptionType = {},
): ArrowPositionType => {
    switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
        return getTopArrowPosition(x, y, arrow, floating, reference, options);
    case 'right':
    case 'right-start':
    case 'right-end':
        return getRightArrowPosition(x, y, arrow, floating, reference, options);
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
        return getBottomArrowPosition(x, y, arrow, floating, reference, options);
    case 'left':
    case 'left-start':
    case 'left-end':
        return getLeftArrowPosition(x, y, arrow, floating, reference, options);
    default:
        return {
            x: 0,
            y: 0,
            arrowX: 0,
            arrowY: 0,
            placement: defaultPlacement,
        };
    }
};
