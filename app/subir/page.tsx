import { UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClipUploader } from '@/components/clip-uploader';

export default function SubirClipPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="animate-float-in space-y-2">
        <Badge variant="secondary" className="gap-1.5">
          <UploadCloud className="h-3 w-3 text-primary" /> Nueva subida
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Subir Clip</h1>
        <p className="text-muted-foreground">
          Selecciona un video vertical (9:16) en formato MP4 y rellena los metadatos.
        </p>
      </div>
      <div className="animate-float-in flex flex-col items-center gap-8 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur md:p-8">
        <ClipUploader />
      </div>
    </div>
  );
}
