import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad — ClipFlow',
  description: 'Política de privacidad de ClipFlow.',
};

export default function PrivacidadPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Política de Privacidad</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: octubre 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Uso de tokens de acceso</h2>
            <p>
              ClipFlow solo utiliza los tokens de acceso OAuth para publicar los videos que el
              usuario elige. Estos tokens se obtienen directamente de cada plataforma mediante el
              flujo oficial de autorización y se usan exclusivamente para subir contenido a las
              cuentas del propio usuario.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Sin almacenamiento de videos</h2>
            <p>
              ClipFlow no almacena videos en servidores propios. Los archivos se transmiten
              directamente desde el dispositivo del usuario a la plataforma de destino seleccionada.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. No venta ni compartición de datos</h2>
            <p>
              ClipFlow no vende ni comparte datos personales con terceros. La información de
              autenticación se mantiene de forma privada y segura, accesible únicamente para el
              funcionamiento del servicio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Revocación de acceso</h2>
            <p>
              El usuario puede revocar el acceso en cualquier momento desde la configuración de
              seguridad de Google, TikTok o Meta. Una vez revocado, ClipFlow deja de tener
              permiso para interactuar con la cuenta correspondiente.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Contacto</h2>
            <p>
              Para consultas relacionadas con la privacidad o el tratamiento de datos, puedes
              contactar a través del correo del propietario de la aplicación.
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
