export const placementTypes = [
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
] as const;

export type PlacementType = typeof placementTypes[number];

export const defaultPlacement: PlacementType = 'bottom';

export const isPlacementType = (placement: unknown): placement is PlacementType => {
    return typeof placement === 'string' && placementTypes.includes(placement as PlacementType);
};

export const normalizePlacement = (placement?: string): PlacementType => {
    if (isPlacementType(placement)) {
        return placement;
    }

    return defaultPlacement;
};

export const getPlacementSide = (placement: string): 'top' | 'right' | 'bottom' | 'left' => {
    if (placement.startsWith('right')) {
        return 'right';
    }

    if (placement.startsWith('left')) {
        return 'left';
    }

    if (placement.startsWith('top')) {
        return 'top';
    }

    return 'bottom';
};

export const getPreferredPlacement = (
    side: 'top' | 'right' | 'bottom' | 'left',
    currentPlacement: string,
    allowedPlacements: PlacementType[],
): PlacementType => {
    if (getPlacementSide(currentPlacement) === side && allowedPlacements.includes(currentPlacement as PlacementType)) {
        return currentPlacement as PlacementType;
    }

    const match = allowedPlacements.find((placement) => getPlacementSide(placement) === side);

    return (match ?? allowedPlacements[0]) as PlacementType;
};
