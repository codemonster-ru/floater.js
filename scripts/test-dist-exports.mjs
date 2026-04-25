import { createRequire } from 'node:module';
import { access } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const expected = [
  'flip',
  'flipPosition',
  'arrow',
  'shift',
  'offset',
  'autoUpdate',
  'placementTypes',
  'computePosition',
  'getOffsetX',
  'getOffsetY',
  'getPosition',
  'getTopPosition',
  'getTopStartPosition',
  'getTopEndPosition',
  'getRightPosition',
  'getRightStartPosition',
  'getRightEndPosition',
  'getBottomPosition',
  'getBottomStartPosition',
  'getBottomEndPosition',
  'getLeftPosition',
  'getLeftStartPosition',
  'getLeftEndPosition',
  'getArrowPosition',
  'getTopArrowPosition',
  'getRightArrowPosition',
  'getBottomArrowPosition',
  'getLeftArrowPosition',
  'getArrowDifferenceWidth',
  'getArrowDifferenceHeight',
  'getTopElementPosition',
  'getRightElementPosition',
  'getBottomElementPosition',
  'getLeftElementPosition',
  'isVisiblePosition',
];

const assertExports = (mod, label) => {
  for (const key of expected) {
    if (!(key in mod)) {
      throw new Error(`[${label}] missing export: ${key}`);
    }
  }
};

await access(new URL('../dist/index.mjs', import.meta.url));
await access(new URL('../dist/index.cjs', import.meta.url));

const esm = await import('../dist/index.mjs');
const cjs = require('../dist/index.cjs');

assertExports(esm, 'esm');
assertExports(cjs, 'cjs');
