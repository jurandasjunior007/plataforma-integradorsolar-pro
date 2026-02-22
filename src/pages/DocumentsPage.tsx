import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Send, CheckCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockDocs = [
  { id: '1', name: 'Proposta - Projeto Solar 10kW', type: 'proposal', status: 'draft', date: '2026-02-20' },
  { id: '2', name: 'Contrato - Maria Silva', type: 'contract', status: 'sent', date: '2026-02-18' },
  { id: '3', name: 'Proposta - Empresa ABC', type: 'proposal', status: 'signed', date: '2026-02-15' },
  { id: '4', name: 'Contrato - João Santos', type: 'contract', status: 'cancelled', date: '2026-02-10' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  draft: { label: 'Rascunho', variant: 'secondary', icon: FileText },
  sent: { label: 'Enviado', variant: 'default', icon: Send },
  signed: { label: 'Assinado', variant: 'outline', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: X },
};

export default function DocumentsPage() {
  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Documentos</h1>
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Novo documento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockDocs.map((doc) => {
            const cfg = statusConfig[doc.status];
            const Icon = cfg.icon;
            return (
              <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{doc.type === 'proposal' ? 'Proposta' : 'Contrato'}</p>
                      </div>
                    </div>
                    <Badge variant={cfg.variant} className="gap-1 text-xs">
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString('pt-BR')}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
