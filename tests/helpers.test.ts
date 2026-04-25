import { describe, expect, it } from 'vitest';
import { markInternalMiddleware, sanitizeMiddlewareStack } from '../src/middleware-guard';
import {
    getPlacementSide,
    getPreferredPlacement,
    isPlacementType,
    normalizePlacement,
} from '../src/placements';
import { getScrollParent, getScrollParents } from '../src/scroll-parents';
import { toShiftBottom, toShiftLeft, toShiftRight, toShiftTop } from '../src/shift-math';
import { setRect, setScrollPosition, setScrollSize } from './dom-helpers';

describe('placements helpers', () => {
    it('normalizes and validates placements', () => {
        expect(normalizePlacement()).toBe('bottom');
        expect(normalizePlacement('top')).toBe('top');
        expect(normalizePlacement('invalid-value')).toBe('bottom');
        expect(isPlacementType('left-end')).toBe(true);
        expect(isPlacementType('left-middle')).toBe(false);
    });

    it('resolves side and preferred placement', () => {
        expect(getPlacementSide('top-start')).toBe('top');
        expect(getPlacementSide('right')).toBe('right');
        expect(getPreferredPlacement('right', 'top', ['top', 'right-end'])).toBe('right-end');
    });
});

describe('scroll parents helpers', () => {
    it('finds nearest and nested scroll parents', () => {
        const outer = document.createElement('div');
        const inner = document.createElement('div');
        const child = document.createElement('div');

        outer.style.overflow = 'scroll';
        outer.style.overflowX = 'scroll';
        outer.style.overflowY = 'scroll';
        inner.style.overflow = 'scroll';
        inner.style.overflowX = 'scroll';
        inner.style.overflowY = 'scroll';
        outer.appendChild(inner);
        inner.appendChild(child);
        document.body.appendChild(outer);
        setRect(outer, { left: 0, top: 0, width: 400, height: 300 });
        setRect(inner, { left: 0, top: 0, width: 200, height: 150 });
        setScrollSize(outer, 800, 600);
        setScrollSize(inner, 400, 300);

        expect(getScrollParent(child)).toBe(inner);

        const parents = getScrollParents(child);

        expect(parents[0]).toBe(inner);
        expect(parents[1]).toBe(outer);
    });

    it('resolves scroll parent through shadow root host', () => {
        const outer = document.createElement('div');
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        const child = document.createElement('div');

        outer.style.overflow = 'scroll';
        outer.style.overflowX = 'scroll';
        outer.style.overflowY = 'scroll';
        host.style.overflow = 'scroll';
        host.style.overflowX = 'scroll';
        host.style.overflowY = 'scroll';

        shadow.appendChild(child);
        outer.appendChild(host);
        document.body.appendChild(outer);

        setRect(outer, { left: 0, top: 0, width: 500, height: 400 });
        setRect(host, { left: 0, top: 0, width: 300, height: 200 });
        setScrollSize(outer, 1000, 800);
        setScrollSize(host, 600, 400);

        expect(getScrollParent(child)).toBe(host);

        const parents = getScrollParents(child);

        expect(parents[0]).toBe(host);
        expect(parents[1]).toBe(outer);
    });

    it('resolves scroll parent for slot through shadow root host chain', () => {
        const outer = document.createElement('div');
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        const slot = document.createElement('slot');

        outer.style.overflow = 'scroll';
        outer.style.overflowX = 'scroll';
        outer.style.overflowY = 'scroll';
        host.style.overflow = 'scroll';
        host.style.overflowX = 'scroll';
        host.style.overflowY = 'scroll';

        shadow.appendChild(slot);
        outer.appendChild(host);
        document.body.appendChild(outer);

        setRect(outer, { left: 0, top: 0, width: 500, height: 400 });
        setRect(host, { left: 0, top: 0, width: 300, height: 200 });
        setScrollSize(outer, 1000, 800);
        setScrollSize(host, 600, 400);

        expect(getScrollParent(slot)).toBe(host);
    });
});

describe('middleware guard cache', () => {
    it('re-sanitizes when middleware params mutate in-place', () => {
        const middleware = markInternalMiddleware({
            name: 'offset',
            params: { value: Number.NaN },
        });
        const stack = [middleware];

        const first = sanitizeMiddlewareStack(stack);

        middleware.params.value = 10;

        const second = sanitizeMiddlewareStack(stack);

        expect(first).toHaveLength(0);
        expect(second).toHaveLength(1);
    });

    it('re-sanitizes when flip placements array mutates in-place', () => {
        const middleware = markInternalMiddleware({
            name: 'flip',
            params: { placements: ['top', 'bottom'] },
        });
        const stack = [middleware];

        const first = sanitizeMiddlewareStack(stack);

        middleware.params.placements[1] = 'invalid-placement';

        const second = sanitizeMiddlewareStack(stack);

        expect(first).toHaveLength(1);
        expect(second).toHaveLength(0);
    });
});

describe('shift math helpers', () => {
    it('uses viewport coordinates with fixed strategy', () => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });

        const floating = document.createElement('div');

        setRect(floating, { left: 0, top: 0, width: 100, height: 30 });

        expect(toShiftRight(250, floating, null, { strategy: 'fixed' })).toBe(-50);
        expect(toShiftLeft(20, floating, null, { strategy: 'fixed' })).toBe(20);
    });

    it('uses scroll parent offsets with absolute strategy', () => {
        const parent = document.createElement('div');
        const floating = document.createElement('div');

        parent.style.overflow = 'scroll';
        parent.appendChild(floating);
        document.body.appendChild(parent);

        setRect(parent, { left: 0, top: 0, width: 300, height: 200 });
        setScrollSize(parent, 600, 400);
        setScrollPosition(parent, 50, 40);
        setRect(floating, { left: 0, top: 0, width: 100, height: 30 });

        expect(toShiftLeft(120, floating, null, { strategy: 'absolute' })).toBe(70);
        expect(toShiftTop(100, floating, null, { strategy: 'absolute' })).toBe(60);
        expect(toShiftBottom(180, floating, null, { strategy: 'absolute' })).toBe(30);
    });
});
