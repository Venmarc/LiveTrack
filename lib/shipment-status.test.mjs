import test from 'node:test';
import assert from 'node:assert/strict';
import { getShipmentStatusPresentation, shipmentStatusPresentation } from './shipment-status.mjs';

test('uses one semantic presentation for every shipment lifecycle status', () => {
  assert.deepEqual(Object.keys(shipmentStatusPresentation), [
    'pending',
    'assigned',
    'picked_up',
    'in_transit',
    'delayed',
    'delivered',
    'cancelled',
  ]);

  for (const presentation of Object.values(shipmentStatusPresentation)) {
    assert.match(presentation.className, /var\(--color-/);
    assert.equal(/blue|purple|emerald|indigo|teal|rose/.test(presentation.className), false);
  }
});

test('formats unknown lifecycle statuses without throwing', () => {
  assert.deepEqual(getShipmentStatusPresentation('awaiting_review'), {
    label: 'awaiting review',
    className: 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]',
  });
});
