'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import {
  UploadCloud, Film, X, CheckCircle2, Hash, Send, Loader2,
  Youtube, Music2, Instagram, CalendarClock, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Radio } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useConnectedPlatforms, type PlatformId } from '@/lib/connection-store';

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
const ACCEPTED_TYPES: Record<string, string[]> = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
};

const platformLabels: Record<string, string> = {
  youtube: 'YouTube Shorts',
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
};

const platformIcons: Record<PlatformId, typeof Youtube> = {
  youtube: Youtube,
  tiktok: Music2,
  instagram: Instagram,
};

const platformColors: Record<PlatformId, string> = {
  youtube: 'text-red-500',
  tiktok: 'text-cyan-400',
  instagram: 'text-pink-400',
};

type PlatformMetadata = Partial<Record<PlatformId, string>>;

const ALL_PLATFORMS: PlatformId[] = ['youtube', 'tiktok', 'instagram'];

export function ClipUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [globalDescription, setGlobalDescription] = useState('');
  const [perPlatform, setPerPlatform] = useState<PlatformMetadata>({});
  const [customizePerPlatform, setCustomizePerPlatform] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('private');
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const timeZone = typeof window !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : '';
  const todayStr = new Date().toISOString().split('T')[0];
  const scheduledDisplay = scheduleDate && scheduleTime
    ? new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : '';
  const [connected] = useConnectedPlatforms();

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const err = rejected[0].errors[0];
        if (err.code === 'file-too-large') {
          toast.error('Archivo demasiado grande', { description: 'El tamaño máximo es 100 MB.' });
        } else if (err.code === 'file-invalid-type') {
          toast.error('Formato no válido', { description: 'Solo se aceptan archivos MP4 y MOV.' });
        } else {
          toast.error('Error al cargar el archivo', { description: err.message });
        }
        return;
      }
      const f = accepted[0];
      if (!f) return;
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
      toast.success('Video cargado', { description: f.name });
    },
    [title]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    noClick: !!file,
    noKeyboard: true,
  });

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  };

  const connectedPlatforms = (Object.keys(connected) as PlatformId[]).filter(
    (p) => connected[p]
  );

  const resolveDescription = (p: PlatformId): string => {
    const custom = perPlatform[p]?.trim();
    return custom || globalDescription;
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Falta el video', { description: 'Arrastra o selecciona un archivo primero.' });
      return;
    }
    if (!title.trim()) {
      toast.error('Falta el título', { description: 'Añade un título a tu clip.' });
      return;
    }
    if (connectedPlatforms.length === 0) {
      toast.error('Sin plataformas conectadas', {
        description: 'Conecta al menos una plataforma en "Conexiones API" antes de publicar.',
      });
      return;
    }

    let publishAt: string | null = null;

    if (publishMode === 'schedule') {
      if (!scheduleDate || !scheduleTime) {
        toast.error('Fecha y hora requeridas', {
          description: 'Selecciona una fecha y hora para programar la publicación.',
        });
        return;
      }
      const scheduled = new Date(`${scheduleDate}T${scheduleTime}`);
      const minTime = new Date(Date.now() + 15 * 60 * 1000);
      if (scheduled.getTime() < minTime.getTime()) {
        toast.error('Hora no válida', {
          description: 'La fecha y hora deben ser al menos 15 minutos en el futuro.',
        });
        return;
      }
      publishAt = scheduled.toISOString();
    }

    setIsUploading(true);

    try {
      const metadata: Record<string, { title: string; description: string }> = {};
      for (const p of connectedPlatforms) {
        metadata[p] = {
          title,
          description: resolveDescription(p),
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('platforms', JSON.stringify(connectedPlatforms));
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('privacy', privacy);
      if (publishAt) {
        formData.append('publishAt', publishAt);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const failedList = data.results
          ?.filter((r: { success: boolean }) => !r.success)
          .map((r: { platform: string; message: string }) => `${r.platform}: ${r.message}`)
          .join('; ');
        toast.error('Error en la subida', {
          description: failedList || data.message || 'No se pudo procesar el clip.',
        });
        return;
      }

      if (data.results) {
        for (const r of data.results as { platform: string; success: boolean; message: string }[]) {
          if (r.success) {
            const desc = publishMode === 'schedule' && scheduledDisplay
              ? `${r.message} Programado para: ${scheduledDisplay}`
              : r.message;
            toast.success(`${r.platform}: subida exitosa`, { description: desc });
          } else {
            toast.error(`${r.platform}: fallo`, { description: r.message });
          }
        }
      } else {
        const desc = publishMode === 'schedule' && scheduledDisplay
          ? `Programado para: ${scheduledDisplay}`
          : (data.message || `Publicado en ${connectedPlatforms.length} plataforma(s).`);
        toast.success('Clip distribuido correctamente', { description: desc });
      }

      removeFile();
      setTitle('');
      setGlobalDescription('');
      setPerPlatform({});
      setCustomizePerPlatform(false);
      setPrivacy('private');
      setPublishMode('now');
      setScheduleDate('');
      setScheduleTime('');
    } catch {
      toast.error('Error de red', {
        description: 'No se pudo conectar con el servidor.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fmtSize = (b: number) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetForm = () => {
    removeFile();
    setTitle('');
    setGlobalDescription('');
    setPerPlatform({});
    setCustomizePerPlatform(false);
    setPrivacy('private');
    setPublishMode('now');
    setScheduleDate('');
    setScheduleTime('');
  };

  return (
    <form onSubmit={handlePublish} className="space-y-6">
      {/* Drop zone or preview */}
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            'relative flex aspect-[9/16] max-h-[480px] w-full max-w-[300px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all duration-300',
            isDragActive && !isDragReject
              ? 'border-primary bg-primary/10 glow-primary scale-[1.02]'
              : isDragReject
                ? 'border-destructive bg-destructive/10'
                : 'border-border bg-card/40 hover:border-primary/50 hover:bg-card/60'
          )}
        >
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 transition-transform',
              isDragActive && 'scale-110'
            )}
          >
            <UploadCloud
              className={cn(
                'h-8 w-8 transition-colors',
                isDragActive ? 'text-primary' : 'text-primary/70'
              )}
            />
          </div>
          <div className="text-center px-4">
            <p className="font-semibold text-sm">
              {isDragActive ? 'Suelta el video aquí' : 'Arrastra tu video aquí'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">o haz clic para seleccionar</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Film className="h-3 w-3" /> MP4 / MOV · 9:16 vertical · máx 100MB
          </Badge>
          <input {...getInputProps()} />
        </div>
      ) : (
        <div className="w-full max-w-[300px] space-y-3">
          <div className="relative aspect-[9/16] max-h-[480px] overflow-hidden rounded-2xl border border-border bg-black">
            {previewUrl && (
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                controls
                muted
                autoPlay
                loop
              />
            )}
            <button
              type="button"
              onClick={removeFile}
              className="absolute right-2 top-2 z-10 rounded-lg bg-background/80 p-1.5 backdrop-blur transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-background/80 px-2.5 py-1 backdrop-blur">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium">{fmtSize(file.size)}</span>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={removeFile}>
            <X className="mr-2 h-4 w-4" /> Quitar video
          </Button>
        </div>
      )}

      {/* Form fields */}
      <div className="max-w-2xl space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Título del Video</Label>
          <Input
            id="title"
            placeholder="Ej. Mi mejor jugada del día #shorts"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">{title.length}/100 caracteres</p>
        </div>

        {/* Content details section */}
        <div className="space-y-4 rounded-xl border border-border/60 bg-card/30 p-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Detalles del contenido</h3>
          </div>

          {/* Global description */}
          <div className="space-y-2">
            <Label htmlFor="global-desc">Descripción y Hashtags (Global)</Label>
            <div className="relative">
              <Textarea
                id="global-desc"
                placeholder="Descripción del video y hashtags (#gaming #clip #viral...). Este texto se usará en todas las redes conectadas."
                value={globalDescription}
                onChange={(e) => setGlobalDescription(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none pr-16 pb-7"
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground tabular-nums">
                {globalDescription.length}/500
              </span>
            </div>
          </div>

          {/* Per-platform customization toggle */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="customize-toggle"
                className="cursor-pointer text-sm font-medium leading-none"
              >
                Personalizar por plataforma (Opcional)
              </Label>
            </div>
            <Switch
              id="customize-toggle"
              checked={customizePerPlatform}
              onCheckedChange={setCustomizePerPlatform}
            />
          </div>

          {/* Per-platform accordions */}
          {customizePerPlatform && (
            <Accordion type="multiple" className="w-full">
              {ALL_PLATFORMS.map((p) => {
                const Icon = platformIcons[p];
                const isConnected = connected[p];
                const customValue = perPlatform[p] ?? '';
                const willUse = customValue.trim() ? customValue : globalDescription;
                return (
                  <AccordionItem
                    key={p}
                    value={p}
                    className="border-border/40"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <span className="flex items-center gap-2.5">
                        <Icon className={cn('h-4 w-4', platformColors[p])} />
                        <span className="text-sm font-medium">{platformLabels[p]}</span>
                        {isConnected && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" /> Conectada
                          </Badge>
                        )}
                        {customValue.trim() && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/15 text-[10px] text-primary"
                          >
                            Personalizado
                          </Badge>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-1">
                      <Textarea
                        placeholder={
                          globalDescription
                            ? `Hereda del global: "${globalDescription.slice(0, 60)}${globalDescription.length > 60 ? '...' : ''}"`
                            : 'Escribe una descripción específica para esta plataforma...'
                        }
                        value={customValue}
                        onChange={(e) =>
                          setPerPlatform((prev) => ({ ...prev, [p]: e.target.value }))
                        }
                        rows={3}
                        maxLength={500}
                        className="resize-none"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {customValue.trim()
                            ? 'Usará el texto personalizado'
                            : globalDescription.trim()
                              ? 'Heredará el texto global'
                              : 'Sin descripción'}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {customValue.length}/500
                        </span>
                      </div>
                      {customValue.trim() && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setPerPlatform((prev) => {
                              const next = { ...prev };
                              delete next[p];
                              return next;
                            })
                          }
                        >
                          Limpiar y heredar del global
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>

        {/* Scheduling section */}
        <div className="space-y-4 rounded-xl border border-border/60 bg-card/30 p-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Cuándo publicar</h3>
          </div>

          <RadioGroup
            value={publishMode}
            onValueChange={(v) => setPublishMode(v as 'now' | 'schedule')}
            className="flex flex-col gap-3 sm:flex-row sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="now" id="publish-now" />
              <Label htmlFor="publish-now" className="cursor-pointer text-sm font-medium leading-none">
                Publicar ahora
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="schedule" id="publish-schedule" />
              <Label htmlFor="publish-schedule" className="cursor-pointer text-sm font-medium leading-none">
                Programar
              </Label>
            </div>
          </RadioGroup>

          {publishMode === 'schedule' && (
            <div className="space-y-3 rounded-lg border border-border/50 bg-secondary/30 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="schedule-date" className="text-xs">Fecha</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    min={todayStr}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="schedule-time" className="text-xs">Hora</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>Zona horaria: {timeZone}</span>
              </div>
              {scheduledDisplay && (
                <p className="text-xs text-primary">
                  Se publicará el: {scheduledDisplay}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Visibility selector */}
        <div className="space-y-2">
          <Label htmlFor="privacy">Visibilidad</Label>
          <Select value={privacy} onValueChange={(v) => setPrivacy(v as 'public' | 'unlisted' | 'private')}>
            <SelectTrigger id="privacy" className="w-full sm:w-[240px]">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Público</SelectItem>
              <SelectItem value="unlisted">No listado</SelectItem>
              <SelectItem value="private">Privado</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Controla quién puede ver tu video. Por defecto, los videos se suben como privados para que puedas revisarlos antes de publicarlos.
          </p>
        </div>

        {/* Connected platforms summary */}
        {connectedPlatforms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <span className="text-xs font-medium text-emerald-400">Plataformas conectadas:</span>
            {connectedPlatforms.map((p) => (
              <Badge
                key={p}
                variant="outline"
                className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              >
                <CheckCircle2 className="h-3 w-3" /> {platformLabels[p]}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" className="glow-primary" disabled={!file || isUploading}>
            {isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando clip...</>
            ) : publishMode === 'schedule' ? (
              <><CalendarClock className="mr-2 h-4 w-4" /> Programar publicación</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Publicar en plataformas conectadas</>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={resetForm}
          >
            Limpiar
          </Button>
        </div>
      </div>
    </form>
  );
}
