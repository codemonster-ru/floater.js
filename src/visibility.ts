import { getScrollParent } from './scroll-parents';
import { getScrollBottom, getScrollRight } from './shift-math';
import { isFixedStrategy, type StrategyOption } from './strategy';
import { isHTMLElement } from './dom-guards';

type VisibilityReference = {
    getBoundingClientRect(): { top: number; right: number; bottom: number; left: number };
    offsetParent?: Element | null;
};

type VisibilityPosition = {
    x: number;
    y: number;
};

const getReferenceOffsetParent = (reference: VisibilityReference): HTMLElement | null => {
    if (!reference.offsetParent) {
        return null;
    }

    return isHTMLElement(reference.offsetParent) ? reference.offsetParent : null;
};

const resolveBoundaryParent = (
    reference: VisibilityReference,
    floating: HTMLElement,
    options: StrategyOption,
): HTMLElement | null => {
    if (isFixedStrategy(options, floating)) {
        return null;
    }

    if (isHTMLElement(reference)) {
        return getScrollParent(reference);
    }

    const virtualOffsetParent = getReferenceOffsetParent(reference);

    if (virtualOffsetParent) {
        return getScrollParent(virtualOffsetParent);
    }

    return getScrollParent(floating.parentElement);
};

export const isVisiblePosition = (
    position: VisibilityPosition,
    floating: HTMLElement,
    reference: VisibilityReference,
    options: StrategyOption = {},
): boolean => {
    if (isFixedStrategy(options, floating)) {
        if (typeof window === 'undefined') {
            return true;
        }

        const left = position.x;
        const top = position.y;
        const right = left + floating.clientWidth;
        const bottom = top + floating.clientHeight;

        return left >= 0 && top >= 0 && right <= window.innerWidth && bottom <= window.innerHeight;
    }

    const parent = resolveBoundaryParent(reference, floating, options);

    if (parent !== null) {
        const left = position.x;
        const top = position.y;
        const right = left + floating.clientWidth;
        const bottom = top + floating.clientHeight;

        return left >= parent.scrollLeft &&
            top >= parent.scrollTop &&
            right <= getScrollRight(parent) &&
            bottom <= getScrollBottom(parent);
    }

    if (typeof window === 'undefined') {
        return true;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const offsetParent = getReferenceOffsetParent(reference)
        || (floating.offsetParent as HTMLElement | null);

    if (offsetParent) {
        const parentRect = offsetParent.getBoundingClientRect();
        const left = parentRect.left + position.x;
        const top = parentRect.top + position.y;
        const right = left + floating.clientWidth;
        const bottom = top + floating.clientHeight;

        return left >= 0 && top >= 0 && right <= viewportWidth && bottom <= viewportHeight;
    }

    const left = position.x;
    const top = position.y;
    const right = left + floating.clientWidth;
    const bottom = top + floating.clientHeight;

    return left >= 0 && top >= 0 && right <= viewportWidth && bottom <= viewportHeight;
};

export const getAvailableSpace = (
    reference: VisibilityReference,
    floating: HTMLElement,
    options: StrategyOption = {},
) => {
    if (typeof window === 'undefined') {
        return {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        };
    }

    const scrollParent = resolveBoundaryParent(reference, floating, options);
    const referenceRect = reference.getBoundingClientRect();
    const boundaryRect = scrollParent
        ? scrollParent.getBoundingClientRect()
        : {
            top: 0,
            left: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
        };

    return {
        top: referenceRect.top - boundaryRect.top,
        right: boundaryRect.right - referenceRect.right,
        bottom: boundaryRect.bottom - referenceRect.bottom,
        left: referenceRect.left - boundaryRect.left,
    };
};
