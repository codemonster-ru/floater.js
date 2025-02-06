export const placementTypes: string[] = [
    'top',
    'top-start',
    'top-end',
    'right',
    'right-start',
    'right-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'left-start',
    'left-end',
];

export type PlacementType = typeof placementTypes[number];

interface Options {
    placement?: PlacementType;
}

export interface ParamsType {
    x: number,
    y: number,
    strategy: string,
    placement: string,
}

const getScrollParent = (node: HTMLElement): HTMLElement | null => {
    if (node === null) {
        return null;
    }

    if (node.scrollHeight > node.clientHeight) {
        return node;
    } else {
        return getScrollParent(node.parentNode as HTMLElement);
    }
};

export const autoUpdate = (reference: HTMLElement, callback: () => void): void => {
    const parent: HTMLElement | null = getScrollParent(reference);

    if (parent === null) {
        return;
    }

    const onScroll = () => callback();

    parent.addEventListener('scroll', onScroll, false);
};

export const computePosition = (reference: HTMLElement, floating: HTMLElement, options: Options = {}): Promise<ParamsType> => {
    return new Promise((resolve): void => {
        const params: ParamsType = {
            x: 1,
            y: 2,
            strategy: '',
            placement: '',
        };
        const referenceComputedStyle = getComputedStyle(reference);
        const buttonBoundingClientRect = reference.getBoundingClientRect();
        const tooltipBoundingClientRect = floating.getBoundingClientRect();

        const referenceBorderTopWidth = parseInt(referenceComputedStyle.getPropertyValue('border-top-width').replace('px', ''));
        const referenceBorderRightWidth = parseInt(referenceComputedStyle.getPropertyValue('border-right-width').replace('px', ''));
        const referenceBorderBottomWidth = parseInt(referenceComputedStyle.getPropertyValue('border-bottom-width').replace('px', ''));
        const referenceBorderLeftWidth = parseInt(referenceComputedStyle.getPropertyValue('border-left-width').replace('px', ''));

        switch (options.placement) {
        case 'top':
            params.x = -tooltipBoundingClientRect.width / 2 + buttonBoundingClientRect.width / 2 - referenceBorderLeftWidth;
            params.y = -tooltipBoundingClientRect.height - referenceBorderTopWidth;

            break;
        case 'top-start':
            params.x = 0 - referenceBorderLeftWidth;
            params.y = -tooltipBoundingClientRect.height - referenceBorderTopWidth;

            break;
        case 'top-end':
            params.x = -tooltipBoundingClientRect.width + buttonBoundingClientRect.width - referenceBorderLeftWidth;
            params.y = -tooltipBoundingClientRect.height - referenceBorderTopWidth;

            break;
        case 'right':
            params.x = buttonBoundingClientRect.width - referenceBorderLeftWidth;
            params.y = -tooltipBoundingClientRect.height / 2 + buttonBoundingClientRect.height / 2 - referenceBorderTopWidth;

            break;
        case 'right-start':
            params.x = buttonBoundingClientRect.width - referenceBorderLeftWidth;
            params.y = 0 - referenceBorderTopWidth;

            break;
        case 'right-end':
            params.x = buttonBoundingClientRect.width - referenceBorderLeftWidth;
            params.y = buttonBoundingClientRect.height - tooltipBoundingClientRect.height - referenceBorderTopWidth;

            break;
        case 'bottom':
            params.x = buttonBoundingClientRect.width / 2 - tooltipBoundingClientRect.width / 2 - referenceBorderLeftWidth;
            params.y = buttonBoundingClientRect.height - referenceBorderTopWidth;

            break;
        case 'bottom-start':
            params.x = 0 - referenceBorderLeftWidth;
            params.y = buttonBoundingClientRect.height - referenceBorderTopWidth;

            break;
        case 'bottom-end':
            params.x = -tooltipBoundingClientRect.width + buttonBoundingClientRect.width - referenceBorderLeftWidth;
            params.y = buttonBoundingClientRect.height - referenceBorderTopWidth;

            break;
        case 'left':
            params.x = -tooltipBoundingClientRect.width - referenceBorderLeftWidth;
            params.y = buttonBoundingClientRect.height / 2 - tooltipBoundingClientRect.height / 2 - referenceBorderTopWidth;

            break;
        case 'left-start':
            params.x = -tooltipBoundingClientRect.width - referenceBorderLeftWidth;
            params.y = 0 - referenceBorderTopWidth;

            break;
        case 'left-end':
            params.x = -tooltipBoundingClientRect.width - referenceBorderLeftWidth;
            params.y = buttonBoundingClientRect.height - tooltipBoundingClientRect.height - referenceBorderTopWidth;

            break;
        }

        resolve(params);
    });
};