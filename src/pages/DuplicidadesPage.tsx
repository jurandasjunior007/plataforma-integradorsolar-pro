import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, AlertTriangle, Merge, Search, Loader2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useContacts } from '@/hooks/useContacts';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DuplicatePair {
  id1: string;
  id2: string;
  name1: string;
  name2: string;
  type: 'contact' | 'organization';
  score: number;
  matchDetails: string[];
}

function similarity(a: string | null, b: string | null): number {
  if (!a || !b) return 0;
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return 1;
  // Simple Dice coefficient on bigrams
  if (la.length < 2 || lb.length < 2) return la === lb ? 1 : 0;
  const bigramsA = new Set<string>();
  for (let i = 0; i < la.length - 1; i++) bigramsA.add(la.slice(i, i + 2));
  let matches = 0;
  for (let i = 0; i < lb.length - 1; i++) {
    if (bigramsA.has(lb.slice(i, i + 2))) matches++;
  }
  return (2 * matches) / (la.length - 1 + lb.length - 1);
}

function computeScore(
  name1: string | null, name2: string | null,
  email1: string | null, email2: string | null,
  phone1: string | null, phone2: string | null,
  addr1: string | null, addr2: string | null,
): { score: number; details: string[] } {
  const nameSim = similarity(name1, name2) * 40;
  const emailSim = similarity(email1, email2) * 30;
  const phoneSim = similarity(phone1, phone2) * 20;
  const addrSim = similarity(addr1, addr2) * 10;
  const total = nameSim + emailSim + phoneSim + addrSim;
  const details: string[] = [];
  if (nameSim > 20) details.push('Nome similar');
  if (emailSim > 15) details.push('Email similar');
  if (phoneSim > 10) details.push('Telefone similar');
  if (addrSim > 5) details.push('Endereço similar');
  return { score: Math.round(total), details };
}

export default function DuplicidadesPage() {
  const { profile } = useAuthContext();
  const navigate = useNavigate();
  const { contacts, isLoading: loadingContacts } = useContacts({});
  const { organizations, isLoading: loadingOrgs } = useOrganizations({});
  const [typeFilter, setTypeFilter] = useState<'all' | 'contact' | 'organization'>('all');
  const [mergeDialog, setMergeDialog] = useState<{ open: boolean; pair: DuplicatePair | null }>({ open: false, pair: null });
  const [merging, setMerging] = useState(false);

  const duplicates = useMemo(() => {
    const pairs: DuplicatePair[] = [];

    // Contacts
    if (typeFilter !== 'organization') {
      for (let i = 0; i < contacts.length; i++) {
        for (let j = i + 1; j < contacts.length; j++) {
          const c1 = contacts[i], c2 = contacts[j];
          const { score, details } = computeScore(
            c1.full_name ?? c1.name, c2.full_name ?? c2.name,
            c1.email_principal, c2.email_principal,
            c1.phone_principal, c2.phone_principal,
            null, null,
          );
          if (score >= 40) {
            pairs.push({
              id1: c1.id, id2: c2.id,
              name1: c1.full_name ?? c1.name, name2: c2.full_name ?? c2.name,
              type: 'contact', score, matchDetails: details,
            });
          }
        }
      }
    }

    // Organizations
    if (typeFilter !== 'contact') {
      for (let i = 0; i < organizations.length; i++) {
        for (let j = i + 1; j < organizations.length; j++) {
          const o1 = organizations[i], o2 = organizations[j];
          const { score, details } = computeScore(
            o1.legal_name ?? o1.name, o2.legal_name ?? o2.name,
            o1.email_principal, o2.email_principal,
            o1.phone_principal, o2.phone_principal,
            null, null,
          );
          if (score >= 40) {
            pairs.push({
              id1: o1.id, id2: o2.id,
              name1: o1.legal_name ?? o1.name, name2: o2.legal_name ?? o2.name,
              type: 'organization', score, matchDetails: details,
            });
          }
        }
      }
    }

    return pairs.sort((a, b) => b.score - a.score);
  }, [contacts, organizations, typeFilter]);

  const handleMerge = async (pair: DuplicatePair) => {
    if (!profile) return;
    setMerging(true);
    try {
      const primaryId = pair.id1;
      const secondaryId = pair.id2;
      const table = pair.type === 'contact' ? 'contacts' : 'organizations';
      const fkField = pair.type === 'contact' ? 'contact_id' : 'organization_id';

      // Transfer deals
      await supabase.from('deals').update({ [fkField]: primaryId } as any).eq(fkField, secondaryId);
      // Transfer tasks
      if (pair.type === 'contact') {
        await supabase.from('tasks').update({ contact_id: primaryId } as any).eq('contact_id', secondaryId);
      }
      // Soft-delete secondary
      await supabase.from(table).update({ deleted_at: new Date().toISOString(), status_cadastro: 'inativo' } as any).eq('id', secondaryId);

      toast({ title: 'Registros mesclados com sucesso' });
      setMergeDialog({ open: false, pair: null });
    } catch {
      toast({ title: 'Erro ao mesclar registros', variant: 'destructive' });
    } finally {
      setMerging(false);
    }
  };

  const isLoading = loadingContacts || loadingOrgs;

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Copy className="h-6 w-6 text-muted-foreground" />
            Duplicidades
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Identifique e mescle cadastros duplicados automaticamente
          </p>
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="contact">Apenas Pessoas</SelectItem>
            <SelectItem value="organization">Apenas Empresas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : duplicates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <Copy className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">Nenhuma duplicata encontrada 🎉</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{duplicates.length} possível(is) duplicata(s) encontrada(s)</p>
          {duplicates.map((pair, idx) => (
            <Card key={idx} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {pair.type === 'contact' ? 'Pessoa' : 'Empresa'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{pair.matchDetails.join(' • ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium truncate">{pair.name1}</span>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="text-sm font-medium truncate">{pair.name2}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center">
                      <p className="text-lg font-bold">{pair.score}%</p>
                      <Progress value={pair.score} className="w-20 h-1.5" />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => setMergeDialog({ open: true, pair })}
                    >
                      <Merge className="h-3.5 w-3.5" />
                      Mesclar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={mergeDialog.open} onOpenChange={(o) => !o && setMergeDialog({ open: false, pair: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Mesclagem</DialogTitle>
          </DialogHeader>
          {mergeDialog.pair && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                O registro <strong>"{mergeDialog.pair.name1}"</strong> será mantido como principal.
                Todos os negócios, tarefas e documentos de <strong>"{mergeDialog.pair.name2}"</strong> serão
                transferidos e o registro secundário será marcado como inativo.
              </p>
              <div className="bg-amber-500/10 rounded-lg p-3 text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Esta ação não pode ser desfeita facilmente. Confirme que os registros são realmente duplicados.</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialog({ open: false, pair: null })}>Cancelar</Button>
            <Button onClick={() => mergeDialog.pair && handleMerge(mergeDialog.pair)} disabled={merging}>
              {merging ? 'Mesclando...' : 'Confirmar Mesclagem'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
