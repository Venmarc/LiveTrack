import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { getRoleNavigation } from './navigation.mjs';

const readComponent = (name) =>
  readFile(fileURLToPath(new URL(`../components/${name}`, import.meta.url)), 'utf8');

test('navigation configuration defines every role action label', () => {
  assert.equal(getRoleNavigation('shipper').action.label, 'Book shipment');
  assert.equal(getRoleNavigation('driver').action.label, 'Deliveries');
  assert.equal(getRoleNavigation('recipient').action.label, 'My packages');
  assert.equal(getRoleNavigation('admin').action.label, 'Shipments');
});

test('public header renders public destinations and auth actions', async () => {
  const source = await readComponent('public-header.tsx');
  assert.match(source, /Track shipment/);
  assert.match(source, /Sign in/);
  assert.match(source, /Create account/);
  assert.match(source, /Dashboard/);
});

test('app header renders overview, tracking, and account controls', async () => {
  const source = await readComponent('app-header.tsx');
  assert.match(source, /Overview/);
  assert.match(source, /Track shipment/);
  assert.match(source, /UserButton/);
});

test('landing header delegates to the shared public header', async () => {
  const source = await readComponent('landing-header.tsx');
  assert.match(source, /public-header/);
});
