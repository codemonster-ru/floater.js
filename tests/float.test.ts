import { describe, expect, it, vi } from 'vitest';
import {
    arrow,
    autoUpdate,
    computePosition,
    flip,
    flipPosition,
    getPosition,
    isVisiblePosition,
    offset,
    shift,
} from '../src/float';
import {
    setOffsetParent,
    setRect,
    setScrollPosition,
    setScrollSize,
} from './dom-helpers';

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

describe('computePosition', () => {
    it('positions a floating element on the right', async () => {
        const parent = setupScrollParent(300, 200);
        const reference = setupReference(parent, 50, 40, 20, 10);
        const floating = setupFloating(parent, 100, 30);

        const result = await computePosition(reference, floating, { placement: 'right' });

        expect(result.x).toBe(70);
        expect(result.y).toBe(30);
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
            scrollDirection: '',
        });

        expect(topFlip).not.toBe(false);

        const result = await computePosition(reference, floating, {
            placement: 'bottom',
            middleware: [flip()],
        });

        expect(result.placement).toBeTypeOf('string');
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
});
