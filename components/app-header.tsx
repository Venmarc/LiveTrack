'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/logo';
import MobileNav from '@/components/mobile-nav';
import type { NavItem } from '@/components/mobile-nav';
import { getRoleNavigation } from '@/lib/navigation.mjs';

export default function AppHeader({ role }: { role: string }) {
  const pathname = usePathname();
  const nav = getRoleNavigation(role);

  const primaryItems: NavItem[] = nav
    ? [
        { label: 'Overview', href: nav.overviewHref },
        nav.action,
        { label: 'Track shipment', href: '/#track-shipment' },
      ]
    : [{ label: 'Track shipment', href: '/#track-shipment' }];

  return (
    <header className="relative sticky top-0 z-[var(--layer-sticky)] border-b border-[var(--color-border)] bg-[var(--color-page)]">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={nav ? nav.overviewHref : '/'}
            aria-label={nav ? `LiveTrack — ${nav.label} dashboard` : 'LiveTrack home'}
            className="flex shrink-0 items-center rounded-[var(--radius-control)]"
          >
            <Logo />
          </Link>
          {nav ? (
            <span className="hidden shrink-0 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-subtle)] sm:inline-block">
              {nav.label}
            </span>
          ) : null}
        </div>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center">
            {primaryItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={item.href === pathname ? 'page' : undefined}
                  className="lt-nav-link"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <MobileNav items={primaryItems} pathname={pathname} ariaLabel="Primary menu" />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
