'use client';

import { Film, Plug, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useConnectedPlatforms } from '@/lib/connection-store';

export function DashboardStats() {
  const [connected] = useConnectedPlatforms();
  const connectedCount = ['youtube', 'tiktok', 'instagram'].filter((p) => connected[p]).length;

  const stats = [
    { label: 'Clips subidos', value: '0', icon: Film, accent: 'text-primary' },
    { label: 'Plataformas conectadas', value: `${connectedCount}/3`, icon: Plug, accent: 'text-accent' },
    { label: 'Visualizaciones totales', value: '0', icon: TrendingUp, accent: 'text-emerald-400' },
    { label: 'Próxima subida', value: '—', icon: Clock, accent: 'text-orange-400' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <Card
            key={s.label}
            className="animate-float-in border-border/60 bg-card/50 backdrop-blur"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-secondary ${s.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
