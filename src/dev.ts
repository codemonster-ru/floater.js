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

const placement: HTMLElement | null = document.querySelector('#placement.example');
const placementReference: HTMLElement | null = document.querySelector('#placement .reference');
const placementPopup: HTMLElement | null = document.querySelector('#placement .popup');

const placementSetPosition = (reference: HTMLElement, popup: HTMLElement, placement: PlacementType): void => {
    document.getElementById(placement)?.addEventListener('click', (): void => {
        if (placementPopup !== null) placementPopup.innerHTML = placement;

        placementTypes.map((x: string) => {
            popup.classList.remove(`popup_${x}`);
            document.getElementById(x)?.querySelector('.button')?.classList.remove('button_active');
        });
        document.getElementById(placement)?.querySelector('.button')?.classList.add('button_active');
        popup.classList.add(`popup_${placement}`);

        computePosition(reference, popup, {
            placement: placement,
            middleware: [offset(5)],
        }).then(({ x, y }): void => {
            popup.style.top = `${y}px`;
            popup.style.left = `${x}px`;
        });
    });
};

document.addEventListener('DOMContentLoaded', (): void => {
    if (
        placement !== null
        && placementReference !== null
        && placementPopup !== null
    ) {
        placementTypes.map((placementType: string) =>
            placementSetPosition(placementReference, placementPopup, placementType));

        document.getElementById('top')?.click();
    }
});

const shiftBlock: HTMLElement | null = document.querySelector('#shift.example');
const shiftReference: HTMLElement | null = document.querySelector('#shift .reference');
const shiftPopup: HTMLElement | null = document.querySelector('#shift .popup');

document.addEventListener('DOMContentLoaded', (): void => {
    if (
        shiftBlock !== null
        && shiftReference !== null
        && shiftPopup !== null
    ) {
        const x: number = (shiftBlock.scrollWidth - shiftBlock.clientWidth) / 2;
        const y: number = (shiftBlock.scrollHeight - shiftBlock.clientHeight) / 2;

        shiftBlock.scrollTo(x, y);

        autoUpdate(shiftReference, () => {
            computePosition(shiftReference, shiftPopup, {
                placement: 'right',
                middleware: [shift(), offset(5)],
            }).then(({ x, y }): void => {
                shiftPopup.style.top = `${y}px`;
                shiftPopup.style.left = `${x}px`;
            });
        });
    }
});

const flipBlock: HTMLElement | null = document.querySelector('#flip.example');
const flipReference: HTMLElement | null = document.querySelector('#flip .reference');
const flipPopup: HTMLElement | null = document.querySelector('#flip .popup');

document.addEventListener('DOMContentLoaded', (): void => {
    if (
        flipBlock !== null
        && flipReference !== null
        && flipPopup !== null
    ) {
        const x: number = (flipBlock.scrollWidth - flipBlock.clientWidth) / 2;
        const y: number = (flipBlock.scrollHeight - flipBlock.clientHeight) / 2;

        flipBlock.scrollTo(x, y);

        autoUpdate(flipReference, () => {
            computePosition(flipReference, flipPopup, {
                placement: 'top',
                middleware: [offset(5), flip()],
            }).then(({ x, y }): void => {
                flipPopup.style.top = `${y}px`;
                flipPopup.style.left = `${x}px`;
            });
        });
    }
});

const arrowEl: HTMLElement | null = document.querySelector('#arrow .arrow');
const arrowBlock: HTMLElement | null = document.querySelector('#arrow.example');
const arrowReference: HTMLElement | null = document.querySelector('#arrow .reference');
const arrowPopup: HTMLElement | null = document.querySelector('#arrow .popup');

document.addEventListener('DOMContentLoaded', (): void => {
    if (
        arrowEl !== null &&
        arrowBlock !== null &&
        arrowPopup !== null &&
        arrowReference !== null
    ) {
        const x: number = (arrowBlock.scrollWidth - arrowBlock.clientWidth) / 2;
        const y: number = (arrowBlock.scrollHeight - arrowBlock.clientHeight) / 2;

        arrowBlock.scrollTo(x, y);

        autoUpdate(arrowReference, () => {
            computePosition(arrowReference, arrowPopup, {
                placement: 'left',
                middleware: [shift(), offset(5), arrow(arrowEl)],
            }).then(({ x, y, middlewareData }): void => {
                arrowPopup.style.top = `${y}px`;
                arrowPopup.style.left = `${x}px`;

                if (middlewareData.arrow) {
                    arrowEl.style.top = `${middlewareData.arrow.y}px`;
                    arrowEl.style.left = `${middlewareData.arrow.x}px`;
                }
            });
        });
    }
});

const virtualBlock: HTMLElement | null = document.querySelector('#virtual.example');
const virtualPopup: HTMLElement | null = document.querySelector('#virtual .popup');

document.addEventListener('DOMContentLoaded', (): void => {
    if (virtualBlock && virtualPopup) {
        const snapToDevicePixel = (value: number): number => {
            const ratio = window.devicePixelRatio || 1;
            
            return Math.round(value * ratio) / ratio;
        };

        virtualBlock.addEventListener('mouseenter', () => {
            virtualPopup.style.opacity = '1';
        });

        virtualBlock.addEventListener('mouseleave', () => {
            virtualPopup.style.opacity = '0';
        });

        virtualBlock.addEventListener('mousemove', ({
            pageX,
            pageY,
            clientX,
            clientY,
        }) => {
            const virtualEl: VirtualElement = {
                offsetTop: pageY - virtualBlock.offsetTop,
                offsetLeft: pageX - virtualBlock.offsetLeft,
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

            computePosition(virtualEl, virtualPopup, {
                placement: 'right-start',
                middleware: [shift({ parent: virtualBlock }), offset(5)],
            }).then(({ x, y }) => {
                virtualPopup.style.setProperty('--x', `${snapToDevicePixel(x)}px`);
                virtualPopup.style.setProperty('--y', `${snapToDevicePixel(y)}px`);
            });
        });
    }
});

const virtualScrollBlock: HTMLElement | null = document.querySelector('#virtual_scroll.example');
const virtualScrollPopup: HTMLElement | null = document.querySelector('#virtual_scroll .popup');

document.addEventListener('DOMContentLoaded', (): void => {
    if (virtualScrollBlock && virtualScrollPopup) {
        const snapToDevicePixel = (value: number): number => {
            const ratio = window.devicePixelRatio || 1;
            
            return Math.round(value * ratio) / ratio;
        };

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
            const blockRect = virtualScrollBlock.getBoundingClientRect();
            const virtualEl: VirtualElement = {
                offsetTop: clientY - blockRect.top + virtualScrollBlock.scrollTop,
                offsetLeft: clientX - blockRect.left + virtualScrollBlock.scrollLeft,
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

            computePosition(virtualEl, virtualScrollPopup, {
                placement: 'right-start',
                middleware: [shift(), offset(5)],
            }).then(({ x, y }) => {
                virtualScrollPopup.style.top = `${snapToDevicePixel(y)}px`;
                virtualScrollPopup.style.left = `${snapToDevicePixel(x)}px`;
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
            }

            requestCalc();
        });
    }
});
