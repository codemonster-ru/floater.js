import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    arrow,
    autoUpdate,
    computePosition,
    flip,
    flipPosition,
    getPosition,
    isVisiblePosition,
    offset,
    placementTypes,
    shift,
} from '../src/float';
import {
    setOffsetParent,
    setRect,
    setScrollPosition,
    setScrollSize,
} from './dom-helpers';
import * as floaterExports from '../src/index';

const createElement = (tag = 'div') => document.createElement(tag);

const setupScrollParent = (width: number, height: number) => {
    const parent = createElement('div');
    parent.style.overflow = 'scroll';
    parent.style.overflowX = 'scroll';
    parent.style.overflowY = 'scroll';
    
    document.body.appendChild(parent);

    setRect(parent, { left: 0, top: 0, width, height });
    // Make it undeniably scrollable for getScrollParent in jsdom.
    setScrollSize(parent, width * 2, height * 2);
    setScrollPosition(parent, 0, 0);

    return parent;
};

const setupReference = (parent: HTMLElement, left: number, top: number, width: number, height: number) => {
    const reference = createElement('div');

    parent.appendChild(reference);

    setRect(reference, { left, top, width, height });

    return reference;
};

const setupFloating = (parent: HTMLElement, width: number, height: number) => {
    const floating = createElement('div');

    parent.appendChild(floating);

    setRect(floating, { left: 0, top: 0, width, height });
    setOffsetParent(floating, parent);

    return floating;
};
const setWindowSize = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
};
const setupFlipScenario = (
    strategy: 'absolute' | 'fixed',
    referenceRect: { left: number; top: number; width: number; height: number },
    floatingRect: { width: number; height: number },
) => {
    const parent = setupScrollParent(300, 200);
    const reference = setupReference(parent, referenceRect.left, referenceRect.top, referenceRect.width, referenceRect.height);
    const floating = setupFloating(parent, floatingRect.width, floatingRect.height);

    if (strategy === 'fixed') {
        document.body.appendChild(floating);

        setOffsetParent(floating, null);
    }

    return { reference, floating };
};

describe('computePosition', () => {
    it('positions a floating element on the right', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);

        const result = await computePosition(reference, floating, { placement: 'right' });

        expect(result.x).toBe(70);
        expect(result.y).toBe(30);
    });

    it('positions correctly for *-end placements', async () => {
        const parent = setupScrollParent(600, 400);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);

        const topEnd = await computePosition(reference, floating, { placement: 'top-end' });
        const rightEnd = await computePosition(reference, floating, { placement: 'right-end' });
        const bottomEnd = await computePosition(reference, floating, { placement: 'bottom-end' });
        const leftEnd = await computePosition(reference, floating, { placement: 'left-end' });

        expect(topEnd.x).toBe(-30);
        expect(topEnd.y).toBe(10);

        expect(rightEnd.x).toBe(70);
        expect(rightEnd.y).toBe(20);

        expect(bottomEnd.x).toBe(-30);
        expect(bottomEnd.y).toBe(50);

        expect(leftEnd.x).toBe(-50);
        expect(leftEnd.y).toBe(20);
    });

    it('applies offset middleware', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);

        const result = await computePosition(reference, floating, {
            placement: 'right',
            middleware: [offset(10)],
        });

        expect(result.x).toBe(80);
        expect(result.y).toBe(30);
    });

    it('clamps to scroll parent with shift', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 260, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);

        const result = await computePosition(reference, floating, {
            placement: 'right',
            middleware: [shift()],
        });

        expect(result.x).toBe(200);
    });

    it('uses ancestor scroll parent for shift even when floating itself is scrollable', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 260, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);

        floating.style.overflow = 'scroll';
        floating.style.overflowX = 'scroll';
        floating.style.overflowY = 'scroll';
        setScrollSize(floating, 200, 100);
        setScrollPosition(floating, 0, 0);

        const result = await computePosition(reference, floating, {
            placement: 'right',
            middleware: [shift()],
        });

        expect(result.x).toBe(200);
    });

    it('clamps to viewport with shift when no scroll parent is found', async () => {
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;

        setWindowSize(300, 200);
        const reference = createElement('div');
        const floating = createElement('div');

        document.body.appendChild(reference);
        document.body.appendChild(floating);

        setRect(reference, { left: 280, top: 40, width: 20, height: 10 });
        setRect(floating, { left: 0, top: 0, width: 100, height: 30 });
        setOffsetParent(floating, null);

        const result = await computePosition(reference, floating, {
            placement: 'right',
            middleware: [shift()],
        });

        expect(result.x).toBe(200);
        setWindowSize(originalWidth, originalHeight);
    });

    it('keeps finite coordinates when floating is larger than viewport', async () => {
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;

        setWindowSize(120, 80);
        const reference = createElement('div');
        const floating = createElement('div');

        document.body.appendChild(reference);
        document.body.appendChild(floating);

        setRect(reference, { left: 20, top: 20, width: 10, height: 10 });
        setRect(floating, { left: 0, top: 0, width: 200, height: 150 });
        setOffsetParent(floating, null);

        const result = await computePosition(reference, floating, {
            placement: 'bottom',
            middleware: [shift()],
        });

        expect(Number.isFinite(result.x)).toBe(true);
        expect(Number.isFinite(result.y)).toBe(true);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
        setWindowSize(originalWidth, originalHeight);
    });

    it('checks visibility against ancestor bounds when floating is scrollable', () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);

        floating.style.overflow = 'scroll';
        floating.style.overflowX = 'scroll';
        floating.style.overflowY = 'scroll';
        setScrollSize(floating, 200, 100);
        setScrollPosition(floating, 0, 0);

        expect(
            isVisiblePosition(
                {
                    x: 200,
                    y: 20,
                    placement: 'right',
                },
                floating,
                reference,
            ),
        ).toBe(true);
    });

    it('keeps finite coordinates when floating is larger than custom shift parent', async () => {
        const parent = setupScrollParent(300, 200);
        const clampParent = createElement('div');
        const reference = setupReference(parent, 10, 10, 10, 10);
        const floating = setupFloating(parent, 180, 150);

        parent.appendChild(clampParent);
        setRect(clampParent, { left: 0, top: 0, width: 100, height: 80 });

        const result = await computePosition(reference, floating, {
            placement: 'bottom',
            middleware: [shift({ parent: clampParent })],
        });

        expect(Number.isFinite(result.x)).toBe(true);
        expect(Number.isFinite(result.y)).toBe(true);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });

    it('flips when placement is not visible', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 100, 190, 20, 10);
        const floating = setupFloating(parent, 80, 30);
        const bottomPosition = getPosition(reference, floating, 'bottom');

        expect(isVisiblePosition(bottomPosition, floating, reference)).toBe(false);

        const topFlip = flipPosition({
            x: bottomPosition.x,
            y: bottomPosition.y,
            options: { placement: 'bottom', middleware: [flip()] },
            primaryX: bottomPosition.x,
            primaryY: bottomPosition.y,
            floating,
            placement: 'top',
            reference,
        });

        expect(topFlip).not.toBe(false);

        const result = await computePosition(reference, floating, {
            placement: 'bottom',
            middleware: [flip()],
        });

        expect(result.placement).toBeTypeOf('string');
    });

    it('respects flip placements restriction', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 100, 190, 20, 10);
        const floating = setupFloating(parent, 80, 30);

        const result = await computePosition(reference, floating, {
            placement: 'bottom',
            middleware: [flip({ placements: ['bottom', 'top'] })],
        });

        expect(result.placement).toBe('top');
    });

    it('does not flip when the allowed placement does not fit', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 100, 0, 20, 10);
        const floating = setupFloating(parent, 80, 30);

        const result = await computePosition(reference, floating, {
            placement: 'bottom',
            middleware: [flip({ placements: ['top'] })],
        });

        expect(result.placement).toBe('top');
    });

    it('provides arrow middleware data', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);
        const arrowEl = createElement('div');

        setRect(arrowEl, { left: 0, top: 0, width: 10, height: 10 });

        const result = await computePosition(reference, floating, {
            placement: 'right',
            middleware: [arrow(arrowEl)],
        });

        expect(result.middlewareData.arrow).toBeTruthy();
        expect(result.middlewareData.arrow?.x).toBeTypeOf('number');
        expect(result.middlewareData.arrow?.y).toBeTypeOf('number');
        expect(result.middlewareData.arrow?.baseX).toBeTypeOf('number');
        expect(result.middlewareData.arrow?.baseY).toBeTypeOf('number');
    });

    it('keeps offset padding on the right edge with shift + offset', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 280, 60, 20, 10);
        const floating = setupFloating(parent, 100, 30);

        const result = await computePosition(reference, floating, {
            placement: 'right',
            middleware: [shift(), offset(5)],
        });

        // Right edge padding: 300 - 100 - 5 = 195
        expect(result.x).toBe(195);
    });

    it('keeps offset padding on the top edge with shift + offset', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 120, 0, 20, 10);
        const floating = setupFloating(parent, 80, 60);

        const result = await computePosition(reference, floating, {
            placement: 'right',
            middleware: [shift(), offset(5)],
        });

        expect(result.y).toBe(5);
    });

    it('keeps arrow coordinates within floating bounds when shifted', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 260, 80, 20, 10);
        const floating = setupFloating(parent, 100, 40);
        const arrowEl = createElement('div');

        setRect(arrowEl, { left: 0, top: 0, width: 12, height: 12 });

        const result = await computePosition(reference, floating, {
            placement: 'top',
            middleware: [shift(), offset(5), arrow(arrowEl)],
        });

        const arrowData = result.middlewareData.arrow;

        expect(arrowData).toBeTruthy();
        expect(Number.isFinite(arrowData!.x)).toBe(true);
        expect(Number.isFinite(arrowData!.y)).toBe(true);
        expect(Number.isFinite(arrowData!.baseX)).toBe(true);
        expect(Number.isFinite(arrowData!.baseY)).toBe(true);
    });

    it('supports a virtual element inside a scrolled container', async () => {
        const parent = setupScrollParent(300, 200);

        setScrollPosition(parent, 50, 30);

        const floating = setupFloating(parent, 80, 30);
        const virtualEl = {
            offsetTop: 130,
            offsetLeft: 150,
            getBoundingClientRect: () => ({
                x: 100,
                y: 100,
                width: 0,
                height: 0,
                top: 100,
                right: 100,
                bottom: 100,
                left: 100,
            }),
        };

        const result = await computePosition(virtualEl, floating, {
            placement: 'right-start',
            middleware: [shift(), offset(5)],
        });

        // Offsets include parent scroll: 100 + 50, 100 + 30
        expect(result.x).toBeGreaterThanOrEqual(145);
        expect(result.y).toBeGreaterThanOrEqual(125);
    });

    it('flips using scroll parent boundaries for virtual elements', async () => {
        const parent = setupScrollParent(300, 200);
        const floating = setupFloating(parent, 120, 60);
        const virtualEl = {
            offsetTop: 190,
            offsetLeft: 140,
            getBoundingClientRect: () => ({
                x: 140,
                y: 190,
                width: 10,
                height: 10,
                top: 190,
                right: 150,
                bottom: 200,
                left: 140,
            }),
        };

        const result = await computePosition(virtualEl, floating, {
            placement: 'bottom',
            middleware: [flip({ placements: ['bottom', 'top'] })],
        });

        expect(result.placement).toBe('top');
    });

    it('recomputes after middleware array mutation', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);
        const middleware = [shift()];
        const options = {
            placement: 'right' as const,
            middleware,
        };

        const first = await computePosition(reference, floating, options);

        middleware.push(offset(10));

        const second = await computePosition(reference, floating, options);

        expect(first.x).toBe(70);
        expect(second.x).toBe(80);
    });

    it('warns and ignores custom middleware using reserved name', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const invalidReservedMiddleware = {
            name: 'offset',
            params: {},
            fn: () => ({
                x: 9999,
                y: 9999,
                placement: 'bottom',
            }),
        } as unknown as never;

        const result = await computePosition(reference, floating, {
            middleware: [invalidReservedMiddleware],
        });

        expect(result.x).toBe(10);
        expect(result.y).toBe(50);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('reserved middleware name'));
        warnSpy.mockRestore();
    });
});

describe('autoUpdate', () => {
    it('registers and cleans up scroll/resize listeners', () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);

        const windowAdd = vi.spyOn(window, 'addEventListener');
        const windowRemove = vi.spyOn(window, 'removeEventListener');
        const parentAdd = vi.spyOn(parent, 'addEventListener');
        const parentRemove = vi.spyOn(parent, 'removeEventListener');

        const cleanup = autoUpdate(reference, () => {});
        
        cleanup();

        expect(parentAdd).toHaveBeenCalledWith('scroll', expect.any(Function), false);
        expect(parentRemove).toHaveBeenCalledWith('scroll', expect.any(Function), false);
        expect(windowAdd).toHaveBeenCalledWith('scroll', expect.any(Function), false);
        expect(windowAdd).toHaveBeenCalledWith('resize', expect.any(Function), false);
        expect(windowRemove).toHaveBeenCalledWith('scroll', expect.any(Function), false);
        expect(windowRemove).toHaveBeenCalledWith('resize', expect.any(Function), false);
    });

    it('registers and cleans up visualViewport listeners when available', () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const visualViewportMock = new EventTarget() as EventTarget & {
            addEventListener: typeof window.addEventListener;
            removeEventListener: typeof window.removeEventListener;
        };
        const addSpy = vi.spyOn(visualViewportMock, 'addEventListener');
        const removeSpy = vi.spyOn(visualViewportMock, 'removeEventListener');
        const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');

        Object.defineProperty(window, 'visualViewport', {
            configurable: true,
            value: visualViewportMock,
        });

        const cleanup = autoUpdate(reference, () => {});

        cleanup();

        expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function), false);
        expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), false);
        expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function), false);
        expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), false);

        if (originalDescriptor) {
            Object.defineProperty(window, 'visualViewport', originalDescriptor);
        } else {
            Reflect.deleteProperty(window, 'visualViewport');
        }
    });

    it('registers scroll listeners for nested scroll parents', () => {
        const outer = setupScrollParent(600, 400);
        const inner = createElement('div');

        inner.style.overflow = 'scroll';
        inner.style.overflowX = 'scroll';
        inner.style.overflowY = 'scroll';
        outer.appendChild(inner);
        setRect(inner, { left: 0, top: 0, width: 300, height: 200 });
        setScrollSize(inner, 600, 400);
        setScrollPosition(inner, 0, 0);

        const reference = setupReference(inner, 50, 40, 20, 10);

        const outerAdd = vi.spyOn(outer, 'addEventListener');
        const outerRemove = vi.spyOn(outer, 'removeEventListener');
        const innerAdd = vi.spyOn(inner, 'addEventListener');
        const innerRemove = vi.spyOn(inner, 'removeEventListener');

        const cleanup = autoUpdate(reference, () => {});

        cleanup();

        expect(innerAdd).toHaveBeenCalledWith('scroll', expect.any(Function), false);
        expect(innerRemove).toHaveBeenCalledWith('scroll', expect.any(Function), false);
        expect(outerAdd).toHaveBeenCalledWith('scroll', expect.any(Function), false);
        expect(outerRemove).toHaveBeenCalledWith('scroll', expect.any(Function), false);
    });

    it('batches rapid events into one callback per animation frame', () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const callback = vi.fn();
        let rafCallback: FrameRequestCallback | null = null;
        const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
            .mockImplementation((cb: FrameRequestCallback): number => {
                rafCallback = cb;

                return 1;
            });
        const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
            .mockImplementation(() => undefined);
        const cleanup = autoUpdate(reference, callback);

        parent.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));

        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(0);

        if (rafCallback) {
            rafCallback(0);
        }

        expect(callback).toHaveBeenCalledTimes(1);

        cleanup();

        expect(cancelAnimationFrameSpy).not.toHaveBeenCalled();
        requestAnimationFrameSpy.mockRestore();
        cancelAnimationFrameSpy.mockRestore();
    });

    it('supports animationFrame polling mode', () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const callback = vi.fn();
        const frameCallbacks: FrameRequestCallback[] = [];
        let nextFrameId = 1;
        const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
            .mockImplementation((cb: FrameRequestCallback): number => {
                frameCallbacks.push(cb);

                return nextFrameId++;
            });
        const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
            .mockImplementation(() => undefined);

        const cleanup = autoUpdate(reference, callback, { animationFrame: true });

        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
        parent.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

        const firstFrame = frameCallbacks.shift();

        if (firstFrame) {
            firstFrame(0);
        }

        expect(callback).toHaveBeenCalledTimes(1);
        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(2);

        cleanup();

        expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(1);
        requestAnimationFrameSpy.mockRestore();
        cancelAnimationFrameSpy.mockRestore();
    });

    it('limits animationFrame updates with maxFps', () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const callback = vi.fn();
        const frameCallbacks: FrameRequestCallback[] = [];
        let nextFrameId = 1;
        const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
            .mockImplementation((cb: FrameRequestCallback): number => {
                frameCallbacks.push(cb);

                return nextFrameId++;
            });
        const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
            .mockImplementation(() => undefined);

        const cleanup = autoUpdate(reference, callback, { animationFrame: true, maxFps: 30 });

        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

        const frame1 = frameCallbacks.shift();

        if (frame1) {
            frame1(0);
        }

        const frame2 = frameCallbacks.shift();

        if (frame2) {
            frame2(10);
        }

        const frame3 = frameCallbacks.shift();

        if (frame3) {
            frame3(20);
        }

        const frame4 = frameCallbacks.shift();

        if (frame4) {
            frame4(40);
        }

        expect(callback).toHaveBeenCalledTimes(2);

        cleanup();

        expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(1);
        requestAnimationFrameSpy.mockRestore();
        cancelAnimationFrameSpy.mockRestore();
    });

    it('pauses and resumes animationFrame loop on visibility change', () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const callback = vi.fn();
        const frameCallbacks: FrameRequestCallback[] = [];
        let nextFrameId = 1;
        let visibilityState: DocumentVisibilityState = 'visible';
        const originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');
        const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
            .mockImplementation((cb: FrameRequestCallback): number => {
                frameCallbacks.push(cb);

                return nextFrameId++;
            });
        const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
            .mockImplementation(() => undefined);

        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            get: () => visibilityState,
        });

        const cleanup = autoUpdate(reference, callback, { animationFrame: true, maxFps: 60 });

        const firstFrame = frameCallbacks.shift();

        if (firstFrame) {
            firstFrame(0);
        }

        expect(callback).toHaveBeenCalledTimes(1);

        visibilityState = 'hidden';
        document.dispatchEvent(new Event('visibilitychange'));

        expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(1);

        visibilityState = 'visible';
        document.dispatchEvent(new Event('visibilitychange'));

        const resumedFrame = frameCallbacks.shift();

        if (resumedFrame) {
            resumedFrame(100);
        }

        expect(callback).toHaveBeenCalledTimes(2);

        cleanup();

        if (originalVisibilityDescriptor) {
            Object.defineProperty(document, 'visibilityState', originalVisibilityDescriptor);
        }
        requestAnimationFrameSpy.mockRestore();
        cancelAnimationFrameSpy.mockRestore();
    });
});

describe('exports', () => {
    it('exposes documented stable APIs', () => {
        expect(floaterExports.computePosition).toBeTypeOf('function');
        expect(floaterExports.autoUpdate).toBeTypeOf('function');
        expect(floaterExports.placementTypes).toBeInstanceOf(Array);
    });
});

describe('position: fixed behavior', () => {
    it('treats fixed elements as viewport-based for flip/shift', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 190, 20, 10);
        const floating = setupFloating(parent, 100, 40);
        const originalGetComputedStyle = window.getComputedStyle;

        const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle')
            .mockImplementation((el: Element) => {
                const style = originalGetComputedStyle(el);

                if (el === floating) {
                    return {
                        ...style,
                        position: 'fixed',
                    } as CSSStyleDeclaration;
                }

                return style;
            });

        const result = await computePosition(reference, floating, {
            placement: 'bottom',
            middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
        });

        expect(result.placement).toBe('bottom');

        getComputedStyleSpy.mockRestore();
    });

    it('supports strategy: fixed for teleported fixed floating near viewport edge', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 200, 760, 20, 10);
        const floating = setupFloating(parent, 160, 80);

        // Teleport the floating element to body and drop the offset parent.
        document.body.appendChild(floating);
        
        setOffsetParent(floating, null);

        const result = await computePosition(reference, floating, {
            placement: 'bottom',
            strategy: 'fixed',
            middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
        });

        expect(result.placement).toBe('top');
        expect(result.y).toBeLessThan(reference.getBoundingClientRect().top);
    });

    it('reacts to viewport resize when using strategy: fixed', async () => {
        const originalInnerHeight = window.innerHeight;
        const originalInnerWidth = window.innerWidth;

        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 300 });
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });

        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 200, 260, 20, 10);
        const floating = setupFloating(parent, 160, 80);

        document.body.appendChild(floating);
        
        setOffsetParent(floating, null);

        const first = await computePosition(reference, floating, {
            placement: 'bottom',
            strategy: 'fixed',
            middleware: [shift()],
        });

        expect(first.placement).toBe('bottom');
        expect(first.y).toBe(220);

        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });

        const second = await computePosition(reference, floating, {
            placement: 'bottom',
            strategy: 'fixed',
            middleware: [shift()],
        });

        expect(second.placement).toBe('bottom');
        expect(second.y).toBe(270);

        Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
    });

    it('reacts to reference movement (scroll) when using strategy: fixed', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 200, 300, 20, 10);
        const floating = setupFloating(parent, 160, 80);

        document.body.appendChild(floating);
        
        setOffsetParent(floating, null);

        const first = await computePosition(reference, floating, {
            placement: 'bottom',
            strategy: 'fixed',
            middleware: [shift()],
        });

        // Simulate scroll moving the reference upward in the viewport.
        setRect(reference, { left: 200, top: 120, width: 20, height: 10 });

        const second = await computePosition(reference, floating, {
            placement: 'bottom',
            strategy: 'fixed',
            middleware: [shift()],
        });

        expect(second.y).toBeLessThan(first.y);
    });
});

describe('flip placement selection', () => {
    const originalInnerHeight = window.innerHeight;
    const originalInnerWidth = window.innerWidth;
    const restoreWindowSize = () => {
        setWindowSize(originalInnerWidth, originalInnerHeight);
    };
    const restoreAfter = () => {
        restoreWindowSize();
    };
    
    afterEach(restoreAfter);

    const cases = [
        { placement: 'top', reference: { left: 120, top: 5, width: 20, height: 10 } },
        { placement: 'top-start', reference: { left: 120, top: 5, width: 20, height: 10 } },
        { placement: 'top-end', reference: { left: 120, top: 5, width: 20, height: 10 } },
        { placement: 'bottom', reference: { left: 120, top: 175, width: 20, height: 10 } },
        { placement: 'bottom-start', reference: { left: 120, top: 175, width: 20, height: 10 } },
        { placement: 'bottom-end', reference: { left: 120, top: 175, width: 20, height: 10 } },
        { placement: 'left', reference: { left: 5, top: 80, width: 10, height: 20 } },
        { placement: 'left-start', reference: { left: 5, top: 80, width: 10, height: 20 } },
        { placement: 'left-end', reference: { left: 5, top: 80, width: 10, height: 20 } },
        { placement: 'right', reference: { left: 275, top: 80, width: 10, height: 20 } },
        { placement: 'right-start', reference: { left: 275, top: 80, width: 10, height: 20 } },
        { placement: 'right-end', reference: { left: 275, top: 80, width: 10, height: 20 } },
    ] as const;

    const strategies: Array<'absolute' | 'fixed'> = ['absolute', 'fixed'];
    const getFirstVisiblePlacement = (
        reference: HTMLElement,
        floating: HTMLElement,
        options: { strategy?: 'absolute' | 'fixed' },
    ): string | null => {
        for (const placement of placementTypes) {
            const position = getPosition(reference, floating, placement, options);

            if (isVisiblePosition(position, floating, reference, options)) {
                return placement;
            }
        }

        return null;
    };

    strategies.forEach((strategy) => {
        it(`chooses a fitting side for all placements (${strategy})`, async () => {
            setWindowSize(300, 200);

            for (const testCase of cases) {
                const { reference, floating } = setupFlipScenario(
                    strategy,
                    testCase.reference,
                    { width: 80, height: 60 },
                );

                const result = await computePosition(reference, floating, {
                    placement: testCase.placement,
                    strategy,
                    middleware: [flip()],
                });

                const expected = getFirstVisiblePlacement(reference, floating, { strategy });

                expect(expected).not.toBeNull();
                expect(result.placement).toBe(expected);
            }

            restoreWindowSize();
        });
    });

    strategies.forEach((strategy) => {
        it(`falls back to the side with the most space when nothing fits (${strategy})`, async () => {
            setWindowSize(300, 200);

            const { reference, floating } = setupFlipScenario(
                strategy,
                { left: 40, top: 60, width: 20, height: 10 },
                { width: 260, height: 190 },
            );

            const result = await computePosition(reference, floating, {
                placement: 'top',
                strategy,
                middleware: [flip()],
            });

            expect(result.placement.startsWith('right')).toBe(true);

            restoreWindowSize();
        });
    });

    strategies.forEach((strategy) => {
        it(`keeps the preferred placement when it fits (${strategy})`, async () => {
            setWindowSize(300, 200);

            const { reference, floating } = setupFlipScenario(
                strategy,
                { left: 120, top: 80, width: 20, height: 10 },
                { width: 80, height: 40 },
            );

            const result = await computePosition(reference, floating, {
                placement: 'top',
                strategy,
                middleware: [flip()],
            });

            expect(result.placement).toBe('top');

            restoreWindowSize();
        });
    });
});
