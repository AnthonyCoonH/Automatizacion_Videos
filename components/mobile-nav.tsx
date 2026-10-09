'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Zap, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { navItems } from '@/components/sidebar';
import { cn } from '@/lib/utils';

function Trigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClick}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Abrir menú</span>
    </Button>
  );
}

function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 border-border/60 bg-card p-0">
        <SheetHeader className="border-b border-border/60 px-6 py-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent glow-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            ClipFlow
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

MobileNav.Trigger = Trigger;

export { MobileNav };
