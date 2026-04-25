import { describe, expect, it } from 'vitest';
import {
    arrow,
    computePosition,
    flip,
    offset,
    placementTypes,
    shift,
    type MiddlewareType,
    type PlacementType,
} from '../src/float';
import {
    setOffsetParent,
    setRect,
    setScrollPosition,
    setScrollSize,
} from './dom-helpers';

type Rng = () => number;

const createRng = (seed: number): Rng => {
    let state = seed >>> 0;

    return () => {
        state = (1664525 * state + 1013904223) >>> 0;

        return state / 0xffffffff;
    };
};

const randomInt = (rng: Rng, min: number, max: number): number => {
    return Math.floor(rng() * (max - min + 1)) + min;
};

const randomPlacement = (rng: Rng): PlacementType => {
    return placementTypes[randomInt(rng, 0, placementTypes.length - 1)];
};

const randomPlacementsSubset = (rng: Rng): PlacementType[] => {
    const shuffled = [...placementTypes].sort(() => rng() - 0.5);
    const count = randomInt(rng, 1, placementTypes.length);

    return shuffled.slice(0, count);
};

describe('fuzz: positioning invariants', () => {
    it('keeps computePosition deterministic and finite across random middleware mixes', async () => {
        const rng = createRng(0xdecafbad);

        for (let i = 0; i < 120; i += 1) {
            const parent = document.createElement('div');
            const reference = document.createElement('div');
            const floating = document.createElement('div');
            const arrowEl = document.createElement('div');

            parent.style.overflow = 'scroll';
            parent.style.overflowX = 'scroll';
            parent.style.overflowY = 'scroll';
            document.body.appendChild(parent);
            parent.appendChild(reference);
            parent.appendChild(floating);

            const parentWidth = randomInt(rng, 200, 700);
            const parentHeight = randomInt(rng, 150, 500);
            const refLeft = randomInt(rng, -80, parentWidth + 80);
            const refTop = randomInt(rng, -80, parentHeight + 80);
            const refWidth = randomInt(rng, 8, 80);
            const refHeight = randomInt(rng, 8, 80);
            const floatWidth = randomInt(rng, 20, 220);
            const floatHeight = randomInt(rng, 20, 220);
            const arrowSize = randomInt(rng, 6, 20);

            setRect(parent, { left: 0, top: 0, width: parentWidth, height: parentHeight });
            setScrollSize(parent, parentWidth * 2, parentHeight * 2);
            setScrollPosition(parent, randomInt(rng, 0, 30), randomInt(rng, 0, 30));
            setRect(reference, { left: refLeft, top: refTop, width: refWidth, height: refHeight });
            setRect(floating, { left: 0, top: 0, width: floatWidth, height: floatHeight });
            setRect(arrowEl, { left: 0, top: 0, width: arrowSize, height: arrowSize });
            setOffsetParent(floating, parent);

            const middleware: MiddlewareType[] = [];

            if (rng() > 0.3) {
                middleware.push(shift());
            }

            if (rng() > 0.4) {
                middleware.push(offset(randomInt(rng, -20, 20)));
            }

            if (rng() > 0.5) {
                middleware.push(flip({ placements: randomPlacementsSubset(rng) }));
            }

            if (rng() > 0.5) {
                middleware.push(arrow(arrowEl));
            }

            const placement = randomPlacement(rng);
            const options = {
                placement,
                middleware,
            };

            const first = await computePosition(reference, floating, options);
            const second = await computePosition(reference, floating, options);

            expect(Number.isFinite(first.x)).toBe(true);
            expect(Number.isFinite(first.y)).toBe(true);
            expect(first.placement).toBeTypeOf('string');
            expect(first.x).toBe(second.x);
            expect(first.y).toBe(second.y);
            expect(first.placement).toBe(second.placement);

            if (middleware.some((m) => m.name === 'flip')) {
                const flipMiddleware = middleware.find((m) => m.name === 'flip');
                const allowed = flipMiddleware?.params?.placements;

                if (allowed && allowed.length > 0) {
                    expect(allowed.includes(first.placement as PlacementType)).toBe(true);
                }
            }
        }
    });

    it('keeps fixed strategy output finite near viewport edges', async () => {
        const rng = createRng(0xabc12345);
        const originalInnerHeight = window.innerHeight;
        const originalInnerWidth = window.innerWidth;

        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 420 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 280 });

        for (let i = 0; i < 80; i += 1) {
            const reference = document.createElement('div');
            const floating = document.createElement('div');

            document.body.appendChild(reference);
            document.body.appendChild(floating);

            const refLeft = randomInt(rng, -40, 460);
            const refTop = randomInt(rng, -40, 320);
            const refWidth = randomInt(rng, 6, 50);
            const refHeight = randomInt(rng, 6, 50);
            const floatWidth = randomInt(rng, 20, 260);
            const floatHeight = randomInt(rng, 20, 260);

            setRect(reference, { left: refLeft, top: refTop, width: refWidth, height: refHeight });
            setRect(floating, { left: 0, top: 0, width: floatWidth, height: floatHeight });
            setOffsetParent(floating, null);

            const result = await computePosition(reference, floating, {
                placement: randomPlacement(rng),
                strategy: 'fixed',
                middleware: [offset(randomInt(rng, -16, 16)), flip(), shift()],
            });

            expect(Number.isFinite(result.x)).toBe(true);
            expect(Number.isFinite(result.y)).toBe(true);
        }

        Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
    });
});
