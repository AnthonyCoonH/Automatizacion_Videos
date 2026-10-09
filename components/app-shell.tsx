'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <MobileNav.Trigger onClick={() => setMobileOpen(true)} />
          <div className="flex-1" />
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60" />
            Sistema operativo
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export { toast };
