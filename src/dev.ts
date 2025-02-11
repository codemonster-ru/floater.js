import {
    offset,
    placementTypes,
    computePosition,
    type PlacementType,
} from './index';

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
            middleware: [offset(4)],
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
        const x: number = (placement.scrollWidth - placement.clientWidth) / 2;
        const y: number = (placement.scrollHeight - placement.clientHeight) / 2;

        placement.scrollTo(x, y);

        placementTypes.map((placementType: string) =>
            placementSetPosition(placementReference, placementPopup, placementType));

        document.getElementById('top')?.click();
    }
});