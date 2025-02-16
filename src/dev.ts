import {
    shift,
    offset,
    placementTypes,
    computePosition,
    type PlacementType, autoUpdate,
} from './index';

// Placement, start

const placement: HTMLElement | null = document.querySelector('.placement');
const placementReference: HTMLElement | null = document.querySelector('.placement-reference');
const placementPopup: HTMLElement | null = document.querySelector('.placement-popup');

const placementSetPosition = (reference: HTMLElement, popup: HTMLElement, placement: PlacementType): void => {
    document.getElementById(placement)?.addEventListener('click', (): void => {
        if (placementPopup !== null) placementPopup.innerHTML = placement;

        placementTypes.map((x: string) => {
            popup.classList.remove(`placement-popup_${x}`);
            document.getElementById(x)?.querySelector('.button')?.classList.remove('button_active');
        });
        document.getElementById(placement)?.querySelector('.button')?.classList.add('button_active');
        popup.classList.add(`placement-popup_${placement}`);

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

// Placement, end

// Shift, start

const shiftBlock: HTMLElement | null = document.querySelector('.shift');
const shiftReference: HTMLElement | null = document.querySelector('.shift-reference');
const shiftPopup: HTMLElement | null = document.querySelector('.shift-popup');

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

// Shift, end