import { useState } from 'react';
import { useOrganizations, OrganizationRow } from '@/hooks/useOrganizations';
import { useProfiles } from '@/hooks/useProfiles';
import { EmpresaDrawer } from '@/components/cadastro/EmpresaDrawer';
import { StatusBadge } from '@/components/cadastro/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { formatCnpjDisplay, maskPhone } from '@/lib/masks';
import { toast } from 'sonner';

export default function EmpresasPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<OrganizationRow | null>(null);

  const { organizations, isLoading, createOrganization, updateOrganization, softDeleteOrganization } = useOrganizations({ search, status: statusFilter });
  const { data: profiles } = useProfiles();

  const getOwnerName = (id: string | null) => {
    if (!id) return '—';
    return profiles?.find(p => p.id === id)?.full_name ?? '—';
  };

  const handleSave = (data: any) => {
    if (data.id) {
      updateOrganization.mutate(data, { onSuccess: () => toast.success('Empresa atualizada') });
    } else {
      createOrganization.mutate(data, { onSuccess: () => toast.success('Empresa criada') });
    }
  };

  const handleDelete = (org: OrganizationRow) => {
    if (confirm('Deseja inativar/excluir esta empresa?')) {
      softDeleteOrganization.mutate({ id: org.id, before: org }, { onSuccess: () => toast.success('Empresa excluída') });
    }
  };

  return (
    <div className="flex-1 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Button onClick={() => { setSelected(null); setDrawerOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Nova Empresa</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por razão social, CNPJ ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : organizations.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma empresa encontrada</TableCell></TableRow>
            ) : organizations.map((org) => (
              <TableRow key={org.id} className="cursor-pointer" onClick={() => { setSelected(org); setDrawerOpen(true); }}>
                <TableCell className="font-medium">{org.legal_name ?? org.name}</TableCell>
                <TableCell className="text-muted-foreground">{formatCnpjDisplay(org.cnpj)}</TableCell>
                <TableCell className="text-muted-foreground">{org.phone_principal ? maskPhone(org.phone_principal) : '—'}</TableCell>
                <TableCell className="text-muted-foreground">{org.segment ?? '—'}</TableCell>
                <TableCell>{getOwnerName(org.owner_user_id)}</TableCell>
                <TableCell><StatusBadge status={org.status_cadastro} /></TableCell>
                <TableCell>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => { setSelected(org); setDrawerOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(org)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EmpresaDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} organization={selected} onSave={handleSave} />
    </div>
  );
}
