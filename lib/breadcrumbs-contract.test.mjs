import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const breadcrumbsSource = await readFile(
  fileURLToPath(new URL('../components/breadcrumbs.tsx', import.meta.url)),
  'utf8',
);

test('breadcrumbs render inside a labeled navigation landmark', () => {
  assert.match(breadcrumbsSource, /aria-label="Breadcrumb"/);
  assert.match(breadcrumbsSource, /<ol/);
});

test('only non-final items with hrefs render as links', () => {
  assert.match(breadcrumbsSource, /isCurrent \? \(/);
  assert.match(breadcrumbsSource, /item\.href \? \(/);
});

test('the current location is announced with aria-current', () => {
  assert.match(breadcrumbsSource, /aria-current="page"/);
});

test('separators are hidden from assistive technology', () => {
  assert.match(breadcrumbsSource, /aria-hidden="true"/);
});
