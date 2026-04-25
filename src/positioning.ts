import { normalizePlacement } from './placements';
import { isFixedStrategy } from './strategy';
import type { OptionType, PositionType, VirtualElement } from './float';

export const getElementOffsets = (
    element: HTMLElement | VirtualElement,
    floating?: HTMLElement,
    options: OptionType = {},
): { left: number, top: number, width: number, height: number } => {
    const rect = element.getBoundingClientRect();
    const parent = floating ? (floating.offsetParent as HTMLElement | null) : null;
    const useViewportCoords = floating ? isFixedStrategy(options, floating) : false;

    if (parent && !useViewportCoords) {
        const parentRect = parent.getBoundingClientRect();
        const scrollLeft = parent.scrollLeft;
        const scrollTop = parent.scrollTop;

        return {
            left: rect.left - parentRect.left + scrollLeft,
            top: rect.top - parentRect.top + scrollTop,
            width: rect.width,
            height: rect.height,
        };
    }

    return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
    };
};

export const getTopPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width / 2 + referenceOffsets.width / 2,
        y: referenceOffsets.top - floating.getBoundingClientRect().height,
        placement: 'top',
    };
};

export const getTopStartPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left,
        y: referenceOffsets.top - floating.getBoundingClientRect().height,
        placement: 'top-start',
    };
};

export const getTopEndPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width + referenceOffsets.width,
        y: referenceOffsets.top - floating.getBoundingClientRect().height,
        placement: 'top-end',
    };
};

export const getRightPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left + referenceOffsets.width,
        y: referenceOffsets.top - floating.getBoundingClientRect().height / 2 + referenceOffsets.height / 2,
        placement: 'right',
    };
};

export const getRightStartPosition = (
    reference: HTMLElement | VirtualElement,
    floating?: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left + referenceOffsets.width,
        y: referenceOffsets.top,
        placement: 'right-start',
    };
};

export const getRightEndPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left + referenceOffsets.width,
        y: referenceOffsets.top + referenceOffsets.height - floating.getBoundingClientRect().height,
        placement: 'right-end',
    };
};

export const getBottomPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left + referenceOffsets.width / 2 - floating.getBoundingClientRect().width / 2,
        y: referenceOffsets.top + referenceOffsets.height,
        placement: 'bottom',
    };
};

export const getBottomStartPosition = (
    reference: HTMLElement | VirtualElement,
    floating?: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left,
        y: referenceOffsets.top + referenceOffsets.height,
        placement: 'bottom-start',
    };
};

export const getBottomEndPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width + referenceOffsets.width,
        y: referenceOffsets.top + referenceOffsets.height,
        placement: 'bottom-end',
    };
};

export const getLeftPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width,
        y: referenceOffsets.top + referenceOffsets.height / 2 - floating.getBoundingClientRect().height / 2,
        placement: 'left',
    };
};

export const getLeftStartPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width,
        y: referenceOffsets.top,
        placement: 'left-start',
    };
};

export const getLeftEndPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    options: OptionType = {},
): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating, options);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width,
        y: referenceOffsets.top + referenceOffsets.height - floating.getBoundingClientRect().height,
        placement: 'left-end',
    };
};

export const getTopElementPosition = (
    element: HTMLElement | VirtualElement,
    floating?: HTMLElement,
    options: OptionType = {},
) => getElementOffsets(element, floating, options).top;

export const getRightElementPosition = (
    element: HTMLElement | VirtualElement,
    floating?: HTMLElement,
    options: OptionType = {},
) => {
    const offsets = getElementOffsets(element, floating, options);

    return offsets.left + offsets.width;
};

export const getBottomElementPosition = (
    element: HTMLElement | VirtualElement,
    floating?: HTMLElement,
    options: OptionType = {},
) => {
    const offsets = getElementOffsets(element, floating, options);

    return offsets.top + offsets.height;
};

export const getLeftElementPosition = (
    element: HTMLElement | VirtualElement,
    floating?: HTMLElement,
    options: OptionType = {},
) => getElementOffsets(element, floating, options).left;

export const getPosition = (
    reference: HTMLElement | VirtualElement,
    floating: HTMLElement,
    placement: string,
    options: OptionType = {},
): PositionType => {
    const normalizedPlacement = normalizePlacement(placement);

    switch (normalizedPlacement) {
    case 'top':
        return getTopPosition(reference, floating, options);
    case 'top-start':
        return getTopStartPosition(reference, floating, options);
    case 'top-end':
        return getTopEndPosition(reference, floating, options);
    case 'right':
        return getRightPosition(reference, floating, options);
    case 'right-start':
        return getRightStartPosition(reference, floating, options);
    case 'right-end':
        return getRightEndPosition(reference, floating, options);
    case 'bottom':
        return getBottomPosition(reference, floating, options);
    case 'bottom-start':
        return getBottomStartPosition(reference, floating, options);
    case 'bottom-end':
        return getBottomEndPosition(reference, floating, options);
    case 'left':
        return getLeftPosition(reference, floating, options);
    case 'left-start':
        return getLeftStartPosition(reference, floating, options);
    case 'left-end':
        return getLeftEndPosition(reference, floating, options);
    default:
        return getBottomPosition(reference, floating, options);
    }
};
