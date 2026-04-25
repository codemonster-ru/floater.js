export const normalizeMax = (min: number, max: number): number => {
    return max < min ? min : max;
};

export const clamp = (value: number, min: number, max: number): number => {
    const safeMax = normalizeMax(min, max);

    if (value < min) {
        return min;
    }

    if (value > safeMax) {
        return safeMax;
    }

    return value;
};
