import { getScrollParents } from './scroll-parents';
import { isHTMLElement } from './dom-guards';

export interface AutoUpdateOptions {
    animationFrame?: boolean;
    maxFps?: number;
}

type AutoUpdateReference = HTMLElement | {
    getBoundingClientRect(): unknown;
};

export const autoUpdate = (
    reference: AutoUpdateReference,
    callback: () => void,
    floatingOrOptions?: HTMLElement | AutoUpdateOptions,
    options: AutoUpdateOptions = {},
): () => void => {
    const floating = isHTMLElement(floatingOrOptions) ? floatingOrOptions : undefined;
    const autoUpdateOptions = isHTMLElement(floatingOrOptions) ? options : (floatingOrOptions ?? {});
    const animationFrame = autoUpdateOptions.animationFrame === true;
    const maxFps = Number.isFinite(autoUpdateOptions.maxFps) && (autoUpdateOptions.maxFps as number) > 0
        ? autoUpdateOptions.maxFps as number
        : (animationFrame ? 30 : null);
    const scrollParents = new Set<HTMLElement>([
        ...getScrollParents(reference),
        ...(floating ? getScrollParents(floating) : []),
    ]);
    const cleanup: Array<() => void> = [];
    let frameId: number | null = null;
    let loopId: number | null = null;
    let lastLoopTime = Number.NEGATIVE_INFINITY;
    const isDocumentHidden = (): boolean => {
        return typeof document !== 'undefined' && document.visibilityState === 'hidden';
    };

    const scheduleCallback = () => {
        if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
            callback();

            return;
        }

        if (frameId !== null) {
            return;
        }

        frameId = window.requestAnimationFrame(() => {
            frameId = null;
            callback();
        });
    };
    if (animationFrame && typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        const minFrameInterval = maxFps ? 1000 / maxFps : 0;
        const stopLoop = () => {
            if (loopId !== null && typeof window.cancelAnimationFrame === 'function') {
                window.cancelAnimationFrame(loopId);
            }

            loopId = null;
        };
        const loop = (time: number) => {
            if (isDocumentHidden()) {
                loopId = null;

                return;
            }

            if (time - lastLoopTime >= minFrameInterval) {
                lastLoopTime = time;
                callback();
            }

            loopId = window.requestAnimationFrame(loop);
        };
        const startLoop = () => {
            if (loopId !== null || isDocumentHidden()) {
                return;
            }

            lastLoopTime = Number.NEGATIVE_INFINITY;
            loopId = window.requestAnimationFrame(loop);
        };
        const onVisibilityChange = () => {
            if (isDocumentHidden()) {
                stopLoop();
            } else {
                startLoop();
            }
        };

        if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
            document.addEventListener('visibilitychange', onVisibilityChange, false);
            cleanup.push(() => document.removeEventListener('visibilitychange', onVisibilityChange, false));
        }

        startLoop();
    } else {
        const onScroll = () => scheduleCallback();

        scrollParents.forEach((parent) => {
            parent.addEventListener('scroll', onScroll, false);
            cleanup.push(() => parent.removeEventListener('scroll', onScroll, false));
        });

        if (typeof window !== 'undefined') {
            const onWindowScroll = () => scheduleCallback();
            const onResize = () => scheduleCallback();

            window.addEventListener('scroll', onWindowScroll, false);
            window.addEventListener('resize', onResize, false);
            cleanup.push(() => window.removeEventListener('scroll', onWindowScroll, false));
            cleanup.push(() => window.removeEventListener('resize', onResize, false));

            const viewport = window.visualViewport;

            if (viewport) {
                const onVisualViewportResize = () => scheduleCallback();
                const onVisualViewportScroll = () => scheduleCallback();

                viewport.addEventListener('resize', onVisualViewportResize, false);
                viewport.addEventListener('scroll', onVisualViewportScroll, false);
                cleanup.push(() => viewport.removeEventListener('resize', onVisualViewportResize, false));
                cleanup.push(() => viewport.removeEventListener('scroll', onVisualViewportScroll, false));
            }
        }

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => scheduleCallback());
            let hasObservedTargets = false;

            if (isHTMLElement(reference)) {
                resizeObserver.observe(reference);
                hasObservedTargets = true;
            }

            if (isHTMLElement(floating)) {
                resizeObserver.observe(floating);
                hasObservedTargets = true;
            }

            if (hasObservedTargets) {
                cleanup.push(() => resizeObserver.disconnect());
            }
        }
    }

    return () => {
        cleanup.forEach((fn) => fn());

        if (typeof window !== 'undefined' && frameId !== null && typeof window.cancelAnimationFrame === 'function') {
            window.cancelAnimationFrame(frameId);
            frameId = null;
        }

        if (typeof window !== 'undefined' && loopId !== null && typeof window.cancelAnimationFrame === 'function') {
            window.cancelAnimationFrame(loopId);
            loopId = null;
        }
    };
};
