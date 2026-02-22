import type { Stage } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Circle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DealChecklistPanelProps {
  stage: Stage;
}

// Mock checklist data per stage
const mockChecklists: Record<string, { title: string; items: { label: string; required: boolean; completed: boolean }[] }[]> = {
  s1: [
    {
      title: 'QUALIFICAÇÃO DO LEAD',
      items: [
        { label: 'Contato inicial realizado', required: true, completed: true },
        { label: 'Necessidade identificada', required: true, completed: true },
        { label: 'Perfil do cliente validado', required: false, completed: false },
      ],
    },
  ],
  s2: [
    {
      title: 'VISITA TÉCNICA',
      items: [
        { label: 'Visita técnica agendada', required: true, completed: true },
        { label: 'Visita técnica realizada', required: true, completed: false },
        { label: 'Fotos do local enviadas', required: true, completed: false },
        { label: 'Conta de energia analisada', required: true, completed: true },
      ],
    },
    {
      title: 'PROPOSTA',
      items: [
        { label: 'Projeto dimensionado', required: true, completed: false },
        { label: 'Proposta gerada', required: true, completed: false },
        { label: 'Proposta enviada ao cliente', required: false, completed: false },
      ],
    },
  ],
  s3: [
    {
      title: 'NEGOCIAÇÃO',
      items: [
        { label: 'Cliente analisou proposta', required: true, completed: false },
        { label: 'Condições comerciais alinhadas', required: true, completed: false },
        { label: 'Financiamento aprovado', required: false, completed: false },
      ],
    },
  ],
};

export function DealChecklistPanel({ stage }: DealChecklistPanelProps) {
  const navigate = useNavigate();
  const blocks = mockChecklists[stage.id] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Processo da etapa
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1 h-7"
          onClick={() => navigate('/admin')}
        >
          <Settings className="h-3 w-3" />
          Configurar
        </Button>
      </div>

      {blocks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum checklist configurado para esta etapa.</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => navigate('/admin')}
            >
              Configurar checklists →
            </Button>
          </CardContent>
        </Card>
      ) : (
        blocks.map((block, bi) => (
          <div key={bi} className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
              {block.title}
            </h4>
            <Card>
              <CardContent className="py-3 px-4 space-y-2.5">
                {block.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-3 text-sm">
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : item.required ? (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                      {item.label}
                    </span>
                    {item.required && !item.completed && (
                      <span className="ml-auto text-[10px] font-medium text-warning">Obrigatório</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
