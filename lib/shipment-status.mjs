export const shipmentStatusPresentation = {
  pending: {
    label: 'Pending',
    className: 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]',
  },
  assigned: {
    label: 'Assigned',
    className: 'border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-accent-hover)]',
  },
  picked_up: {
    label: 'Picked up',
    className: 'border-[color-mix(in_srgb,var(--color-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]',
  },
  in_transit: {
    label: 'In transit',
    className: 'border-[color-mix(in_srgb,var(--color-map)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-map)_12%,transparent)] text-[var(--color-map)]',
  },
  delayed: {
    label: 'Delayed',
    className: 'border-[color-mix(in_srgb,var(--color-danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]',
  },
  delivered: {
    label: 'Delivered',
    className: 'border-[color-mix(in_srgb,var(--color-success)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-placeholder)]',
  },
};

export function getShipmentStatusPresentation(status) {
  return shipmentStatusPresentation[status] ?? {
    label: status.replaceAll('_', ' '),
    className: 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]',
  };
}
