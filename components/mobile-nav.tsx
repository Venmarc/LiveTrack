'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

type NavItem = { label: string; href: string };

export default function MobileNav({
  items,
  pathname,
  ariaLabel,
}: {
  items: NavItem[];
  pathname: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function isActive(item: NavItem) {
    const [path, hash] = item.href.split('#');
    if (!path || path === '/' || hash !== undefined) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="lt-control inline-flex items-center gap-2 px-3 text-sm font-medium"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        Menu
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <nav
          id={menuId}
          aria-label={ariaLabel}
          className="lt-mobile-menu absolute inset-x-0 top-full z-[var(--layer-dropdown)]"
        >
          <ul className="space-y-1 px-[var(--space-2)] py-[var(--space-2)]">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive(item) ? 'page' : undefined}
                  className={`lt-mobile-link ${isActive(item) ? 'lt-mobile-link--active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

export type { NavItem };
