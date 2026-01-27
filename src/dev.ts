import {
    flip,
    arrow,
    shift,
    offset,
    autoUpdate,
    placementTypes,
    computePosition,
    type VirtualRect,
    type PlacementType,
    type VirtualElement,
} from './index';

const cleanupTasks: Array<() => void> = [];
const registerCleanup = (cleanup: (() => void) | null | undefined) => {
    if (cleanup) {
        cleanupTasks.push(cleanup);
    }
};

window.addEventListener('beforeunload', () => {
    cleanupTasks.forEach((cleanup) => cleanup());
});

const setPopupPosition = (popup: HTMLElement, x: number, y: number) => {
    popup.style.top = `${y}px`;
    popup.style.left = `${x}px`;
};
const setPopupPositionVars = (popup: HTMLElement, x: number, y: number) => {
    popup.style.setProperty('--x', `${x}px`);
    popup.style.setProperty('--y', `${y}px`);
};
const snapToDevicePixel = (value: number): number => {
    const ratio = window.devicePixelRatio || 1;

    return Math.round(value * ratio) / ratio;
};
const scrollToCenter = (element: HTMLElement) => {
    const x = (element.scrollWidth - element.clientWidth) / 2;
    const y = (element.scrollHeight - element.clientHeight) / 2;

    element.scrollTo(x, y);
};
const createVirtualElement = (
    clientX: number,
    clientY: number,
    block: HTMLElement,
): VirtualElement => {
    const blockRect = block.getBoundingClientRect();
    const offsetTop = clientY - blockRect.top + block.scrollTop;
    const offsetLeft = clientX - blockRect.left + block.scrollLeft;

    return {
        offsetTop,
        offsetLeft,
        getBoundingClientRect(): VirtualRect {
            return {
                x: clientX,
                y: clientY,
                width: 0,
                height: 0,
                top: clientY,
                right: clientX,
                bottom: clientY,
                left: clientX,
            };
        },
    };
};
const updateOnAuto = (reference: HTMLElement | VirtualElement, callback: () => void) => {
    registerCleanup(autoUpdate(reference, callback));
};
const setupPlacement = (
    placement: HTMLElement,
    reference: HTMLElement,
    popup: HTMLElement,
    placementType: PlacementType,
): void => {
    document.getElementById(placementType)?.addEventListener('click', (): void => {
        popup.innerHTML = placementType;

        placementTypes.map((x: string) => {
            popup.classList.remove(`popup_${x}`);
            document.getElementById(x)?.querySelector('.button')?.classList.remove('button_active');
        });
        
        document.getElementById(placementType)?.querySelector('.button')?.classList.add('button_active');
        popup.classList.add(`popup_${placementType}`);

        computePosition(reference, popup, {
            placement: placementType,
            middleware: [offset(5)],
        }).then(({ x, y }): void => {
            setPopupPosition(popup, x, y);
        });
    });
};

document.addEventListener('DOMContentLoaded', (): void => {
    const placement: HTMLElement | null = document.querySelector('#placement.example');
    const placementReference: HTMLElement | null = document.querySelector('#placement .reference');
    const placementPopup: HTMLElement | null = document.querySelector('#placement .popup');

    if (placement && placementReference && placementPopup) {
        placementTypes.map((placementType: string) =>
            setupPlacement(placement, placementReference, placementPopup, placementType));

        document.getElementById('top')?.click();
    }

    const shiftBlock: HTMLElement | null = document.querySelector('#shift.example');
    const shiftReference: HTMLElement | null = document.querySelector('#shift .reference');
    const shiftPopup: HTMLElement | null = document.querySelector('#shift .popup');

    if (shiftBlock && shiftReference && shiftPopup) {
        scrollToCenter(shiftBlock);

        updateOnAuto(shiftReference, () => {
            computePosition(shiftReference, shiftPopup, {
                placement: 'right',
                middleware: [shift(), offset(5)],
            }).then(({ x, y }): void => {
                setPopupPosition(shiftPopup, x, y);
            });
        });
    }

    const flipBlock: HTMLElement | null = document.querySelector('#flip.example');
    const flipReference: HTMLElement | null = document.querySelector('#flip .reference');
    const flipPopup: HTMLElement | null = document.querySelector('#flip .popup');

    if (flipBlock && flipReference && flipPopup) {
        scrollToCenter(flipBlock);

        updateOnAuto(flipReference, () => {
            computePosition(flipReference, flipPopup, {
                placement: 'top',
                middleware: [offset(5), flip()],
            }).then(({ x, y }): void => {
                setPopupPosition(flipPopup, x, y);
            });
        });
    }

    const flipShiftBlock: HTMLElement | null = document.querySelector('#flip_shift.example');
    const flipShiftReference: HTMLElement | null = document.querySelector('#flip_shift .reference');
    const flipShiftPopup: HTMLElement | null = document.querySelector('#flip_shift .popup');

    if (flipShiftBlock && flipShiftReference && flipShiftPopup) {
        scrollToCenter(flipShiftBlock);

        updateOnAuto(flipShiftReference, () => {
            computePosition(flipShiftReference, flipShiftPopup, {
                placement: 'top',
                middleware: [offset(5), flip(), shift()],
            }).then(({ x, y }): void => {
                setPopupPosition(flipShiftPopup, x, y);
            });
        });
    }

    const arrowEl: HTMLElement | null = document.querySelector('#arrow .arrow');
    const arrowBlock: HTMLElement | null = document.querySelector('#arrow.example');
    const arrowReference: HTMLElement | null = document.querySelector('#arrow .reference');
    const arrowPopup: HTMLElement | null = document.querySelector('#arrow .popup');

    if (arrowEl && arrowBlock && arrowPopup && arrowReference) {
        scrollToCenter(arrowBlock);

        updateOnAuto(arrowReference, () => {
            computePosition(arrowReference, arrowPopup, {
                placement: 'left',
                middleware: [shift(), offset(5), arrow(arrowEl)],
            }).then(({ x, y, middlewareData }): void => {
                setPopupPosition(arrowPopup, x, y);

                if (middlewareData.arrow) {
                    arrowEl.style.top = `${middlewareData.arrow.y}px`;
                    arrowEl.style.left = `${middlewareData.arrow.x}px`;
                }
            });
        });
    }

    const virtualBlock: HTMLElement | null = document.querySelector('#virtual.example');
    const virtualPopup: HTMLElement | null = document.querySelector('#virtual .popup');

    if (virtualBlock && virtualPopup) {
        virtualBlock.addEventListener('mouseenter', () => {
            virtualPopup.style.opacity = '1';
        });

        virtualBlock.addEventListener('mouseleave', () => {
            virtualPopup.style.opacity = '0';
        });

        virtualBlock.addEventListener('mousemove', ({
            clientX,
            clientY,
        }) => {
            const virtualEl: VirtualElement = createVirtualElement(clientX, clientY, virtualBlock);

            computePosition(virtualEl, virtualPopup, {
                placement: 'right-start',
                middleware: [shift({ parent: virtualBlock }), offset(5)],
            }).then(({ x, y }) => {
                setPopupPositionVars(virtualPopup, snapToDevicePixel(x), snapToDevicePixel(y));
            });
        });
    }

    const virtualScrollBlock: HTMLElement | null = document.querySelector('#virtual_scroll.example');
    const virtualScrollPopup: HTMLElement | null = document.querySelector('#virtual_scroll .popup');

    if (virtualScrollBlock && virtualScrollPopup) {
        let lastClientX: number | null = null;
        let lastClientY: number | null = null;
        let cleanupAutoUpdate: (() => void) | null = null;
        let rafId: number | null = null;
        let scrollRafId: number | null = null;

        const calcPosition = () => {
            if (lastClientX === null || lastClientY === null) {
                return;
            }

            const clientX = lastClientX;
            const clientY = lastClientY;
            const virtualEl: VirtualElement = createVirtualElement(clientX, clientY, virtualScrollBlock);

            computePosition(virtualEl, virtualScrollPopup, {
                placement: 'right-start',
                middleware: [shift(), offset(5)],
            }).then(({ x, y }) => {
                setPopupPosition(virtualScrollPopup, snapToDevicePixel(x), snapToDevicePixel(y));
            });
        };
        const requestCalc = () => {
            if (rafId !== null) {
                return;
            }

            rafId = requestAnimationFrame(() => {
                rafId = null;
                calcPosition();
            });
        };

        virtualScrollBlock.addEventListener('mouseenter', () => {
            virtualScrollPopup.style.opacity = '1';
        });

        virtualScrollBlock.addEventListener('mouseleave', () => {
            virtualScrollPopup.style.opacity = '0';
            lastClientX = null;
            lastClientY = null;
        });
        virtualScrollBlock.addEventListener('scroll', () => {
            virtualScrollPopup.style.opacity = '0';

            if (scrollRafId !== null) {
                return;
            }

            scrollRafId = requestAnimationFrame(() => {
                scrollRafId = null;

                if (lastClientX !== null && lastClientY !== null) {
                    virtualScrollPopup.style.opacity = '1';
                }

                requestCalc();
            });
        }, { passive: true });

        virtualScrollBlock.addEventListener('mousemove', ({
            clientX,
            clientY,
        }): void => {
            lastClientX = clientX;
            lastClientY = clientY;

            if (cleanupAutoUpdate === null) {
                cleanupAutoUpdate = autoUpdate(virtualScrollBlock, () => {
                    requestCalc();
                });
                registerCleanup(cleanupAutoUpdate);
            }

            requestCalc();
        });

        virtualScrollBlock.addEventListener('mouseleave', () => {
            if (cleanupAutoUpdate) {
                cleanupAutoUpdate();
                cleanupAutoUpdate = null;
            }
        });
    }
});
