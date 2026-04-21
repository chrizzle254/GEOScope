'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
}

const analysisNav: NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  { label: 'LLM comparison', href: '/dashboard/llm-comparison' },
  { label: 'Competitors', href: '/dashboard/competitors' },
  { label: 'Convo context', href: '/dashboard/convo-context' },
];

const configNav: NavItem[] = [
  { label: 'Settings', href: '/settings' },
  { label: 'Account', href: '/account' },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Main navigation"
      className="flex h-screen w-52 shrink-0 flex-col border-r-4 border-border bg-background"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 border-b-4 border-border px-4 py-5">
        <span className="text-lg leading-none">🤖</span>
        <span className="text-sm font-bold tracking-tight text-foreground">GEO Visibility</span>
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        {/* Analysis section */}
        <div className="flex flex-col gap-1">
          <span className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground">
            ANALYSIS
          </span>
          {analysisNav.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>

        {/* Config section */}
        <div className="flex flex-col gap-1">
          <span className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground">
            CONFIG
          </span>
          {configNav.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  item: NavItem;
  active: boolean;
}

function NavLink({ item, active }: NavLinkProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        'border-l-4 py-1 pl-3 text-sm transition-colors',
        active
          ? 'border-foreground font-medium text-foreground'
          : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
      )}
    >
      {item.label}
    </Link>
  );
}
