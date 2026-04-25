import type { MiddlewareType, OptionType } from './float';

export const findMiddleware = <TName extends MiddlewareType['name']>(
    options: OptionType,
    name: TName,
): Extract<MiddlewareType, { name: TName }> | undefined => {
    return options.middleware?.find(
        (middleware): middleware is Extract<MiddlewareType, { name: TName }> => middleware.name === name,
    );
};

export const hasMiddleware = (options: OptionType, name: MiddlewareType['name']): boolean => {
    return !!findMiddleware(options, name);
};

export const getOffsetValue = (options: OptionType): number => {
    return findMiddleware(options, 'offset')?.params.value ?? 0;
};
