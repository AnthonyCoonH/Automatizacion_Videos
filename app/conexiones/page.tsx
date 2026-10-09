import { Plug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ApiConnections } from '@/components/api-connections';

export default function ConexionesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="animate-float-in space-y-2">
        <Badge variant="secondary" className="gap-1.5">
          <Plug className="h-3 w-3 text-accent" /> Integraciones
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Conexiones API</h1>
        <p className="text-muted-foreground">
          Vincula tus cuentas para publicar clips automáticamente. La conexión se realiza mediante OAuth 2.0 de forma segura.
        </p>
      </div>
      <div className="animate-float-in">
        <ApiConnections />
      </div>
    </div>
  );
}
