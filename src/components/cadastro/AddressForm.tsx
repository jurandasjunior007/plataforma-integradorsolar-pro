import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CepInput } from './CepInput';
import { Switch } from '@/components/ui/switch';
import type { AddressRow } from '@/hooks/useAddresses';
import { Plus, Trash2 } from 'lucide-react';

const LABELS = ['Instalação', 'Cobrança', 'Residencial', 'Comercial', 'Outro'];
const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

interface AddressFormProps {
  addresses: AddressRow[];
  onSave: (address: Partial<AddressRow>) => void;
  onDelete: (id: string) => void;
  entityType: string;
  entityId: string;
}

export function AddressForm({ addresses, onSave, onDelete, entityType, entityId }: AddressFormProps) {
  const [editing, setEditing] = useState<Partial<AddressRow> | null>(null);

  const startNew = () => {
    setEditing({
      entity_type: entityType,
      entity_id: entityId,
      label: 'Instalação',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      is_primary: addresses.length === 0,
    });
  };

  const handleSave = () => {
    if (!editing) return;
    onSave(editing);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div key={addr.id} className="border rounded-lg p-3 space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium">{addr.label} {addr.is_primary && <span className="text-xs text-primary">(Principal)</span>}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing(addr)}>Editar</Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(addr.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            {[addr.street, addr.number, addr.complement, addr.neighborhood].filter(Boolean).join(', ')}
          </p>
          <p className="text-muted-foreground">{[addr.city, addr.state].filter(Boolean).join(' - ')} {addr.cep && `• CEP: ${addr.cep}`}</p>
        </div>
      ))}

      {editing ? (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={editing.label ?? ''} onValueChange={(v) => setEditing({ ...editing, label: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>CEP</Label>
              <CepInput value={editing.cep ?? ''} onChange={(v) => setEditing({ ...editing, cep: v })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label>Rua</Label>
              <Input value={editing.street ?? ''} onChange={(e) => setEditing({ ...editing, street: e.target.value })} />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={editing.number ?? ''} onChange={(e) => setEditing({ ...editing, number: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Complemento</Label>
              <Input value={editing.complement ?? ''} onChange={(e) => setEditing({ ...editing, complement: e.target.value })} />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={editing.neighborhood ?? ''} onChange={(e) => setEditing({ ...editing, neighborhood: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cidade</Label>
              <Input value={editing.city ?? ''} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={editing.state ?? ''} onValueChange={(v) => setEditing({ ...editing, state: v })}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={editing.is_primary ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_primary: v })} />
            <Label>Endereço principal</Label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={startNew} className="w-full"><Plus className="h-4 w-4 mr-1" /> Adicionar endereço</Button>
      )}
    </div>
  );
}
