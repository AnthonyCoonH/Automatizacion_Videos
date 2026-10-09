import { Suspense } from 'react';
import Link from 'next/link';
import { UploadCloud, Plug, Film, TrendingUp, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectedToast } from '@/components/connected-toast';
import { DashboardStats } from '@/components/dashboard-stats';

const steps = [
  { title: 'Sube tu clip', desc: 'Arrastra un video vertical MP4 y añade título y hashtags.', icon: UploadCloud },
  { title: 'Conecta tus cuentas', desc: 'Vincula YouTube Shorts, TikTok e Instagram Reels con OAuth.', icon: Plug },
  { title: 'Distribuye automáticamente', desc: 'Publica en todas las plataformas desde un solo lugar.', icon: CheckCircle2 },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Suspense fallback={null}>
        <ConnectedToast />
      </Suspense>

      {/* Hero */}
      <div className="animate-float-in space-y-2">
        <Badge variant="secondary" className="gap-1.5">
          <span className="inline-flex h-2 w-2 rounded-full bg-primary glow-primary" /> Panel de control
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Bienvenido a <span className="text-glow-primary text-primary">ClipFlow</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Gestiona y distribuye tus videos cortos a YouTube Shorts, TikTok e Instagram Reels desde un solo panel.
        </p>
      </div>

      {/* Stats grid (client component for reactive connected count) */}
      <DashboardStats />

      {/* Quick action + steps */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick upload CTA */}
        <Card className="animate-float-in col-span-1 overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 to-accent/5 backdrop-blur lg:row-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Empieza ahora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-[9/16] max-h-[280px] w-full items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5">
              <UploadCloud className="h-10 w-10 text-primary/70" />
            </div>
            <Button asChild className="w-full glow-primary">
              <Link href="/subir">
                <UploadCloud className="mr-2 h-4 w-4" /> Subir un clip
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/conexiones">
                <Plug className="mr-2 h-4 w-4" /> Conectar APIs
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Steps */}
        {steps.map((step, i) => (
          <Card
            key={step.title}
            className="animate-float-in border-border/60 bg-card/50 backdrop-blur transition-all hover:border-primary/40"
            style={{ animationDelay: `${(i + 4) * 80}ms` }}
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">PASO {i + 1}</span>
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="animate-float-in border-border/60 bg-card/40 backdrop-blur">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent glow-primary">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">¿Listo para distribuir tu contenido?</p>
              <p className="text-sm text-muted-foreground">Conecta tus plataformas y empieza a publicar.</p>
            </div>
          </div>
          <Button asChild variant="default" className="glow-primary">
            <Link href="/conexiones">
              Ir a Conexiones <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
