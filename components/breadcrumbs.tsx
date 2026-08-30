import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isCurrent = index === lastIndex;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {isCurrent ? (
                <span aria-current="page" className="font-semibold text-[var(--color-text)]">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="rounded-[var(--radius-control)] py-1 font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="py-1 text-[var(--color-text-muted)]">{item.label}</span>
              )}
              {!isCurrent ? (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-subtle)]"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type { BreadcrumbItem };
