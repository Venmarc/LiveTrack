const roleNavigation = {
  shipper: {
    label: 'Shipper',
    overviewHref: '/dashboard/shipper',
    action: { label: 'Book shipment', href: '/dashboard/shipper/new' },
  },
  driver: {
    label: 'Driver',
    overviewHref: '/dashboard/driver',
    action: { label: 'Deliveries', href: '/dashboard/driver#delivery-workspace' },
  },
  recipient: {
    label: 'Recipient',
    overviewHref: '/dashboard/recipient',
    action: { label: 'My packages', href: '/dashboard/recipient#my-packages' },
  },
  admin: {
    label: 'Admin',
    overviewHref: '/dashboard/admin',
    action: { label: 'Shipments', href: '/dashboard/admin#network-shipments' },
  },
};

function getRoleNavigation(role) {
  return roleNavigation[role] ?? null;
}

function isNavItemActive(item, pathname) {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export { roleNavigation, getRoleNavigation, isNavItemActive };
