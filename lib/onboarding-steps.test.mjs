import assert from 'node:assert/strict';
import test from 'node:test';
import { getOnboardingSteps } from './onboarding-steps.mjs';

test('driver onboarding completes its transit step only after live transit starts', () => {
  const steps = getOnboardingSteps('driver', {
    availableCount: 1,
    hasShipment: true,
    hasTransitShipment: false,
  });

  assert.equal(steps[0].complete, true);
  assert.equal(steps[1].complete, true);
  assert.equal(steps[2].complete, false);
});

test('shipper onboarding starts with booking when the account has no shipments', () => {
  const steps = getOnboardingSteps('shipper', {
    shipmentCount: 0,
    hasShipment: false,
    hasActiveShipment: false,
  });

  assert.deepEqual(steps.map((step) => step.complete), [false, false, false]);
});
