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

export type MiddlewareTypes = MiddlewareType[];

export interface OptionType {
    placement?: PlacementType;
    middleware?: MiddlewareTypes;
}

export interface ParamsType {
    x: number,
    y: number,
    placement: PlacementType,
}

export interface MiddlewareParamType extends ParamsType {
    options: OptionType,
    primaryX: number,
    primaryY: number,
    floating: HTMLElement,
    reference: HTMLElement,
    scrollDirection: string,
}

export interface MiddlewareType {
    name: string,
    fn: ({
        x,
        y,
        options,
        primaryX,
        primaryY,
        floating,
        placement,
        reference,
        scrollDirection,
    }: MiddlewareParamType) => MiddlewareParamType,
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
const getScrollDirection = (reference: HTMLElement) => {
    const parent: HTMLElement | null = getScrollParent(reference);
    let scrollDirection: string = '';

    if (parent !== null) {
        if (parent.dataset.scrollTop === undefined || parent.scrollTop === +parent.dataset.scrollTop) {
            parent.dataset.scrollTop = '0';
        }

        if (parent.dataset.scrollLeft === undefined || parent.scrollLeft === +parent.dataset.scrollLeft) {
            parent.dataset.scrollLeft = '0';
        }

        if (parent.scrollTop > +parent.dataset.scrollTop) {
            scrollDirection = 'bottom';
        } else if (parent.scrollTop < +parent.dataset.scrollTop) {
            scrollDirection = 'top';
        } else if (parent.scrollLeft > +parent.dataset.scrollLeft) {
            scrollDirection = 'right';
        } else if (parent.scrollLeft < +parent.dataset.scrollLeft) {
            scrollDirection = 'left';
        }

        parent.dataset.scrollTop = parent.scrollTop <= 0 ? '0' : parent.scrollTop.toString();
        parent.dataset.scrollLeft = parent.scrollLeft <= 0 ? '0' : parent.scrollLeft.toString();
    }

    return scrollDirection;
};
const scrollRight = (parent: HTMLElement) => {
    return parent.scrollLeft + parent.clientWidth;
};
const scrollBottom = (parent: HTMLElement) => {
    return parent.scrollTop + parent.clientHeight;
};
const toShiftTop = (y: number, parent: HTMLElement) => {
    return y - parent.scrollTop;
};
const toShiftRight = (x: number, floating: HTMLElement, parent: HTMLElement) => {
    return x + floating.clientWidth - scrollRight(parent);
};
const toShiftBottom = (y: number, floating: HTMLElement, parent: HTMLElement) => {
    return y + floating.clientHeight - scrollBottom(parent);
};
const toShiftLeft = (x: number, parent: HTMLElement) => {
    return x - parent.scrollLeft;
};

export const offset = (value: number): MiddlewareType => ({
    name: 'offset',
    fn: ({
        x,
        y,
        options,
        primaryX,
        primaryY,
        floating,
        placement,
        reference,
        scrollDirection,
    }: MiddlewareParamType): MiddlewareParamType => {
        let xValue: number = 0;
        let yValue: number = 0;
        const parent: HTMLElement | null = getScrollParent(floating);

        if (placement.startsWith('top')) {
            yValue = value;
        } else if (placement.startsWith('right')) {
            xValue = -value;
        } else if (placement.startsWith('bottom')) {
            yValue = -value;
        } else if (placement.startsWith('left')) {
            xValue = value;
        }

        if (options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift') && parent !== null) {
            if (toShiftTop(primaryY - yValue, parent) <= value) {
                if (toShiftTop(primaryY - yValue, parent) <= value && toShiftTop(primaryY, parent) > 0) {
                    yValue = -(value - toShiftTop(primaryY, parent));
                } else {
                    yValue = -value;
                }
            } else if (-toShiftBottom(primaryY - yValue, floating, parent) <= value) {
                if (-toShiftBottom(primaryY - yValue, floating, parent) <= value && -toShiftBottom(primaryY, floating, parent) > 0) {
                    yValue = value - -toShiftBottom(primaryY, floating, parent);
                } else {
                    yValue = value;
                }
            }

            if (-toShiftRight(primaryX - xValue, floating, parent) <= value) {
                if (-toShiftRight(primaryX - xValue, floating, parent) <= value && -toShiftRight(primaryX, floating, parent) > 0) {
                    xValue = value - -toShiftRight(primaryX, floating, parent);
                } else {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue, parent) <= value) {
                if (toShiftLeft(primaryX - xValue, parent) <= value && toShiftLeft(primaryX, parent) > 0) {
                    xValue = -(value - toShiftLeft(primaryX, parent));
                } else {
                    xValue = -value;
                }
            }
        }

        return {
            x: x - xValue,
            y: y - yValue,
            options: options,
            primaryX: primaryX,
            primaryY: primaryY,
            floating: floating,
            placement: placement,
            reference: reference,
            scrollDirection: scrollDirection,
        };
    },
});

export const shift = (): MiddlewareType => ({
    name: 'shift',
    fn: ({
        x,
        y,
        options,
        primaryX,
        primaryY,
        floating,
        placement,
        reference,
        scrollDirection,
    }: MiddlewareParamType): MiddlewareParamType => {
        const parent: HTMLElement | null = getScrollParent(floating);
        const result: MiddlewareParamType = {
            x: x,
            y: y,
            options: options,
            primaryX: primaryX,
            primaryY: primaryY,
            floating: floating,
            placement: placement,
            reference: reference,
            scrollDirection: scrollDirection,
        };

        if (parent !== null) {
            if (toShiftTop(result.y, parent) < 0) {
                result.y = parent.scrollTop;
            } else if (toShiftBottom(result.y, floating, parent) > 0) {
                result.y = scrollBottom(parent) - floating.clientHeight;
            }

            if (toShiftRight(result.x, floating, parent) > 0) {
                result.x = scrollRight(parent) - floating.clientWidth;
            } else if (toShiftLeft(result.x, parent) < 0) {
                result.x = parent.scrollLeft;
            }
        }

        return result;
    },
});

export const autoUpdate = (reference: HTMLElement, callback: () => void): void => {
    const parent: HTMLElement | null = getScrollParent(reference);

    if (parent === null) {
        return;
    }

    const onScroll = () => callback();

    parent.addEventListener('scroll', onScroll, false);
};

export const computePosition = (reference: HTMLElement, floating: HTMLElement, options: OptionType = {}): Promise<ParamsType> => {
    return new Promise((resolve): void => {
        const params: ParamsType = {
            x: 0,
            y: 0,
            placement: '',
        };
        const buttonBoundingClientRect: DOMRect = reference.getBoundingClientRect();
        const tooltipBoundingClientRect: DOMRect = floating.getBoundingClientRect();

        switch (options.placement) {
        case 'top':
            params.x = reference.offsetLeft - tooltipBoundingClientRect.width / 2 + buttonBoundingClientRect.width / 2;
            params.y = reference.offsetTop - tooltipBoundingClientRect.height;
            params.placement = options.placement;

            break;
        case 'top-start':
            params.x = reference.offsetLeft;
            params.y = reference.offsetTop - tooltipBoundingClientRect.height;
            params.placement = options.placement;

            break;
        case 'top-end':
            params.x = reference.offsetLeft - buttonBoundingClientRect.width / 2;
            params.y = reference.offsetTop - tooltipBoundingClientRect.height;
            params.placement = options.placement;

            break;
        case 'right':
            params.x = reference.offsetLeft + buttonBoundingClientRect.width;
            params.y = reference.offsetTop - tooltipBoundingClientRect.height / 2 + buttonBoundingClientRect.height / 2;
            params.placement = options.placement;

            break;
        case 'right-start':
            params.x = reference.offsetLeft + buttonBoundingClientRect.width;
            params.y = reference.offsetTop;
            params.placement = options.placement;

            break;
        case 'right-end':
            params.x = reference.offsetLeft + buttonBoundingClientRect.width;
            params.y = reference.offsetTop + buttonBoundingClientRect.height - tooltipBoundingClientRect.height;
            params.placement = options.placement;

            break;
        case 'bottom':
            params.x = reference.offsetLeft + buttonBoundingClientRect.width / 2 - tooltipBoundingClientRect.width / 2;
            params.y = reference.offsetTop + buttonBoundingClientRect.height;
            params.placement = options.placement;

            break;
        case 'bottom-start':
            params.x = reference.offsetLeft;
            params.y = reference.offsetTop + buttonBoundingClientRect.height;
            params.placement = options.placement;

            break;
        case 'bottom-end':
            params.x = reference.offsetLeft - tooltipBoundingClientRect.width + buttonBoundingClientRect.width;
            params.y = reference.offsetTop + buttonBoundingClientRect.height;
            params.placement = options.placement;

            break;
        case 'left':
            params.x = reference.offsetLeft - tooltipBoundingClientRect.width;
            params.y = reference.offsetTop + buttonBoundingClientRect.height / 2 - tooltipBoundingClientRect.height / 2;
            params.placement = options.placement;

            break;
        case 'left-start':
            params.x = reference.offsetLeft - tooltipBoundingClientRect.width;
            params.y = reference.offsetTop;
            params.placement = options.placement;

            break;
        case 'left-end':
            params.x = reference.offsetLeft - tooltipBoundingClientRect.width;
            params.y = reference.offsetTop + buttonBoundingClientRect.height - tooltipBoundingClientRect.height;
            params.placement = options.placement;

            break;
        }

        const primaryX: number = params.x;
        const primaryY: number = params.y;
        const scrollDirection: string = getScrollDirection(reference);

        options.middleware?.map((x: MiddlewareType) => {
            const middleware: ParamsType = x.fn({
                x: params.x,
                y: params.y,
                options: options,
                primaryX: primaryX,
                primaryY: primaryY,
                floating: floating,
                placement: params.placement,
                reference: reference,
                scrollDirection: scrollDirection,
            });

            params.x = middleware.x;
            params.y = middleware.y;
        });

        resolve(params);
    });
};