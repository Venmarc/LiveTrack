'use client';

import { ClerkProvider, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/logo';
import MobileNav from '@/components/mobile-nav';
import type { NavItem } from '@/components/mobile-nav';

const trackShipmentItem: NavItem = { label: 'Track shipment', href: '/#track-shipment' };

function PublicHeaderInner() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  const primaryItems: NavItem[] = isSignedIn
    ? [trackShipmentItem, { label: 'Dashboard', href: '/onboard' }]
    : [trackShipmentItem];

  return (
    <header className="relative sticky top-0 z-[var(--layer-sticky)] border-b border-[var(--color-border)] bg-[var(--color-page)]">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-5 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center rounded-[var(--radius-control)]">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center">
            {primaryItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="lt-nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button type="button" className="lt-control inline-flex items-center px-4 text-sm font-medium">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="lt-primary-action hidden items-center px-4 text-sm sm:inline-flex"
                >
                  Create account
                </button>
              </SignUpButton>
            </>
          ) : (
            <Link href="/onboard" className="lt-control inline-flex items-center px-4 text-sm font-medium">
              Dashboard
            </Link>
          )}
          <MobileNav items={primaryItems} pathname={pathname} ariaLabel="Primary menu" />
          {isSignedIn ? <UserButton /> : null}
        </div>
      </div>
    </header>
  );
}

export default function PublicHeader() {
  return (
    <ClerkProvider>
      <PublicHeaderInner />
    </ClerkProvider>
  );
}
