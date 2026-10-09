'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { connectPlatform, type PlatformId } from '@/lib/connection-store';
import { isSupportedProvider } from '@/lib/oauth-config';

const platformNames: Record<string, string> = {
  youtube: 'YouTube Shorts',
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
};

export function ConnectedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected && isSupportedProvider(connected)) {
      handledRef.current = true;
      connectPlatform(connected as PlatformId);
      toast.success(`Cuenta de ${platformNames[connected]} vinculada exitosamente`, {
        description: 'Ya puedes publicar clips en esta plataforma.',
      });
      // Clean the URL
      router.replace('/');
    } else if (error) {
      handledRef.current = true;
      toast.error('Error en la conexión OAuth', {
        description: `Código: ${error}`,
      });
      router.replace('/');
    }
  }, [searchParams, router]);

  return null;
}
