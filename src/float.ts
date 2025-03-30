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

export interface PositionType {
    x: number,
    y: number,
    placement: PlacementType,
}

export interface ArrowPositionType extends PositionType {
    arrowX: number,
    arrowY: number,
}

export interface ParamsType {
    [key: string]: number | object | undefined | PlacementType;

    x: number,
    y: number,
    placement: PlacementType,
    middlewareData: {
        [key: string]: MiddlewareOutType;
    },
}

export interface MiddlewareParamType extends PositionType {
    options: OptionType,
    primaryX: number,
    primaryY: number,
    floating: HTMLElement,
    reference: HTMLElement,
    scrollDirection: string,
}

export interface MiddlewareOutType extends PositionType {
    arrowX?: number,
    arrowY?: number,
}

export interface MiddlewareType {
    fn: (params: MiddlewareParamType) => MiddlewareOutType,
    name: string,
    params: {
        [key: string]: number | never | HTMLElement;
    },
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
const toShiftTop = (y: number, element: HTMLElement) => {
    const parent: HTMLElement | null = getScrollParent(element);

    return y - (parent ? parent.scrollTop : 0);
};
const toShiftRight = (x: number, floating: HTMLElement) => {
    const parent: HTMLElement | null = getScrollParent(floating);

    return -(x + floating.clientWidth - (parent ? scrollRight(parent) : 0));
};
const toShiftBottom = (y: number, floating: HTMLElement) => {
    const parent: HTMLElement | null = getScrollParent(floating);

    return -(y + floating.clientHeight - (parent ? scrollBottom(parent) : 0));
};
const toShiftLeft = (x: number, element: HTMLElement) => {
    const parent: HTMLElement | null = getScrollParent(element);

    return x - (parent ? parent.scrollLeft : 0);
};
export const flipPosition = ({
    options,
    primaryX,
    primaryY,
    floating,
    placement,
    reference,
    scrollDirection,
}: MiddlewareParamType): false | MiddlewareOutType => {
    const position: PositionType = getPosition(reference, floating, placement);
    const offsetMiddleware: MiddlewareType | undefined = options.middleware?.find((m: MiddlewareType): boolean => m.name === 'offset');

    if (offsetMiddleware) {
        const offsetResult: MiddlewareOutType = offsetMiddleware.fn({
            x: position.x,
            y: position.y,
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
            placement: placement,
        } as ParamsType;
    }

    return false;
};
export const flip = (): MiddlewareType => ({
    name: 'flip',
    params: {},
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
    }: MiddlewareParamType): MiddlewareOutType => {
        const result: MiddlewareOutType = {
            x: x,
            y: y,
            placement: placement,
        };
        let placements: string[] = placementTypes.slice();
        let positionCalculated: boolean = false;
        const checkPlacement = (placementType: string): void => {
            if (!positionCalculated) {
                const flipPositioned: false | MiddlewareOutType = flipPosition({
                    x,
                    y,
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

    if (placement.startsWith('right')) {
        xValue = -value;
    } else if (placement.startsWith('left')) {
        xValue = value;
    }

    const arrowMiddleware: MiddlewareType | undefined = options.middleware?.find((m: MiddlewareType): boolean => m.name === 'arrow');

    if (arrowMiddleware) {
        const arrowElement: HTMLElement = arrowMiddleware.params.arrow as HTMLElement;

        if (placement.startsWith('right')) {
            xValue -= arrowElement.getBoundingClientRect().width / 2;
        } else if (placement.startsWith('left')) {
            xValue += arrowElement.getBoundingClientRect().width / 2;
        }
    }

    if (options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift')) {
        let arrowDifferenceWidth: number = 0;

        if (arrowMiddleware) {
            const arrowElement: HTMLElement = arrowMiddleware.params.arrow as HTMLElement;

            arrowDifferenceWidth = arrowElement.getBoundingClientRect().width / 2;
            arrowDifferenceWidth += getArrowDifferenceWidth(arrowElement);
            arrowDifferenceWidth -= value;
        }

        if (placement.startsWith('right')) {
            if (toShiftRight(primaryX - xValue, floating) <= value) {
                if (toShiftRight(primaryX, floating) > 0) {
                    xValue = value - toShiftRight(primaryX, floating);
                } else {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating) <= value) {
                if (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating) >= 0) {
                    xValue = -value - (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating) + value);
                } else {
                    xValue = -value;
                }
            }
        } else if (placement.startsWith('left')) {
            if (toShiftRight(primaryX - xValue + arrowDifferenceWidth, floating) <= value) {
                xValue = value + toShiftRight(primaryX - arrowDifferenceWidth, floating);

                if (xValue <= value) {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue, floating) <= value) {
                xValue = -value + toShiftLeft(primaryX, floating);

                if (xValue <= -value) {
                    xValue = -value;
                }
            }
        } else {
            if (toShiftRight(primaryX - xValue, floating) <= value) {
                if (toShiftRight(primaryX - xValue, floating) <= value && toShiftRight(primaryX, floating) > 0) {
                    xValue = value - toShiftRight(primaryX, floating);
                } else {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue, floating) <= value) {
                if (toShiftLeft(primaryX - xValue, floating) <= value && toShiftLeft(primaryX, floating) > 0) {
                    xValue = -(value - toShiftLeft(primaryX, floating));
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

    const arrowMiddleware: MiddlewareType | undefined = options.middleware?.find((m: MiddlewareType): boolean => m.name === 'arrow');

    if (arrowMiddleware) {
        const arrowElement: HTMLElement = arrowMiddleware.params.arrow as HTMLElement;

        if (placement.startsWith('top')) {
            yValue += arrowElement.getBoundingClientRect().height / 2;
        } else if (placement.startsWith('bottom')) {
            yValue -= arrowElement.getBoundingClientRect().height / 2;
        }
    }

    if (options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift')) {
        let arrowDifferenceHeight: number = 0;

        if (arrowMiddleware) {
            const arrowElement: HTMLElement = arrowMiddleware.params.arrow as HTMLElement;

            arrowDifferenceHeight = arrowElement.getBoundingClientRect().height / 2;
            arrowDifferenceHeight += getArrowDifferenceHeight(arrowElement);
            arrowDifferenceHeight -= value;
        }

        if (placement.startsWith('top')) {
            if (toShiftTop(primaryY - yValue, floating) <= value) {
                if (toShiftTop(primaryY, floating) >= 0) {
                    yValue = -(value - toShiftTop(primaryY, floating));
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue + arrowDifferenceHeight, floating) <= value) {
                yValue = value + toShiftBottom(primaryY - arrowDifferenceHeight, floating);

                if (yValue <= value) {
                    yValue = value;
                }
            }
        } else if (placement.startsWith('bottom')) {
            if (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating) <= value) {
                if (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating) >= 0) {
                    yValue = -value - (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating) + value);
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue, floating) <= value) {
                if (toShiftBottom(primaryY, floating) >= 0) {
                    yValue = value - toShiftBottom(primaryY, floating);
                } else {
                    yValue = value;
                }
            }
        } else {
            if (toShiftTop(primaryY - yValue, floating) <= value) {
                if (toShiftTop(primaryY - yValue, floating) >= 0) {
                    yValue = -(value - toShiftTop(primaryY - yValue, floating));
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue, floating) <= value) {
                if (toShiftBottom(primaryY - yValue, floating) >= 0) {
                    yValue = value - toShiftBottom(primaryY - yValue, floating);
                } else {
                    yValue = value;
                }
            }
        }
    }

    return yValue;
};
export const offset = (value: number): MiddlewareType => ({
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
export const shift = (): MiddlewareType => ({
    name: 'shift',
    params: {},
    fn: ({
        x,
        y,
        floating,
        placement,
    }: MiddlewareParamType): MiddlewareOutType => {
        const parent: HTMLElement | null = getScrollParent(floating);
        const result: MiddlewareOutType = {
            x: x,
            y: y,
            placement: placement,
        };

        if (parent !== null) {
            if (toShiftTop(result.y, floating) <= 0) {
                result.y = parent.scrollTop;
            } else if (toShiftBottom(result.y, floating) <= 0) {
                result.y = scrollBottom(parent) - floating.clientHeight;
            }

            if (toShiftRight(result.x, floating) <= 0) {
                result.x = scrollRight(parent) - floating.clientWidth;
            } else if (toShiftLeft(result.x, floating) <= 0) {
                result.x = parent.scrollLeft;
            }
        }

        return result;
    },
});
export const getArrowDifferenceWidth = (arrow: HTMLElement): number => {
    if (arrow.getBoundingClientRect().width !== arrow.clientWidth) {
        return (arrow.getBoundingClientRect().width - arrow.clientWidth) / 2;
    } else {
        return 0;
    }
};
export const getArrowDifferenceHeight = (arrow: HTMLElement): number => {
    if (arrow.getBoundingClientRect().height !== arrow.clientHeight) {
        return (arrow.getBoundingClientRect().height - arrow.clientHeight) / 2;
    } else {
        return 0;
    }
};
const getArrowPositionX = (x: number, arrow: HTMLElement, arrowX: number, floating: HTMLElement) => {
    if (x + getArrowDifferenceWidth(arrow) >= arrowX) {
        return x + getArrowDifferenceWidth(arrow);
    } else if (x + floating.getBoundingClientRect().width + getArrowDifferenceWidth(arrow) - arrow.getBoundingClientRect().width <= arrowX) {
        return x + getArrowDifferenceWidth(arrow) + floating.getBoundingClientRect().width - arrow.getBoundingClientRect().width;
    }
};
const getArrowPositionY = (y: number, arrow: HTMLElement, arrowY: number, floating: HTMLElement) => {
    if (y + getArrowDifferenceHeight(arrow) >= arrowY) {
        return y + getArrowDifferenceHeight(arrow);
    } else if (y + floating.getBoundingClientRect().height + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height <= arrowY) {
        return y + floating.getBoundingClientRect().height + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height;
    }
};
export const getTopArrowPosition = (
    x: number,
    y: number,
    arrow: HTMLElement,
    floating: HTMLElement,
    reference: HTMLElement,
): ArrowPositionType => {
    let arrowX: number = reference.offsetLeft + getArrowDifferenceWidth(arrow) + reference.getBoundingClientRect().width / 2 - arrow.getBoundingClientRect().width / 2;
    const arrowY: number = y + getArrowDifferenceHeight(arrow) + floating.getBoundingClientRect().height - arrow.getBoundingClientRect().height / 2;

    arrowX = getArrowPositionX(x, arrow, arrowX, floating) || arrowX;

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
    reference: HTMLElement,
): ArrowPositionType => {
    const arrowX: number = x + getArrowDifferenceWidth(arrow) - arrow.getBoundingClientRect().width / 2;
    let arrowY: number = reference.offsetTop + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height / 2 + reference.getBoundingClientRect().height / 2;

    const arrowPositionY: number | undefined = getArrowPositionY(y, arrow, arrowY, floating);

    if (arrowPositionY) {
        arrowY = arrowPositionY;
    }

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
    reference: HTMLElement,
): ArrowPositionType => {
    let arrowX: number = reference.offsetLeft + getArrowDifferenceWidth(arrow) + reference.getBoundingClientRect().width / 2 - arrow.getBoundingClientRect().width / 2;
    const arrowY: number = y + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height / 2;

    arrowX = getArrowPositionX(x, arrow, arrowX, floating) || arrowX;

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
    reference: HTMLElement,
): ArrowPositionType => {
    const arrowX: number = x + floating.getBoundingClientRect().width + getArrowDifferenceWidth(arrow) - arrow.getBoundingClientRect().width / 2;
    let arrowY: number = reference.offsetTop + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height / 2 + reference.getBoundingClientRect().height / 2;

    arrowY = getArrowPositionY(y, arrow, arrowY, floating) || arrowY;

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
    reference: HTMLElement,
    placement: PlacementType,
): ArrowPositionType => {
    switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
        return getTopArrowPosition(x, y, arrow, floating, reference);
    case 'right':
    case 'right-start':
    case 'right-end':
        return getRightArrowPosition(x, y, arrow, floating, reference);
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
        return getBottomArrowPosition(x, y, arrow, floating, reference);
    case 'left':
    case 'left-start':
    case 'left-end':
        return getLeftArrowPosition(x, y, arrow, floating, reference);
    default:
        return {
            x: 0,
            y: 0,
            arrowX: 0,
            arrowY: 0,
            placement: '',
        };
    }
};
export const arrow = (arrow: HTMLElement): MiddlewareType => ({
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

        if (!options.middleware?.find((m: MiddlewareType): boolean => m.name === 'offset')) {
            result.x = x - getOffsetX(getArrowDifferenceWidth(arrow), options, primaryX, placement, floating);
            result.y = y - getOffsetY(getArrowDifferenceHeight(arrow), options, primaryY, placement, floating);
        }

        const arrowPosition: ArrowPositionType = getArrowPosition(result.x, result.y, arrow, floating, reference, placement);

        if (options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift')) {
            const offsetMiddleware: MiddlewareType | undefined = options.middleware?.find((m: MiddlewareType): boolean => m.name === 'offset');
            const offsetValue: number = (offsetMiddleware ? offsetMiddleware.params.value : 0) as number;

            if (arrowPosition.placement.startsWith('top')) {
                if (
                    result.x + getArrowDifferenceWidth(arrow) >= arrowPosition.arrowX ||
                    result.x + getArrowDifferenceWidth(arrow) + floating.getBoundingClientRect().width - arrow.getBoundingClientRect().width <= arrowPosition.arrowX ||
                    result.y + floating.getBoundingClientRect().height + arrow.getBoundingClientRect().height / 2 >= getTopElementPosition(reference) ||
                    toShiftBottom(arrowPosition.arrowY + getArrowDifferenceHeight(arrow), arrow) <= 0
                ) {
                    arrowPosition.arrowY = arrowPosition.arrowY - arrow.getBoundingClientRect().height / 2;
                }
            } else if (arrowPosition.placement.startsWith('right')) {
                if (
                    result.y + getArrowDifferenceHeight(arrow) >= arrowPosition.arrowY ||
                    result.y + getArrowDifferenceHeight(arrow) + floating.getBoundingClientRect().height - arrow.getBoundingClientRect().height <= arrowPosition.arrowY ||
                    result.x - arrow.getBoundingClientRect().width / 2 <= getRightElementPosition(reference) ||
                    toShiftLeft(arrowPosition.arrowX - getArrowDifferenceWidth(arrow) - offsetValue, arrow) <= 0
                ) {
                    arrowPosition.arrowX = arrowPosition.arrowX + arrow.getBoundingClientRect().width / 2;
                }
            } else if (arrowPosition.placement.startsWith('bottom')) {
                if (
                    result.x + getArrowDifferenceWidth(arrow) >= arrowPosition.arrowX ||
                    result.x + getArrowDifferenceWidth(arrow) + floating.getBoundingClientRect().width - arrow.getBoundingClientRect().width <= arrowPosition.arrowX ||
                    result.y - arrow.getBoundingClientRect().height / 2 <= getBottomElementPosition(reference) ||
                    toShiftTop(arrowPosition.arrowY - getArrowDifferenceHeight(arrow), arrow) <= 0
                ) {
                    arrowPosition.arrowY = arrowPosition.arrowY + arrow.getBoundingClientRect().height / 2;
                }
            } else if (arrowPosition.placement.startsWith('left')) {
                if (
                    result.y + getArrowDifferenceHeight(arrow) >= arrowPosition.arrowY ||
                    result.y + getArrowDifferenceHeight(arrow) + floating.getBoundingClientRect().height - arrow.getBoundingClientRect().height <= arrowPosition.arrowY ||
                    result.x + floating.getBoundingClientRect().width + arrow.getBoundingClientRect().width / 2 >= getLeftElementPosition(reference) ||
                    toShiftRight(arrowPosition.arrowX + getArrowDifferenceWidth(arrow) + offsetValue, arrow) <= 0
                ) {
                    arrowPosition.arrowX = arrowPosition.arrowX - arrow.getBoundingClientRect().width / 2;
                }
            }
        }

        result.arrowX = arrowPosition.arrowX;
        result.arrowY = arrowPosition.arrowY;

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
export const getTopPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width / 2 + reference.getBoundingClientRect().width / 2,
        y: reference.offsetTop - floating.getBoundingClientRect().height,
        placement: 'top',
    };
};
export const getTopStartPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft,
        y: reference.offsetTop - floating.getBoundingClientRect().height,
        placement: 'top-start',
    };
};
export const getTopEndPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width + reference.getBoundingClientRect().width,
        y: reference.offsetTop - floating.getBoundingClientRect().height,
        placement: 'top-end',
    };
};
export const getRightPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft + reference.getBoundingClientRect().width,
        y: reference.offsetTop - floating.getBoundingClientRect().height / 2 + reference.getBoundingClientRect().height / 2,
        placement: 'right',
    };
};
export const getRightStartPosition = (reference: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft + reference.getBoundingClientRect().width,
        y: reference.offsetTop,
        placement: 'right-start',
    };
};
export const getRightEndPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft + reference.getBoundingClientRect().width,
        y: reference.offsetTop + reference.getBoundingClientRect().height - floating.getBoundingClientRect().height,
        placement: 'right-end',
    };
};
export const getBottomPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft + reference.getBoundingClientRect().width / 2 - floating.getBoundingClientRect().width / 2,
        y: reference.offsetTop + reference.getBoundingClientRect().height,
        placement: 'bottom',
    };
};
export const getBottomStartPosition = (reference: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft,
        y: reference.offsetTop + reference.getBoundingClientRect().height,
        placement: 'bottom-start',
    };
};
export const getBottomEndPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width + reference.getBoundingClientRect().width,
        y: reference.offsetTop + reference.getBoundingClientRect().height,
        placement: 'bottom-end',
    };
};
export const getLeftPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width,
        y: reference.offsetTop + reference.getBoundingClientRect().height / 2 - floating.getBoundingClientRect().height / 2,
        placement: 'left',
    };
};
export const getLeftStartPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width,
        y: reference.offsetTop,
        placement: 'left-start',
    };
};
export const getLeftEndPosition = (reference: HTMLElement, floating: HTMLElement): PositionType => {
    return {
        x: reference.offsetLeft - floating.getBoundingClientRect().width,
        y: reference.offsetTop + reference.getBoundingClientRect().height - floating.getBoundingClientRect().height,
        placement: 'left-end',
    };
};
export const getTopElementPosition = (element: HTMLElement) => element.offsetTop;
export const getRightElementPosition = (element: HTMLElement) => element.offsetLeft + element.getBoundingClientRect().width;
export const getBottomElementPosition = (element: HTMLElement) => element.offsetTop + element.getBoundingClientRect().height;
export const getLeftElementPosition = (element: HTMLElement) => element.offsetLeft;
export const getPosition = (reference: HTMLElement, floating: HTMLElement, placement: string): PositionType => {
    switch (placement) {
    case 'top':
        return getTopPosition(reference, floating);
    case 'top-start':
        return getTopStartPosition(reference, floating);
    case 'top-end':
        return getTopEndPosition(reference, floating);
    case 'right':
        return getRightPosition(reference, floating);
    case 'right-start':
        return getRightStartPosition(reference);
    case 'right-end':
        return getRightEndPosition(reference, floating);
    case 'bottom':
        return getBottomPosition(reference, floating);
    case 'bottom-start':
        return getBottomStartPosition(reference);
    case 'bottom-end':
        return getBottomEndPosition(reference, floating);
    case 'left':
        return getLeftPosition(reference, floating);
    case 'left-start':
        return getLeftStartPosition(reference, floating);
    case 'left-end':
        return getLeftEndPosition(reference, floating);
    default:
        return {
            x: 0,
            y: 0,
            placement: '',
        };
    }
};
export const isVisiblePosition = (
    position: PositionType,
    floating: HTMLElement,
    reference: HTMLElement,
): boolean => {
    const parent: null | HTMLElement = getScrollParent(reference);

    if (parent !== null) {
        return toShiftTop(position.y, floating) > 0 &&
            toShiftRight(position.x, floating) > 0 &&
            toShiftBottom(position.y, floating) > 0 &&
            toShiftLeft(position.x, floating) > 0;
    }

    return false;
};
export const computePosition = (reference: HTMLElement, floating: HTMLElement, options: OptionType = {}): Promise<ParamsType> => {
    return new Promise((resolve): void => {
        const placement: string = options.placement ? options.placement : 'bottom';
        const params: ParamsType = {
            x: 0,
            y: 0,
            placement: placement,
            middlewareData: {},
        };
        const position: PositionType = getPosition(reference, floating, placement);

        params.x = position.x;
        params.y = position.y;
        params.placement = position.placement;

        const primaryX: number = params.x;
        const primaryY: number = params.y;
        const scrollDirection: string = getScrollDirection(reference);

        options.middleware?.map((x: MiddlewareType) => {
            const middleware: MiddlewareOutType = x.fn({
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

            if (x.name === 'arrow') {
                middleware.x = middleware.arrowX!;
                middleware.y = middleware.arrowY!;

                delete middleware.arrowX;
                delete middleware.arrowY;
            }

            params.middlewareData[x.name] = middleware;
        });

        resolve(params);
    });
};