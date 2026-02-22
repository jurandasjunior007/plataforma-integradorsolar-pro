import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, User, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface NewDealDialogProps {
  open: boolean;
  onClose: () => void;
  stages: { id: string; name: string; position: number }[];
  pipelineId: string;
  onCreateDeal: (input: {
    title: string;
    pipeline_id: string;
    stage_id: string;
    value?: number;
    contact_id?: string;
    organization_id?: string;
  }) => Promise<any>;
}

export function NewDealDialog({ open, onClose, stages, pipelineId, onCreateDeal }: NewDealDialogProps) {
  const { profile } = useAuthContext();
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stageId, setStageId] = useState('');
  const [clientType, setClientType] = useState<'person' | 'org'>('person');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Set default stage
  useEffect(() => {
    if (stages.length > 0 && !stageId) {
      const sorted = [...stages].sort((a, b) => a.position - b.position);
      setStageId(sorted[0].id);
    }
  }, [stages, stageId]);

  // Search contacts/orgs
  useEffect(() => {
    if (!searchTerm.trim() || !profile?.company_id) {
      setContacts([]);
      setOrgs([]);
      return;
    }
    const timeout = setTimeout(async () => {
      if (clientType === 'person') {
        const { data } = await supabase
          .from('contacts')
          .select('id, name')
          .eq('company_id', profile.company_id)
          .is('deleted_at', null)
          .ilike('name', `%${searchTerm}%`)
          .limit(10);
        setContacts(data ?? []);
      } else {
        const { data } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('company_id', profile.company_id)
          .is('deleted_at', null)
          .ilike('name', `%${searchTerm}%`)
          .limit(10);
        setOrgs(data ?? []);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, clientType, profile?.company_id]);

  const handleSelectClient = (id: string, name: string) => {
    if (clientType === 'person') {
      setSelectedContactId(id);
      setSelectedOrgId(null);
    } else {
      setSelectedOrgId(id);
      setSelectedContactId(null);
    }
    setSelectedName(name);
    if (!title) setTitle(name);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onCreateDeal({
        title: title.trim(),
        pipeline_id: pipelineId,
        stage_id: stageId,
        value: value ? parseFloat(value) : undefined,
        contact_id: selectedContactId ?? undefined,
        organization_id: selectedOrgId ?? undefined,
      });
      toast({ title: 'Negócio criado com sucesso' });
      // Reset
      setTitle('');
      setValue('');
      setSelectedContactId(null);
      setSelectedOrgId(null);
      setSelectedName('');
      setSearchTerm('');
      onClose();
    } catch {
      toast({ title: 'Erro ao criar negócio', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const results = clientType === 'person' ? contacts : orgs;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Negócio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client search */}
          <div className="space-y-2">
            <Label className="text-xs">Vincular cliente</Label>
            <Tabs value={clientType} onValueChange={(v) => { setClientType(v as any); setSearchTerm(''); setSelectedContactId(null); setSelectedOrgId(null); setSelectedName(''); }}>
              <TabsList className="h-8">
                <TabsTrigger value="person" className="gap-1 text-xs h-6"><User className="h-3 w-3" />Pessoa</TabsTrigger>
                <TabsTrigger value="org" className="gap-1 text-xs h-6"><Building2 className="h-3 w-3" />Empresa</TabsTrigger>
              </TabsList>
            </Tabs>

            {selectedName ? (
              <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                {clientType === 'person' ? <User className="h-3.5 w-3.5 text-muted-foreground" /> : <Building2 className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="text-sm font-medium flex-1">{selectedName}</span>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setSelectedContactId(null); setSelectedOrgId(null); setSelectedName(''); }}>
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={clientType === 'person' ? 'Buscar pessoa...' : 'Buscar empresa...'}
                  className="pl-8 text-sm"
                />
                {results.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-auto">
                    {results.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => handleSelectClient(r.id, r.name)}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Título do negócio</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Projeto Solar 10kW" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Valor (R$)</Label>
              <Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Etapa inicial</Label>
              <Select value={stageId} onValueChange={setStageId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...stages].sort((a, b) => a.position - b.position).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar negócio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
