import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const mobileNavSource = await readFile(
  fileURLToPath(new URL('../components/mobile-nav.tsx', import.meta.url)),
  'utf8',
);

test('mobile menu button exposes disclosure state and target', () => {
  assert.match(mobileNavSource, /aria-expanded=\{open\}/);
  assert.match(mobileNavSource, /aria-controls=\{menuId\}/);
  assert.match(mobileNavSource, /aria-label=\{ariaLabel\}/);
});

test('mobile menu marks the active destination for assistive tech', () => {
  assert.match(mobileNavSource, /aria-current=\{[^}]*'page'/);
});

test('mobile menu closes on Escape and restores focus to the menu button', () => {
  assert.match(mobileNavSource, /'Escape'/);
  assert.match(mobileNavSource, /setOpen\(false\)/);
  assert.match(mobileNavSource, /buttonRef\.current\?\.focus\(\)/);
});

test('mobile menu closes when a destination link is selected', () => {
  assert.match(mobileNavSource, /onClick=\{\(\) => setOpen\(false\)\}/);
});
