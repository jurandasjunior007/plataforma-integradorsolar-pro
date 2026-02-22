import { useState } from 'react';
import { useContacts, ContactRow } from '@/hooks/useContacts';
import { useProfiles } from '@/hooks/useProfiles';
import { PessoaDrawer } from '@/components/cadastro/PessoaDrawer';
import { StatusBadge } from '@/components/cadastro/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { formatCpfDisplay } from '@/lib/masks';
import { maskPhone } from '@/lib/masks';
import { toast } from 'sonner';

export default function PessoasPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<ContactRow | null>(null);

  const { contacts, isLoading, createContact, updateContact, softDeleteContact } = useContacts({ search, status: statusFilter });
  const { data: profiles } = useProfiles();

  const getOwnerName = (id: string | null) => {
    if (!id) return '—';
    return profiles?.find(p => p.id === id)?.full_name ?? '—';
  };

  const handleSave = (data: any) => {
    if (data.id) {
      updateContact.mutate(data, { onSuccess: () => toast.success('Pessoa atualizada') });
    } else {
      createContact.mutate(data, { onSuccess: () => toast.success('Pessoa criada') });
    }
  };

  const handleDelete = (contact: ContactRow) => {
    if (confirm('Deseja inativar/excluir esta pessoa?')) {
      softDeleteContact.mutate({ id: contact.id, before: contact }, { onSuccess: () => toast.success('Pessoa excluída') });
    }
  };

  return (
    <div className="flex-1 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pessoas</h1>
        <Button onClick={() => { setSelected(null); setDrawerOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Nova Pessoa</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome, CPF ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : contacts.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma pessoa encontrada</TableCell></TableRow>
            ) : contacts.map((c) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => { setSelected(c); setDrawerOpen(true); }}>
                <TableCell className="font-medium">{c.full_name ?? c.name}</TableCell>
                <TableCell className="text-muted-foreground">{formatCpfDisplay(c.cpf)}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone_principal ? maskPhone(c.phone_principal) : '—'}</TableCell>
                <TableCell className="text-muted-foreground">{c.email_principal ?? '—'}</TableCell>
                <TableCell>{getOwnerName(c.owner_user_id)}</TableCell>
                <TableCell><StatusBadge status={c.status_cadastro} /></TableCell>
                <TableCell>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => { setSelected(c); setDrawerOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PessoaDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} contact={selected} onSave={handleSave} />
    </div>
  );
}
