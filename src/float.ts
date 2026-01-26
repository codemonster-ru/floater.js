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
    reference: HTMLElement | VirtualElement,
    scrollDirection: string,
}

export interface MiddlewareOutType extends PositionType {
    arrowX?: number,
    arrowY?: number,
    baseX?: number,
    baseY?: number,
}

export interface MiddlewareType {
    fn: (params: MiddlewareParamType) => MiddlewareOutType,
    name: string,
    params: {
        [key: string]: number | never | undefined | HTMLElement;
    } | undefined,
}

export interface VirtualRect {
    [key: string]: number;

    x: number,
    y: number,
    width: number,
    height: number,
    top: number,
    right: number,
    bottom: number,
    left: number,
}

export interface VirtualElement {
    offsetTop: number,
    offsetLeft: number,

    getBoundingClientRect(): VirtualRect,
}

const getScrollParent = (node: HTMLElement | VirtualElement): HTMLElement | null => {
    if (node === null || node === undefined || !(node instanceof HTMLElement)) {
        return null;
    }

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
    } else {
        return getScrollParent(node.parentNode as HTMLElement);
    }
};
const getElementOffsets = (
    element: HTMLElement | VirtualElement,
    floating?: HTMLElement,
): { left: number, top: number, width: number, height: number } => {
    const rect = element.getBoundingClientRect();
    const parent = floating ? (floating.offsetParent as HTMLElement | null) : null;

    if (parent) {
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
const getScrollDirection = (reference: HTMLElement | VirtualElement) => {
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
const getScrollRight = (parent: HTMLElement) => {
    return parent.scrollLeft + parent.clientWidth;
};
const getScrollBottom = (parent: HTMLElement) => {
    return parent.scrollTop + parent.clientHeight;
};
const toShiftTop = (y: number, element: HTMLElement, parent: HTMLElement | null = null) => {
    let scrollTop: number = 0;

    if (parent === null) {
        const parent: HTMLElement | null = getScrollParent(element);

        scrollTop = (parent ? parent.scrollTop : 0);
    }

    return y - scrollTop;
};
const toShiftRight = (x: number, floating: HTMLElement, parent: HTMLElement | null = null) => {
    let scrollRight: number;

    if (parent === null) {
        const parent: HTMLElement | null = getScrollParent(floating);

        scrollRight = (parent ? getScrollRight(parent) : 0);
    } else {
        scrollRight = parent.getBoundingClientRect().width;
    }

    return -(x + floating.clientWidth - scrollRight);
};
const toShiftBottom = (y: number, floating: HTMLElement, parent: HTMLElement | null = null) => {
    let scrollBottom: number;

    if (parent === null) {
        const parent: HTMLElement | null = getScrollParent(floating);

        scrollBottom = (parent ? getScrollBottom(parent) : 0);
    } else {
        scrollBottom = parent.getBoundingClientRect().height;
    }

    return -(y + floating.clientHeight - scrollBottom);
};
const toShiftLeft = (x: number, element: HTMLElement, parent: HTMLElement | null = null) => {
    let scrollLeft: number = 0;

    if (parent === null) {
        const parent: HTMLElement | null = getScrollParent(element);

        scrollLeft = (parent ? parent.scrollLeft : 0);
    }

    return x - scrollLeft;
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
    const shiftMiddleware: MiddlewareType | undefined = options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift');

    if (arrowMiddleware) {
        const arrowElement: HTMLElement = arrowMiddleware.params?.arrow as HTMLElement;

        if (placement.startsWith('right')) {
            xValue -= arrowElement.getBoundingClientRect().width / 2;
        } else if (placement.startsWith('left')) {
            xValue += arrowElement.getBoundingClientRect().width / 2;
        }
    }

    if (options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift') && arrowMiddleware) {
        let shiftParent: null | HTMLElement = null;
        let arrowDifferenceWidth: number = 0;

        if (shiftMiddleware) {
            shiftParent = shiftMiddleware.params?.parent as null | HTMLElement;
        }

        const arrowElement: HTMLElement = arrowMiddleware.params?.arrow as HTMLElement;

        arrowDifferenceWidth = arrowElement.getBoundingClientRect().width / 2;
        arrowDifferenceWidth += getArrowDifferenceWidth(arrowElement);
        arrowDifferenceWidth -= value;

        if (placement.startsWith('right')) {
            if (toShiftRight(primaryX - xValue, floating, shiftParent) <= value) {
                if (toShiftRight(primaryX, floating, shiftParent) > 0) {
                    xValue = value - toShiftRight(primaryX, floating, shiftParent);
                } else {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating, shiftParent) <= value) {
                if (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating, shiftParent) >= 0) {
                    xValue = -value - (toShiftLeft(primaryX - xValue - arrowDifferenceWidth, floating, shiftParent) + value);

                    if (shiftParent) {
                        xValue = -value;
                    }
                } else {
                    xValue = -value;
                }
            }
        } else if (placement.startsWith('left')) {
            if (toShiftRight(primaryX - xValue + arrowDifferenceWidth, floating, shiftParent) <= value) {
                xValue = value + toShiftRight(primaryX - arrowDifferenceWidth, floating, shiftParent);

                if (xValue <= value) {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue, floating, shiftParent) <= value) {
                xValue = -value + toShiftLeft(primaryX, floating, shiftParent);

                if (xValue <= -value) {
                    xValue = -value;
                }
            }
        } else {
            if (toShiftRight(primaryX - xValue, floating, shiftParent) <= value) {
                if (toShiftRight(primaryX - xValue, floating, shiftParent) <= value && toShiftRight(primaryX, floating, shiftParent) > 0) {
                    xValue = value - toShiftRight(primaryX, floating, shiftParent);
                } else {
                    xValue = value;
                }
            } else if (toShiftLeft(primaryX - xValue, floating, shiftParent) <= value) {
                if (toShiftLeft(primaryX - xValue, floating, shiftParent) <= value && toShiftLeft(primaryX, floating, shiftParent) > 0) {
                    xValue = -(value - toShiftLeft(primaryX, floating, shiftParent));
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
    const shiftMiddleware: MiddlewareType | undefined = options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift');

    if (arrowMiddleware) {
        const arrowElement: HTMLElement = arrowMiddleware.params?.arrow as HTMLElement;

        if (placement.startsWith('top')) {
            yValue += arrowElement.getBoundingClientRect().height / 2;
        } else if (placement.startsWith('bottom')) {
            yValue -= arrowElement.getBoundingClientRect().height / 2;
        }
    }

    if (options.middleware?.find((m: MiddlewareType): boolean => m.name === 'shift') && arrowMiddleware) {
        let shiftParent: null | HTMLElement = null;
        let arrowDifferenceHeight: number = 0;

        if (shiftMiddleware) {
            shiftParent = shiftMiddleware.params?.parent as null | HTMLElement;
        }

        const arrowElement: HTMLElement = arrowMiddleware.params?.arrow as HTMLElement;

        arrowDifferenceHeight = arrowElement.getBoundingClientRect().height / 2;
        arrowDifferenceHeight += getArrowDifferenceHeight(arrowElement);
        arrowDifferenceHeight -= value;

        if (placement.startsWith('top')) {
            if (toShiftTop(primaryY - yValue, floating, shiftParent) <= value) {
                if (toShiftTop(primaryY, floating, shiftParent) >= 0) {
                    yValue = -(value - toShiftTop(primaryY, floating, shiftParent));
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue + arrowDifferenceHeight, floating, shiftParent) <= value) {
                yValue = value + toShiftBottom(primaryY - arrowDifferenceHeight, floating, shiftParent);

                if (yValue <= value) {
                    yValue = value;
                }
            }
        } else if (placement.startsWith('bottom')) {
            if (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating, shiftParent) <= value) {
                if (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating, shiftParent) >= 0) {
                    yValue = -value - (toShiftTop(primaryY - yValue - arrowDifferenceHeight, floating, shiftParent) + value);

                    if (shiftParent) {
                        yValue = -value;
                    }
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue, floating, shiftParent) <= value) {
                if (toShiftBottom(primaryY, floating, shiftParent) >= 0) {
                    yValue = value - toShiftBottom(primaryY, floating, shiftParent);
                } else {
                    yValue = value;
                }
            }
        } else {
            if (toShiftTop(primaryY - yValue, floating, shiftParent) <= value) {
                if (toShiftTop(primaryY - yValue, floating, shiftParent) >= 0) {
                    yValue = -(value - toShiftTop(primaryY - yValue, floating, shiftParent));
                } else {
                    yValue = -value;
                }
            } else if (toShiftBottom(primaryY - yValue, floating, shiftParent) <= value) {
                if (toShiftBottom(primaryY - yValue, floating, shiftParent) >= 0) {
                    yValue = value - toShiftBottom(primaryY - yValue, floating, shiftParent);
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
export const shift = (params?: {
    parent?: HTMLElement
}): MiddlewareType => ({
    name: 'shift',
    params: params,
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
        const parent: HTMLElement | null = getScrollParent(floating);
        const result: MiddlewareOutType = {
            x: x,
            y: y,
            placement: placement,
        };
        const middleware = options.middleware || [];
        const shiftIndex = middleware.findIndex((m) => m.name === 'shift');
        const offsetIndex = middleware.findIndex((m) => m.name === 'offset');
        const applyOffsetLater = offsetIndex !== -1 && (shiftIndex === -1 || offsetIndex > shiftIndex);
        const offsetMiddleware: MiddlewareType | undefined = middleware.find((m) => m.name === 'offset');
        const offsetValue: number = (offsetMiddleware ? offsetMiddleware.params?.value : 0) as number;
        const offsetX = applyOffsetLater ? getOffsetX(offsetValue, options, primaryX, placement, floating) : 0;
        const offsetY = applyOffsetLater ? getOffsetY(offsetValue, options, primaryY, placement, floating) : 0;
        const adjustedX = x - offsetX;
        const adjustedY = y - offsetY;
        let workingX = adjustedX;
        let workingY = adjustedY;
        const padding = offsetMiddleware ? Math.abs(offsetValue) : 0;
        const marginX = padding;
        const marginY = padding;

        if (params?.parent === undefined && parent !== null) {
            const referenceOffsets = getElementOffsets(reference, floating);
            const referenceLeft = referenceOffsets.left;
            const referenceRight = referenceOffsets.left + referenceOffsets.width;
            const referenceTop = referenceOffsets.top;
            const referenceBottom = referenceOffsets.top + referenceOffsets.height;
            const minX = parent.scrollLeft + marginX;
            const maxXBase = getScrollRight(parent) - floating.clientWidth - marginX;
            const maxX = maxXBase < minX ? minX : maxXBase;
            const minY = parent.scrollTop + marginY;
            const maxYBase = getScrollBottom(parent) - floating.clientHeight - marginY;
            const maxY = maxYBase < minY ? minY : maxYBase;
            const viewLeft = parent.scrollLeft;
            const viewRight = getScrollRight(parent);
            const viewTop = parent.scrollTop;
            const viewBottom = getScrollBottom(parent);

            if (referenceRight <= viewLeft) {
                workingX = minX;
            } else if (referenceLeft >= viewRight) {
                workingX = maxX;
            }

            if (referenceBottom <= viewTop) {
                workingY = minY;
            } else if (referenceTop >= viewBottom) {
                workingY = maxY;
            }

            if (workingY < minY) {
                workingY = minY;
            } else if (workingY > maxY) {
                workingY = maxY;
            }

            if (workingX < minX) {
                workingX = minX;
            } else if (workingX > maxX) {
                workingX = maxX;
            }
        } else if (params?.parent) {
            const parentRect = params?.parent.getBoundingClientRect();
            const minX = marginX;
            const maxXBase = parentRect.width - floating.clientWidth - marginX;
            const maxX = maxXBase < minX ? minX : maxXBase;
            const minY = marginY;
            const maxYBase = parentRect.height - floating.clientHeight - marginY;
            const maxY = maxYBase < minY ? minY : maxYBase;

            if (workingY < minY) {
                workingY = minY;
            } else if (workingY > maxY) {
                workingY = maxY;
            }

            if (workingX < minX) {
                workingX = minX;
            } else if (workingX > maxX) {
                workingX = maxX;
            }
        }

        if (applyOffsetLater) {
            result.x = x + (workingX - adjustedX);
            result.y = y + (workingY - adjustedY);
        } else {
            result.x = workingX;
            result.y = workingY;
        }

        if (params?.parent === undefined && parent !== null) {
            const minXFinal = parent.scrollLeft + marginX;
            const maxXFinal = getScrollRight(parent) - floating.clientWidth - marginX;
            const minYFinal = parent.scrollTop + marginY;
            const maxYFinal = getScrollBottom(parent) - floating.clientHeight - marginY;
            const minX = applyOffsetLater ? minXFinal + offsetX : minXFinal;
            const maxX = applyOffsetLater ? maxXFinal + offsetX : maxXFinal;
            const minY = applyOffsetLater ? minYFinal + offsetY : minYFinal;
            const maxY = applyOffsetLater ? maxYFinal + offsetY : maxYFinal;

            if (result.x < minX) {
                result.x = minX;
            } else if (result.x > maxX) {
                result.x = maxX;
            }

            if (result.y < minY) {
                result.y = minY;
            } else if (result.y > maxY) {
                result.y = maxY;
            }
        } else if (params?.parent) {
            const parentRect = params?.parent.getBoundingClientRect();
            const minXFinal = marginX;
            const maxXFinal = parentRect.width - floating.clientWidth - marginX;
            const minYFinal = marginY;
            const maxYFinal = parentRect.height - floating.clientHeight - marginY;
            const minX = applyOffsetLater ? minXFinal + offsetX : minXFinal;
            const maxX = applyOffsetLater ? maxXFinal + offsetX : maxXFinal;
            const minY = applyOffsetLater ? minYFinal + offsetY : minYFinal;
            const maxY = applyOffsetLater ? maxYFinal + offsetY : maxYFinal;

            if (result.x < minX) {
                result.x = minX;
            } else if (result.x > maxX) {
                result.x = maxX;
            }

            if (result.y < minY) {
                result.y = minY;
            } else if (result.y > maxY) {
                result.y = maxY;
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
const getArrowPositionX = (x: number, arrow: HTMLElement, arrowX: number, floating: HTMLElement): number => {
    const minX = x + getArrowDifferenceWidth(arrow);
    const maxX = x + floating.getBoundingClientRect().width + getArrowDifferenceWidth(arrow) - arrow.getBoundingClientRect().width;

    if (arrowX < minX) {
        return minX;
    }
    if (arrowX > maxX) {
        return maxX;
    }

    return arrowX;
};
const getArrowPositionY = (y: number, arrow: HTMLElement, arrowY: number, floating: HTMLElement): number => {
    const minY = y + getArrowDifferenceHeight(arrow);
    const maxY = y + floating.getBoundingClientRect().height + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height;

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
): ArrowPositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);
    let arrowX: number = referenceOffsets.left + getArrowDifferenceWidth(arrow) + referenceOffsets.width / 2 - arrow.getBoundingClientRect().width / 2;
    const arrowY: number = y + getArrowDifferenceHeight(arrow) + floating.getBoundingClientRect().height - arrow.getBoundingClientRect().height / 2;

    arrowX = getArrowPositionX(x, arrow, arrowX, floating);

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
): ArrowPositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);
    const arrowX: number = x + getArrowDifferenceWidth(arrow) - arrow.getBoundingClientRect().width / 2;
    let arrowY: number = referenceOffsets.top + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height / 2 + referenceOffsets.height / 2;

    arrowY = getArrowPositionY(y, arrow, arrowY, floating);

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
): ArrowPositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);
    let arrowX: number = referenceOffsets.left + getArrowDifferenceWidth(arrow) + referenceOffsets.width / 2 - arrow.getBoundingClientRect().width / 2;
    const arrowY: number = y + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height / 2;

    arrowX = getArrowPositionX(x, arrow, arrowX, floating);

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
): ArrowPositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);
    const arrowX: number = x + floating.getBoundingClientRect().width + getArrowDifferenceWidth(arrow) - arrow.getBoundingClientRect().width / 2;
    let arrowY: number = referenceOffsets.top + getArrowDifferenceHeight(arrow) - arrow.getBoundingClientRect().height / 2 + referenceOffsets.height / 2;

    arrowY = getArrowPositionY(y, arrow, arrowY, floating);

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
            const offsetValue: number = (offsetMiddleware ? offsetMiddleware.params?.value : 0) as number;

            if (arrowPosition.placement.startsWith('top')) {
                if (
                    result.x + getArrowDifferenceWidth(arrow) >= arrowPosition.arrowX ||
                    result.x + getArrowDifferenceWidth(arrow) + floating.getBoundingClientRect().width - arrow.getBoundingClientRect().width <= arrowPosition.arrowX ||
                    result.y + floating.getBoundingClientRect().height + arrow.getBoundingClientRect().height / 2 >= getTopElementPosition(reference, floating) ||
                    toShiftBottom(arrowPosition.arrowY + getArrowDifferenceHeight(arrow), arrow) <= 0
                ) {
                    arrowPosition.arrowY = arrowPosition.arrowY - arrow.getBoundingClientRect().height / 2;
                }
            } else if (arrowPosition.placement.startsWith('right')) {
                if (
                    result.y + getArrowDifferenceHeight(arrow) >= arrowPosition.arrowY ||
                    result.y + getArrowDifferenceHeight(arrow) + floating.getBoundingClientRect().height - arrow.getBoundingClientRect().height <= arrowPosition.arrowY ||
                    result.x - arrow.getBoundingClientRect().width / 2 <= getRightElementPosition(reference, floating) ||
                    toShiftLeft(arrowPosition.arrowX - getArrowDifferenceWidth(arrow) - offsetValue, arrow) <= 0
                ) {
                    arrowPosition.arrowX = arrowPosition.arrowX + arrow.getBoundingClientRect().width / 2;
                }
            } else if (arrowPosition.placement.startsWith('bottom')) {
                if (
                    result.x + getArrowDifferenceWidth(arrow) >= arrowPosition.arrowX ||
                    result.x + getArrowDifferenceWidth(arrow) + floating.getBoundingClientRect().width - arrow.getBoundingClientRect().width <= arrowPosition.arrowX ||
                    result.y - arrow.getBoundingClientRect().height / 2 <= getBottomElementPosition(reference, floating) ||
                    toShiftTop(arrowPosition.arrowY - getArrowDifferenceHeight(arrow), arrow) <= 0
                ) {
                    arrowPosition.arrowY = arrowPosition.arrowY + arrow.getBoundingClientRect().height / 2;
                }
            } else if (arrowPosition.placement.startsWith('left')) {
                if (
                    result.y + getArrowDifferenceHeight(arrow) >= arrowPosition.arrowY ||
                    result.y + getArrowDifferenceHeight(arrow) + floating.getBoundingClientRect().height - arrow.getBoundingClientRect().height <= arrowPosition.arrowY ||
                    result.x + floating.getBoundingClientRect().width + arrow.getBoundingClientRect().width / 2 >= getLeftElementPosition(reference, floating) ||
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
export const autoUpdate = (reference: HTMLElement | VirtualElement, callback: () => void): () => void => {
    const parent: HTMLElement | null = getScrollParent(reference);
    const cleanup: Array<() => void> = [];

    if (parent !== null) {
        const onScroll = () => callback();

        parent.addEventListener('scroll', onScroll, false);
        cleanup.push(() => parent.removeEventListener('scroll', onScroll, false));
    }

    if (typeof window !== 'undefined') {
        const onWindowScroll = () => callback();
        const onResize = () => callback();

        window.addEventListener('scroll', onWindowScroll, false);
        window.addEventListener('resize', onResize, false);
        cleanup.push(() => window.removeEventListener('scroll', onWindowScroll, false));
        cleanup.push(() => window.removeEventListener('resize', onResize, false));
    }

    if (typeof ResizeObserver !== 'undefined' && reference instanceof HTMLElement) {
        const resizeObserver = new ResizeObserver(() => callback());

        resizeObserver.observe(reference);
        cleanup.push(() => resizeObserver.disconnect());
    }

    return () => cleanup.forEach((fn) => fn());
};
export const getTopPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width / 2 + referenceOffsets.width / 2,
        y: referenceOffsets.top - floating.getBoundingClientRect().height,
        placement: 'top',
    };
};
export const getTopStartPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left,
        y: referenceOffsets.top - floating.getBoundingClientRect().height,
        placement: 'top-start',
    };
};
export const getTopEndPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width + referenceOffsets.width,
        y: referenceOffsets.top - floating.getBoundingClientRect().height,
        placement: 'top-end',
    };
};
export const getRightPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left + referenceOffsets.width,
        y: referenceOffsets.top - floating.getBoundingClientRect().height / 2 + referenceOffsets.height / 2,
        placement: 'right',
    };
};
export const getRightStartPosition = (reference: HTMLElement | VirtualElement, floating?: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left + referenceOffsets.width,
        y: referenceOffsets.top,
        placement: 'right-start',
    };
};
export const getRightEndPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left + referenceOffsets.width,
        y: referenceOffsets.top + referenceOffsets.height - floating.getBoundingClientRect().height,
        placement: 'right-end',
    };
};
export const getBottomPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left + referenceOffsets.width / 2 - floating.getBoundingClientRect().width / 2,
        y: referenceOffsets.top + referenceOffsets.height,
        placement: 'bottom',
    };
};
export const getBottomStartPosition = (reference: HTMLElement | VirtualElement, floating?: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left,
        y: referenceOffsets.top + referenceOffsets.height,
        placement: 'bottom-start',
    };
};
export const getBottomEndPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width + referenceOffsets.width,
        y: referenceOffsets.top + referenceOffsets.height,
        placement: 'bottom-end',
    };
};
export const getLeftPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width,
        y: referenceOffsets.top + referenceOffsets.height / 2 - floating.getBoundingClientRect().height / 2,
        placement: 'left',
    };
};
export const getLeftStartPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width,
        y: referenceOffsets.top,
        placement: 'left-start',
    };
};
export const getLeftEndPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement): PositionType => {
    const referenceOffsets = getElementOffsets(reference, floating);

    return {
        x: referenceOffsets.left - floating.getBoundingClientRect().width,
        y: referenceOffsets.top + referenceOffsets.height - floating.getBoundingClientRect().height,
        placement: 'left-end',
    };
};
export const getTopElementPosition = (element: HTMLElement | VirtualElement, floating?: HTMLElement) => getElementOffsets(element, floating).top;
export const getRightElementPosition = (element: HTMLElement | VirtualElement, floating?: HTMLElement) => {
    const offsets = getElementOffsets(element, floating);
    
    return offsets.left + offsets.width;
};
export const getBottomElementPosition = (element: HTMLElement | VirtualElement, floating?: HTMLElement) => {
    const offsets = getElementOffsets(element, floating);
    
    return offsets.top + offsets.height;
};
export const getLeftElementPosition = (element: HTMLElement | VirtualElement, floating?: HTMLElement) => getElementOffsets(element, floating).left;
export const getPosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement, placement: string): PositionType => {
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
        return getRightStartPosition(reference, floating);
    case 'right-end':
        return getRightEndPosition(reference, floating);
    case 'bottom':
        return getBottomPosition(reference, floating);
    case 'bottom-start':
        return getBottomStartPosition(reference, floating);
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
    reference: HTMLElement | VirtualElement,
): boolean => {
    const parent: null | HTMLElement = getScrollParent(reference);

    if (parent !== null) {
        return toShiftTop(position.y, floating) > 0 &&
            toShiftRight(position.x, floating) > 0 &&
            toShiftBottom(position.y, floating) > 0 &&
            toShiftLeft(position.x, floating) > 0;
    }

    if (typeof window === 'undefined') {
        return true;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const offsetParent = (reference instanceof HTMLElement ? reference.offsetParent as HTMLElement | null : null)
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
export const computePosition = (reference: HTMLElement | VirtualElement, floating: HTMLElement, options: OptionType = {}): Promise<ParamsType> => {
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
                middleware.baseX = middleware.x;
                middleware.baseY = middleware.y;
                middleware.x = middleware.arrowX ?? middleware.x;
                middleware.y = middleware.arrowY ?? middleware.y;
            }

            params.middlewareData[x.name] = middleware;
        });

        resolve(params);
    });
};
