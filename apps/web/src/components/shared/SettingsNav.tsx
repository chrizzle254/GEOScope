'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Brand config', href: '/settings' },
  { label: 'Prompts', href: '/settings/prompts' },
  { label: 'Competitors', href: '/settings/competitors' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings navigation" className="flex gap-0 border-b-4 border-border">
      {tabs.map(({ label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors',
              active
                ? 'border-b-4 -mb-[4px] border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
