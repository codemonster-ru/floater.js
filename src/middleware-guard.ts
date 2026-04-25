import { isPlacementType } from './placements';
import { isHTMLElement } from './dom-guards';

type GuardMiddleware = {
    name: string;
    params?: Record<string, unknown>;
};

const INTERNAL_MIDDLEWARE = Symbol('floater.internal.middleware');
const reservedMiddlewareNames = new Set(['flip', 'offset', 'shift', 'arrow']);
const warnedMessages = new Set<string>();
const MAX_WARNED_MESSAGES = 100;
type SanitizeCacheEntry = {
    snapshots: Array<{
        ref: GuardMiddleware;
        name: string;
        params: GuardMiddleware['params'];
        flipPlacements: unknown;
        flipPlacementsSnapshot: unknown[] | null;
        offsetValue: unknown;
        shiftParent: unknown;
        arrowElement: unknown;
    }>;
    sanitized: GuardMiddleware[];
};
const sanitizeCache = new WeakMap<GuardMiddleware[], SanitizeCacheEntry>();

const warnMiddlewareOnce = (message: string): void => {
    if (warnedMessages.has(message)) {
        return;
    }

    if (warnedMessages.size >= MAX_WARNED_MESSAGES) {
        warnedMessages.clear();
    }

    warnedMessages.add(message);

    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn(message);
    }
};

const isInternalMiddleware = (middleware: GuardMiddleware): boolean => {
    return (middleware as GuardMiddleware & { [INTERNAL_MIDDLEWARE]?: true })[INTERNAL_MIDDLEWARE] === true;
};

export const markInternalMiddleware = <T extends GuardMiddleware>(middleware: T): T => {
    (middleware as T & { [INTERNAL_MIDDLEWARE]?: true })[INTERNAL_MIDDLEWARE] = true;

    return middleware;
};

const areArraysShallowEqual = (a: unknown[] | null, b: unknown[] | null): boolean => {
    if (a === b) {
        return true;
    }

    if (!a || !b || a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};

export const sanitizeMiddlewareStack = <T extends GuardMiddleware>(middleware: T[] = []): T[] => {
    const cached = sanitizeCache.get(middleware as GuardMiddleware[]);

    if (cached && cached.snapshots.length === middleware.length) {
        let sameShape = true;

        for (let i = 0; i < middleware.length; i += 1) {
            const current = middleware[i];
            const snapshot = cached.snapshots[i];

            if (
                snapshot.ref !== current ||
                snapshot.name !== current.name ||
                snapshot.params !== current.params ||
                snapshot.flipPlacements !== current.params?.placements ||
                !areArraysShallowEqual(
                    snapshot.flipPlacementsSnapshot,
                    Array.isArray(current.params?.placements) ? [...current.params.placements] : null,
                ) ||
                snapshot.offsetValue !== current.params?.value ||
                snapshot.shiftParent !== current.params?.parent ||
                snapshot.arrowElement !== current.params?.arrow
            ) {
                sameShape = false;
                break;
            }
        }

        if (sameShape) {
            return cached.sanitized as T[];
        }
    }

    const safe: T[] = [];

    middleware.forEach((item) => {
        if (reservedMiddlewareNames.has(item.name) && !isInternalMiddleware(item)) {
            warnMiddlewareOnce(
                `[floater.js] "${item.name}" is a reserved middleware name. Custom middleware with this name was ignored.`,
            );

            return;
        }

        if (item.name === 'flip' && item.params?.placements !== undefined) {
            const placements = item.params.placements;
            const isValid = Array.isArray(placements) && placements.every((placement) => isPlacementType(placement));

            if (!isValid) {
                warnMiddlewareOnce('[floater.js] flip middleware expects params.placements as PlacementType[]. Middleware was ignored.');

                return;
            }
        }

        if (item.name === 'offset') {
            const value = item.params?.value;

            if (typeof value !== 'number' || !Number.isFinite(value)) {
                warnMiddlewareOnce('[floater.js] offset middleware expects a finite numeric params.value. Middleware was ignored.');

                return;
            }
        }

        if (item.name === 'shift') {
            const parent = item.params?.parent;

            if (parent !== undefined && !isHTMLElement(parent)) {
                warnMiddlewareOnce('[floater.js] shift middleware expects params.parent to be an HTMLElement. Middleware was ignored.');

                return;
            }
        }

        if (item.name === 'arrow') {
            const arrow = item.params?.arrow;

            if (!isHTMLElement(arrow)) {
                warnMiddlewareOnce('[floater.js] arrow middleware expects params.arrow to be an HTMLElement. Middleware was ignored.');

                return;
            }
        }

        safe.push(item);
    });

    sanitizeCache.set(middleware as GuardMiddleware[], {
        snapshots: middleware.map((item) => ({
            ref: item,
            name: item.name,
            params: item.params,
            flipPlacements: item.params?.placements,
            flipPlacementsSnapshot: Array.isArray(item.params?.placements) ? [...item.params.placements] : null,
            offsetValue: item.params?.value,
            shiftParent: item.params?.parent,
            arrowElement: item.params?.arrow,
        })),
        sanitized: safe as GuardMiddleware[],
    });

    return safe;
};
