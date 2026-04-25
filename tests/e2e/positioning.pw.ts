import { test, expect } from '@playwright/test';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distMjsPath = path.resolve(__dirname, '../../dist/index.mjs');

type TestServer = {
    baseUrl: string;
    close: () => Promise<void>;
};

type E2EComputeResult = {
    x: number;
    y: number;
    placement: string;
    finite: boolean;
    isAboveReference: boolean;
};

type E2EVisualViewportResult = {
    supported: boolean;
    calls: number;
};

declare global {
    interface Window {
        __runComputeCase: () => Promise<E2EComputeResult>;
        __runAutoUpdateCase: () => Promise<number>;
        __runVisualViewportAutoUpdateCase: () => Promise<E2EVisualViewportResult>;
    }
}

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>floater e2e</title>
  <style>
    body { margin: 0; font-family: sans-serif; }
    #root { position: relative; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import { computePosition, offset, flip, shift, autoUpdate } from '/dist/index.mjs';

    window.__runComputeCase = async () => {
      const reference = document.createElement('div');
      const floating = document.createElement('div');
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const referenceTop = Math.max(Math.floor(viewportHeight - 40), 0);

      reference.style.position = 'fixed';
      reference.style.left = '80px';
      reference.style.top = String(referenceTop) + 'px';
      reference.style.width = '20px';
      reference.style.height = '20px';

      floating.style.position = 'fixed';
      floating.style.width = '180px';
      floating.style.height = '120px';

      document.body.appendChild(reference);
      document.body.appendChild(floating);

      const result = await computePosition(reference, floating, {
        placement: 'bottom',
        strategy: 'fixed',
        middleware: [offset(8), flip({ placements: ['bottom', 'top'] }), shift()],
      });

      const refRect = reference.getBoundingClientRect();

      return {
        x: result.x,
        y: result.y,
        placement: result.placement,
        finite: Number.isFinite(result.x) && Number.isFinite(result.y),
        isAboveReference: result.y < refRect.top,
      };
    };

    window.__runAutoUpdateCase = async () => {
      const parent = document.createElement('div');
      const inner = document.createElement('div');
      const reference = document.createElement('div');
      const floating = document.createElement('div');
      let calls = 0;

      parent.style.position = 'relative';
      parent.style.overflow = 'auto';
      parent.style.width = '280px';
      parent.style.height = '140px';
      parent.style.border = '1px solid #000';
      inner.style.width = '560px';
      inner.style.height = '420px';
      reference.style.position = 'absolute';
      reference.style.left = '200px';
      reference.style.top = '200px';
      reference.style.width = '20px';
      reference.style.height = '20px';
      floating.style.position = 'absolute';
      floating.style.width = '80px';
      floating.style.height = '40px';

      inner.appendChild(reference);
      parent.appendChild(inner);
      parent.appendChild(floating);
      document.body.appendChild(parent);

      const cleanup = autoUpdate(reference, () => {
        calls += 1;
      }, floating);

      parent.scrollTop = 25;
      parent.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));

      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));

      cleanup();

      return calls;
    };

    window.__runVisualViewportAutoUpdateCase = async () => {
      if (!window.visualViewport) {
        return { supported: false, calls: 0 };
      }

      const reference = document.createElement('div');
      const floating = document.createElement('div');
      let calls = 0;

      reference.style.position = 'fixed';
      reference.style.left = '24px';
      reference.style.top = '24px';
      reference.style.width = '20px';
      reference.style.height = '20px';
      floating.style.position = 'fixed';
      floating.style.left = '0';
      floating.style.top = '0';
      floating.style.width = '80px';
      floating.style.height = '40px';

      document.body.appendChild(reference);
      document.body.appendChild(floating);

      const cleanup = autoUpdate(reference, () => {
        calls += 1;
      }, floating);

      window.visualViewport.dispatchEvent(new Event('resize'));
      window.visualViewport.dispatchEvent(new Event('scroll'));

      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));

      cleanup();

      return { supported: true, calls };
    };
  </script>
</body>
</html>`;

const startServer = async (): Promise<TestServer> => {
    const distMjs = await readFile(distMjsPath, 'utf8');

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
        const url = req.url ?? '/';

        if (url === '/case.html' || url === '/') {
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(html);

            return;
        }

        if (url === '/dist/index.mjs') {
            res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
            res.end(distMjs);

            return;
        }

        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('not found');
    });

    await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
    });

    const address = server.address();

    if (!address || typeof address === 'string') {
        throw new Error('failed to start e2e server');
    }

    return {
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: async () => {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });
        },
    };
};

test.describe('floater e2e', () => {
    let testServer: TestServer;

    test.beforeAll(async () => {
        testServer = await startServer();
    });

    test.afterAll(async () => {
        await testServer.close();
    });

    test('computes finite fixed position and flips near viewport bottom', async ({ page }) => {
        await page.goto(`${testServer.baseUrl}/case.html`);

        const result = await page.evaluate(async () => {
            return await window.__runComputeCase();
        });

        expect(result.finite).toBe(true);
        expect(result.placement).toBe('top');
        expect(result.isAboveReference).toBe(true);
    });

    test('autoUpdate reacts to scroll/resize in real browser', async ({ page }) => {
        await page.goto(`${testServer.baseUrl}/case.html`);

        const calls = await page.evaluate(async () => {
            return await window.__runAutoUpdateCase();
        });

        expect(calls).toBeGreaterThan(0);
    });

    test('autoUpdate reacts to visualViewport events on supported browsers', async ({ page }) => {
        await page.goto(`${testServer.baseUrl}/case.html`);

        const result = await page.evaluate(async () => {
            return await window.__runVisualViewportAutoUpdateCase();
        });

        if (!result.supported) {
            expect(result.calls).toBe(0);

            return;
        }

        expect(result.calls).toBeGreaterThan(0);
    });
});
