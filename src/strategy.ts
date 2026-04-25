export type StrategyType = 'absolute' | 'fixed';

export interface StrategyOption {
    strategy?: StrategyType;
}

const isFixedPosition = (floating: HTMLElement): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.getComputedStyle(floating).position === 'fixed';
};

export const getStrategy = (options: StrategyOption = {}, floating: HTMLElement): StrategyType => {
    if (options.strategy) {
        return options.strategy;
    }

    return isFixedPosition(floating) ? 'fixed' : 'absolute';
};

export const isFixedStrategy = (options: StrategyOption = {}, floating: HTMLElement): boolean => {
    return getStrategy(options, floating) === 'fixed';
};
