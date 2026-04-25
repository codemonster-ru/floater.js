import { getScrollParent } from './scroll-parents';
import { isFixedStrategy, type StrategyOption } from './strategy';

export const getScrollRight = (parent: HTMLElement): number => {
    return parent.scrollLeft + parent.clientWidth;
};

export const getScrollBottom = (parent: HTMLElement): number => {
    return parent.scrollTop + parent.clientHeight;
};

export const toShiftTop = (
    y: number,
    element: HTMLElement,
    parent: HTMLElement | null = null,
    options: StrategyOption = {},
    floatingOverride?: HTMLElement,
): number => {
    const strategyTarget = floatingOverride ?? element;

    if (parent === null && typeof window !== 'undefined' && isFixedStrategy(options, strategyTarget)) {
        return y;
    }

    let scrollTop = 0;

    if (parent === null) {
        const scrollParent = getScrollParent(element);

        scrollTop = scrollParent ? scrollParent.scrollTop : 0;
    }

    return y - scrollTop;
};

export const toShiftRight = (
    x: number,
    element: HTMLElement,
    parent: HTMLElement | null = null,
    options: StrategyOption = {},
    floatingOverride?: HTMLElement,
): number => {
    let scrollRight: number;
    const strategyTarget = floatingOverride ?? element;

    if (parent === null && typeof window !== 'undefined' && isFixedStrategy(options, strategyTarget)) {
        scrollRight = window.innerWidth;
    } else if (parent === null) {
        const scrollParent = getScrollParent(element);

        scrollRight = scrollParent ? getScrollRight(scrollParent) : 0;
    } else {
        scrollRight = parent.getBoundingClientRect().width;
    }

    return -(x + element.clientWidth - scrollRight);
};

export const toShiftBottom = (
    y: number,
    element: HTMLElement,
    parent: HTMLElement | null = null,
    options: StrategyOption = {},
    floatingOverride?: HTMLElement,
): number => {
    let scrollBottom: number;
    const strategyTarget = floatingOverride ?? element;

    if (parent === null && typeof window !== 'undefined' && isFixedStrategy(options, strategyTarget)) {
        scrollBottom = window.innerHeight;
    } else if (parent === null) {
        const scrollParent = getScrollParent(element);

        scrollBottom = scrollParent ? getScrollBottom(scrollParent) : 0;
    } else {
        scrollBottom = parent.getBoundingClientRect().height;
    }

    return -(y + element.clientHeight - scrollBottom);
};

export const toShiftLeft = (
    x: number,
    element: HTMLElement,
    parent: HTMLElement | null = null,
    options: StrategyOption = {},
    floatingOverride?: HTMLElement,
): number => {
    const strategyTarget = floatingOverride ?? element;

    if (parent === null && typeof window !== 'undefined' && isFixedStrategy(options, strategyTarget)) {
        return x;
    }

    let scrollLeft = 0;

    if (parent === null) {
        const scrollParent = getScrollParent(element);

        scrollLeft = scrollParent ? scrollParent.scrollLeft : 0;
    }

    return x - scrollLeft;
};
