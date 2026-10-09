import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos de Servicio — ClipFlow',
  description: 'Términos de servicio de ClipFlow.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">ClipFlow</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Términos de Servicio</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: octubre 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Descripción del servicio</h2>
            <p>
              ClipFlow es una herramienta personal para publicar los videos cortos del propietario
              en sus propias cuentas de YouTube, TikTok e Instagram. La aplicación facilita la
              conexión con dichas plataformas mediante OAuth y la subida de contenido desde un único
              punto.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Responsabilidad del contenido</h2>
            <p>
              El usuario es responsable del contenido que publica a través de ClipFlow y debe cumplir
              las normas, políticas y condiciones de servicio de cada plataforma (YouTube, TikTok e
              Instagram). ClipFlow no revisa, filtra ni modera los videos subidos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Sin garantías</h2>
            <p>
              El servicio se ofrece tal cual, sin garantías de ningún tipo, explícitas o implícitas.
              No se garantiza disponibilidad continua, ausencia de errores o compatibilidad futura
              con las APIs de terceros. El uso de ClipFlow es bajo entera responsabilidad del
              usuario.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
