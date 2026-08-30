import test from 'node:test';
import assert from 'node:assert/strict';
import { getRoleNavigation, isNavItemActive } from './navigation.mjs';

test('returns the correct overview and primary action for each role', () => {
  assert.equal(getRoleNavigation('shipper').overviewHref, '/dashboard/shipper');
  assert.deepEqual(getRoleNavigation('driver').action, {
    label: 'Deliveries',
    href: '/dashboard/driver#delivery-workspace',
  });
  assert.equal(getRoleNavigation('recipient').action.label, 'My packages');
  assert.equal(getRoleNavigation('admin').action.href, '/dashboard/admin#network-shipments');
});

test('returns null for unknown roles', () => {
  assert.equal(getRoleNavigation('manager'), null);
  assert.equal(getRoleNavigation(null), null);
});

test('marks exact and nested destinations active without matching unrelated routes', () => {
  const shipper = getRoleNavigation('shipper');
  assert.equal(isNavItemActive({ label: 'Overview', href: shipper.overviewHref }, '/dashboard/shipper'), true);
  assert.equal(isNavItemActive({ label: 'Overview', href: shipper.overviewHref }, '/dashboard/shipper/new'), true);
  assert.equal(isNavItemActive({ label: 'Overview', href: shipper.overviewHref }, '/dashboard/driver'), false);
});
