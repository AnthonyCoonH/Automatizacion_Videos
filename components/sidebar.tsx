'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UploadCloud, Plug, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subir', label: 'Subir Clip', icon: UploadCloud },
  { href: '/conexiones', label: 'Conexiones API', icon: Plug },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-card/50 backdrop-blur-xl lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/60 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent glow-primary">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight">ClipFlow</span>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Creator Suite</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary/15 text-primary glow-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0 transition-transform group-hover:scale-110', active && 'text-primary')} />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 p-4">
          <p className="text-sm font-semibold">Plan Creator</p>
          <p className="mt-1 text-xs text-muted-foreground">Subidas ilimitadas simuladas</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>
        </div>
      </div>
    </aside>
  );
}

export { navItems };
