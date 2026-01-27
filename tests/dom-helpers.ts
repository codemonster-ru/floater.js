export const setNumericProp = (element: HTMLElement, name: string, value: number) => {
    Object.defineProperty(element, name, {
        configurable: true,
        value,
        writable: true,
    });
};

export const setRect = (
    element: HTMLElement,
    rect: { left: number; top: number; width: number; height: number },
) => {
    Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            right: rect.left + rect.width,
            bottom: rect.top + rect.height,
            left: rect.left,
        }),
    });
    setNumericProp(element, 'clientWidth', rect.width);
    setNumericProp(element, 'clientHeight', rect.height);
};

export const setOffsetParent = (element: HTMLElement, parent: HTMLElement | null) => {
    Object.defineProperty(element, 'offsetParent', {
        configurable: true,
        value: parent,
    });
};

export const setScrollSize = (element: HTMLElement, width: number, height: number) => {
    setNumericProp(element, 'scrollWidth', width);
    setNumericProp(element, 'scrollHeight', height);
};

export const setScrollPosition = (element: HTMLElement, left: number, top: number) => {
    setNumericProp(element, 'scrollLeft', left);
    setNumericProp(element, 'scrollTop', top);
};
