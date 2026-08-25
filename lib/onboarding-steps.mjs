export function getOnboardingSteps(role, context) {
  if (role === 'shipper') {
    return [
      { id: 'book', label: 'Book a shipment', complete: context.shipmentCount > 0 },
      { id: 'claimed', label: 'Get a driver assigned', complete: context.hasShipment },
      { id: 'watch', label: 'Start the live route', complete: context.hasActiveShipment },
    ];
  }

  if (role === 'driver') {
    return [
      { id: 'available', label: 'Review available jobs', complete: context.availableCount > 0 || context.hasShipment },
      { id: 'claim', label: 'Claim a delivery', complete: context.hasShipment },
      { id: 'transit', label: 'Start live transit', complete: context.hasTransitShipment },
    ];
  }

  if (role === 'recipient') {
    return [
      { id: 'find', label: 'Receive a package', complete: context.shipmentCount > 0 },
      { id: 'track', label: 'Get a driver assigned', complete: context.hasShipment },
      { id: 'watch', label: 'Start the live route', complete: context.hasActiveShipment },
    ];
  }

  return [
    { id: 'overview', label: 'Review the network overview', complete: context.shipmentCount > 0 },
    { id: 'active', label: 'Inspect an active route', complete: context.hasActiveShipment },
    { id: 'outcome', label: 'Confirm a delivery outcome', complete: context.hasDeliveredShipment },
  ];
}
