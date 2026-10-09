import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppShell } from '@/components/app-shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClipFlow — Gestión de Videos Cortos',
  description: 'Sube, gestiona y distribuye tus videos cortos a YouTube Shorts, TikTok e Instagram Reels.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
