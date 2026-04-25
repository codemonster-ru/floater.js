import { isHTMLElement } from './dom-guards';

const getParentNode = (node: unknown): unknown => {
    if (typeof ShadowRoot !== 'undefined' && node instanceof ShadowRoot) {
        return node.host;
    }

    if (typeof Node !== 'undefined' && node instanceof Node && node.parentNode) {
        return node.parentNode;
    }

    if (
        typeof Node !== 'undefined' &&
        node instanceof Node &&
        typeof node.getRootNode === 'function'
    ) {
        const root = node.getRootNode();

        if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
            return root.host;
        }
    }

    return null;
};

export const getScrollParent = (node: unknown): HTMLElement | null => {
    if (isHTMLElement(node)) {
        if (typeof window !== 'undefined') {
            const style = window.getComputedStyle(node);
            const overflow = `${style.overflowX}${style.overflowY}`;
            const isScrollable = /(auto|scroll|overlay)/.test(overflow);

            if (isScrollable) {
                return node;
            }
        }

        if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
            return node;
        }
    }

    const parentNode = getParentNode(node);

    if (parentNode === null) {
        return null;
    }

    return getScrollParent(parentNode);
};

export const getScrollParents = (node: unknown): HTMLElement[] => {
    if (!isHTMLElement(node)) {
        return [];
    }

    const parents: HTMLElement[] = [];
    let current: HTMLElement | null = node;

    while (current !== null) {
        const parent = getScrollParent(current);

        if (parent === null || parents.includes(parent)) {
            break;
        }

        parents.push(parent);
        current = parent.parentElement;
    }

    return parents;
};
