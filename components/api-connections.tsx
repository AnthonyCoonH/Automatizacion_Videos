'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Youtube, Music2, Instagram, Plug, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useConnectedPlatforms, type PlatformId } from '@/lib/connection-store';

type Platform = {
  id: PlatformId;
  name: string;
  icon: typeof Youtube;
  color: string;
  bgGradient: string;
  description: string;
};

const platforms: Platform[] = [
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    icon: Youtube,
    color: 'text-red-500',
    bgGradient: 'from-red-500/20 to-red-500/5',
    description: 'Sube Shorts a tu canal de YouTube automáticamente.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Music2,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 to-cyan-500/5',
    description: 'Publica directamente en tu cuenta de TikTok.',
  },
  {
    id: 'instagram',
    name: 'Instagram Reels',
    icon: Instagram,
    color: 'text-pink-400',
    bgGradient: 'from-pink-500/20 to-pink-500/5',
    description: 'Comparte Reels en tu perfil de Instagram.',
  },
];

export function ApiConnections() {
  const router = useRouter();
  const [connected, connect, disconnect] = useConnectedPlatforms();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (p: Platform) => {
    setConnecting(p.id);
    toast.info('Conectando...', {
      description: `Vinculando con ${p.name}`,
    });
    if (p.id === 'youtube') {
      window.location.href = '/api/auth/youtube/login';
    } else {
      router.push(`/?connected=${p.id}`);
    }
  };

  const handleDisconnect = (p: Platform) => {
    disconnect(p.id);
    toast.warning(`${p.name} desconectado`);
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {platforms.map((p, i) => {
        const isConnected = connected[p.id];
        const Icon = p.icon;
        return (
          <Card
            key={p.id}
            className={cn(
              'group relative overflow-hidden border-border/60 bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:glow-primary',
              'animate-float-in',
              isConnected && 'border-emerald-500/30'
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Glow background */}
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-80', p.bgGradient)} />

            <CardHeader className="relative flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/80', p.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold leading-tight">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">OAuth 2.0</p>
                </div>
              </div>
              <StatusBadge connected={isConnected} />
            </CardHeader>

            <CardContent className="relative">
              <p className="text-sm text-muted-foreground">{p.description}</p>
              {isConnected && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cuenta vinculada
                </div>
              )}
            </CardContent>

            <CardFooter className="relative">
              {isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDisconnect(p)}
                >
                  Desconectar
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full glow-primary"
                  onClick={() => handleConnect(p)}
                  disabled={connecting === p.id}
                >
                  {connecting === p.id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirigiendo...</>
                  ) : (
                    <><Plug className="mr-2 h-4 w-4" /> Conectar mediante OAuth</>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 border-0 font-medium',
        connected
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <span
        className={cn(
          'inline-flex h-2 w-2 rounded-full',
          connected ? 'bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/60' : 'bg-muted-foreground/50'
        )}
      />
      {connected ? 'Conectado' : 'Desconectado'}
    </Badge>
  );
}
