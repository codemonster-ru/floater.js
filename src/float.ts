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
    offset: number,
    placement: PlacementType,
}

export interface MiddlewareParamType extends ParamsType {
    offset: number,
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
        offset,
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
    return -(x + floating.clientWidth - scrollRight(parent));
};
const toShiftBottom = (y: number, floating: HTMLElement, parent: HTMLElement) => {
    return -(y + floating.clientHeight - scrollBottom(parent));
};
const toShiftLeft = (x: number, parent: HTMLElement) => {
    return x - parent.scrollLeft;
};

export const flipPosition = ({
    offset,
    options,
    primaryX,
    primaryY,
    floating,
    placement,
    reference,
    scrollDirection,
}: MiddlewareParamType): false | ParamsType => {
    const position: ParamsType = getPosition(offset, reference, floating, placement);
    const offsetMiddleware: MiddlewareType | undefined = options.middleware?.find((m: MiddlewareType): boolean => m.name === 'offset');

    if (offsetMiddleware) {
        const offsetResult: MiddlewareParamType = offsetMiddleware.fn({
            x: position.x,
            y: position.y,
            offset: offset,
            options: options,
            primaryX: primaryX,
            primaryY: primaryY,
            floating: floating,
            placement: placement,
            reference: reference,
            scrollDirection: scrollDirection,
        });

        position.x = offsetResult.x;
        position.y = offsetResult.y;
    }

    if (isVisiblePosition(position, floating, reference)) {
        return {
            x: position.x,
            y: position.y,
            offset: offset,
            placement: placement,
        } as ParamsType;
    }

    return false;
};

export const flip = (): MiddlewareType => ({
    name: 'flip',
    fn: ({
        x,
        y,
        offset,
        options,
        primaryX,
        primaryY,
        floating,
        placement,
        reference,
        scrollDirection,
    }: MiddlewareParamType): MiddlewareParamType => {
        const result: MiddlewareParamType = {
            x: x,
            y: y,
            offset: offset,
            options: options,
            primaryX: primaryX,
            primaryY: primaryY,
            floating: floating,
            placement: placement,
            reference: reference,
            scrollDirection: scrollDirection,
        };
        let placements: string[] = placementTypes.slice();
        let positionCalculated: boolean = false;
        const checkPlacement = (placementType: string): void => {
            if (!positionCalculated) {
                const flipPositioned: false | ParamsType = flipPosition({
                    x,
                    y,
                    offset,
                    options,
                    primaryX,
                    primaryY,
                    floating,
                    placement: placementType,
                    reference,
                    scrollDirection,
                });

                if (flipPositioned) {
                    result.x = flipPositioned.x;
                    result.y = flipPositioned.y;
                    result.offset = flipPositioned.offset;
                    result.placement = flipPositioned.placement;

                    positionCalculated = true;
                }
            }
        };

        placements.splice(placements.indexOf(placement), placements.length - 1).map(checkPlacement);

        if (!positionCalculated) {
            placements = placementTypes.slice();

            placements.splice(0, placements.indexOf(placement)).map(checkPlacement);
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
    const parent: HTMLElement | null = getScrollParent(floating);

    if (placement.startsWith('right')) {
        xValue = -value;
    } else if (placement.startsWith('left')) {
        xValue = value;
    }

    if (options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift') && parent !== null) {
        if (toShiftRight(primaryX - xValue, floating, parent) <= value) {
            if (toShiftRight(primaryX - xValue, floating, parent) <= value && toShiftRight(primaryX, floating, parent) > 0) {
                xValue = value - toShiftRight(primaryX, floating, parent);
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
    const parent: HTMLElement | null = getScrollParent(floating);

    if (placement.startsWith('top')) {
        yValue = value;
    } else if (placement.startsWith('bottom')) {
        yValue = -value;
    }

    if (options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift') && parent !== null) {
        if (toShiftTop(primaryY - yValue, parent) <= value) {
            if (toShiftTop(primaryY - yValue, parent) <= value && toShiftTop(primaryY, parent) > 0) {
                yValue = -(value - toShiftTop(primaryY, parent));
            } else {
                yValue = -value;
            }
        } else if (toShiftBottom(primaryY - yValue, floating, parent) <= value) {
            if (toShiftBottom(primaryY - yValue, floating, parent) <= value && toShiftBottom(primaryY, floating, parent) > 0) {
                yValue = value - toShiftBottom(primaryY, floating, parent);
            } else {
                yValue = value;
            }
        }
    }

    return yValue;
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
        return {
            x: x - getOffsetX(value, options, primaryX, placement, floating),
            y: y - getOffsetY(value, options, primaryY, placement, floating),
            offset: value,
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
        offset,
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
            offset: offset,
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
            } else if (toShiftBottom(result.y, floating, parent) < 0) {
                result.y = scrollBottom(parent) - floating.clientHeight;
            }

            if (toShiftRight(result.x, floating, parent) < 0) {
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

export const getTopPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width / 2 + reference.getBoundingClientRect().width / 2,
        y: reference.offsetTop - floating.getBoundingClientRect().height,
        offset: offset,
        placement: 'top',
    };
};

export const getTopStartPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft,
        y: reference.offsetTop - floating.getBoundingClientRect().height,
        offset: offset,
        placement: 'top-start',
    };
};

export const getTopEndPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width + reference.getBoundingClientRect().width,
        y: reference.offsetTop - floating.getBoundingClientRect().height,
        offset: offset,
        placement: 'top-end',
    };
};

export const getRightPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft + reference.getBoundingClientRect().width,
        y: reference.offsetTop - floating.getBoundingClientRect().height / 2 + reference.getBoundingClientRect().height / 2,
        offset: offset,
        placement: 'right',
    };
};

export const getRightStartPosition = (offset: number, reference: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft + reference.getBoundingClientRect().width,
        y: reference.offsetTop,
        offset: offset,
        placement: 'right-start',
    };
};

export const getRightEndPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft + reference.getBoundingClientRect().width,
        y: reference.offsetTop + reference.getBoundingClientRect().height - floating.getBoundingClientRect().height,
        offset: offset,
        placement: 'right-end',
    };
};

export const getBottomPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft + reference.getBoundingClientRect().width / 2 - floating.getBoundingClientRect().width / 2,
        y: reference.offsetTop + reference.getBoundingClientRect().height,
        offset: offset,
        placement: 'bottom',
    };
};

export const getBottomStartPosition = (offset: number, reference: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft,
        y: reference.offsetTop + reference.getBoundingClientRect().height,
        offset: offset,
        placement: 'bottom-start',
    };
};

export const getBottomEndPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width + reference.getBoundingClientRect().width,
        y: reference.offsetTop + reference.getBoundingClientRect().height,
        offset: offset,
        placement: 'bottom-end',
    };
};

export const getLeftPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width,
        y: reference.offsetTop + reference.getBoundingClientRect().height / 2 - floating.getBoundingClientRect().height / 2,
        offset: offset,
        placement: 'left',
    };
};

export const getLeftStartPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width,
        y: reference.offsetTop,
        offset: offset,
        placement: 'left-start',
    };
};

export const getLeftEndPosition = (offset: number, reference: HTMLElement, floating: HTMLElement): ParamsType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width,
        y: reference.offsetTop + reference.getBoundingClientRect().height - floating.getBoundingClientRect().height,
        offset: offset,
        placement: 'left-end',
    };
};

export const getPosition = (offset: number, reference: HTMLElement, floating: HTMLElement, placement: string): ParamsType => {
    switch (placement) {
    case 'top':
        return getTopPosition(offset, reference, floating);
    case 'top-start':
        return getTopStartPosition(offset, reference, floating);
    case 'top-end':
        return getTopEndPosition(offset, reference, floating);
    case 'right':
        return getRightPosition(offset, reference, floating);
    case 'right-start':
        return getRightStartPosition(offset, reference);
    case 'right-end':
        return getRightEndPosition(offset, reference, floating);
    case 'bottom':
        return getBottomPosition(offset, reference, floating);
    case 'bottom-start':
        return getBottomStartPosition(offset, reference);
    case 'bottom-end':
        return getBottomEndPosition(offset, reference, floating);
    case 'left':
        return getLeftPosition(offset, reference, floating);
    case 'left-start':
        return getLeftStartPosition(offset, reference, floating);
    case 'left-end':
        return getLeftEndPosition(offset, reference, floating);
    default:
        return {
            x: 0,
            y: 0,
            offset: offset,
            placement: '',
        };
    }
};

export const isVisiblePosition = (
    position: ParamsType,
    floating: HTMLElement,
    reference: HTMLElement,
): boolean => {
    const parent: null | HTMLElement = getScrollParent(reference);

    if (parent !== null) {
        return toShiftTop(position.y, parent) > 0 &&
            toShiftRight(position.x, floating, parent) > 0 &&
            toShiftBottom(position.y, floating, parent) > 0 &&
            toShiftLeft(position.x, parent) > 0;
    }

    return false;
};

export const computePosition = (reference: HTMLElement, floating: HTMLElement, options: OptionType = {}): Promise<ParamsType> => {
    return new Promise((resolve): void => {
        let offset: number = 0;
        const placement: string = options.placement ? options.placement : 'bottom';
        const params: ParamsType = getPosition(0, reference, floating, placement);
        const primaryX: number = params.x;
        const primaryY: number = params.y;
        const scrollDirection: string = getScrollDirection(reference);

        options.middleware?.map((x: MiddlewareType) => {
            const middleware: ParamsType = x.fn({
                x: params.x,
                y: params.y,
                offset: offset,
                options: options,
                primaryX: primaryX,
                primaryY: primaryY,
                floating: floating,
                placement: params.placement,
                reference: reference,
                scrollDirection: scrollDirection,
            });

            offset = middleware.offset;
            params.x = middleware.x;
            params.y = middleware.y;
        });

        resolve(params);
    });
};