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
const runFixedTeleportDemo = () => {
    const host = document.querySelector('#fixed_teleport.example');

    if (!(host instanceof HTMLElement)) {
        return;
    }

    const block = document.createElement('div');
    const panel = document.createElement('div');
    const toggleLabel = document.createElement('label');
    const toggle = document.createElement('input');
    const label = document.createElement('label');
    const slider = document.createElement('input');
    const reference = document.createElement('div');
    const floating = document.createElement('div');
    const floatingPlacement = document.createElement('div');

    block.id = 'fixed-teleport-block';
    block.style.position = 'relative';
    block.style.height = '100%';
    block.style.padding = '8px';
    block.style.boxSizing = 'border-box';

    panel.id = 'fixed-teleport-panel';
    panel.style.position = 'sticky';
    panel.style.top = '0';
    panel.style.zIndex = '1';
    panel.style.padding = '8px 10px';
    panel.style.background = 'rgba(17, 24, 39, 0.9)';
    panel.style.color = 'white';
    panel.style.fontSize = '12px';
    panel.style.borderRadius = '6px';
    panel.style.display = 'flex';
    panel.style.gap = '8px';
    panel.style.alignItems = 'center';

    toggleLabel.htmlFor = 'fixed-teleport-toggle';
    toggleLabel.textContent = 'fixed demo';
    toggleLabel.style.display = 'inline-flex';
    toggleLabel.style.gap = '6px';
    toggleLabel.style.alignItems = 'center';

    toggle.id = 'fixed-teleport-toggle';
    toggle.type = 'checkbox';
    toggle.checked = false;

    label.htmlFor = 'fixed-teleport-slider';
    label.textContent = 'ref Y (vh):';

    slider.id = 'fixed-teleport-slider';
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.step = '1';
    slider.value = '92';

    reference.id = 'fixed-teleport-reference';
    reference.textContent = 'fixed ref';
    reference.style.position = 'fixed';
    reference.style.left = '32px';
    reference.style.width = '96px';
    reference.style.height = '20px';
    reference.style.background = '#0ea5e9';
    reference.style.color = 'white';
    reference.style.fontSize = '12px';
    reference.style.zIndex = '9999';
    reference.style.display = 'none';

    floating.id = 'fixed-teleport-floating';
    floating.textContent = 'fixed floating';
    floating.style.position = 'fixed';
    floating.style.left = '0';
    floating.style.top = '0';
    floating.style.width = '160px';
    floating.style.height = '80px';
    floating.style.background = '#ef4444';
    floating.style.color = 'white';
    floating.style.fontSize = '12px';
    floating.style.padding = '6px';
    floating.style.boxSizing = 'border-box';
    floating.style.zIndex = '9999';
    floating.style.display = 'none';

    floatingPlacement.id = 'fixed-teleport-floating-placement';
    floatingPlacement.textContent = 'placement: (pending)';
    floating.appendChild(floatingPlacement);

    toggleLabel.prepend(toggle);
    panel.appendChild(toggleLabel);
    panel.appendChild(label);
    panel.appendChild(slider);

    block.appendChild(panel);
    host.appendChild(block);

    // Teleport fixed elements to body, but keep controls inside the scrollable block.
    document.body.appendChild(reference);
    document.body.appendChild(floating);

    const setReferenceVh = (vh: number) => {
        const vhPx = (vh / 100) * window.innerHeight;
        const maxTop = Math.max(0, window.innerHeight - reference.offsetHeight);
        const clampedTop = Math.min(Math.max(0, vhPx), maxTop);

        reference.style.top = `${clampedTop}px`;
    };

    const update = () => {
        if (!toggle.checked) {
            reference.style.display = 'none';
            floating.style.display = 'none';

            return;
        }

        reference.style.display = 'block';
        floating.style.display = 'block';
        computePosition(reference, floating, {
            placement: 'bottom',
            strategy: 'fixed',
            middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
        }).then(({ x, y, placement }) => {
            setPopupPosition(floating, x, y);
            floatingPlacement.textContent = `placement: ${placement}`;

            const refRect = reference.getBoundingClientRect();
            const floatRect = floating.getBoundingClientRect();
            const spaceBelow = window.innerHeight - refRect.bottom;
            const spaceAbove = refRect.top;

            console.group('[floater.js] fixed teleport demo');
            console.log('date', '2026-01-27');
            console.log('sliderVh', slider.value);
            console.log('placement', placement);
            console.log('coords', { x, y });
            console.log('refRect', refRect);
            console.log('floatRect', floatRect);
            console.log('spaceBelow', spaceBelow);
            console.log('spaceAbove', spaceAbove);
            console.groupEnd();
        });
    };

    slider.addEventListener('input', () => {
        setReferenceVh(Number(slider.value));
        update();
    });
    toggle.addEventListener('change', () => {
        setReferenceVh(Number(slider.value));
        update();
    });

    // Initialize near the bottom to force a flip when space is insufficient.
    setReferenceVh(Number(slider.value));
    registerCleanup(autoUpdate(reference, update));
    update();
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

    // Teleport + position: fixed demo that should flip upward near the viewport edge.
    runFixedTeleportDemo();

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
