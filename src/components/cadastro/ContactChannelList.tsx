import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ChannelRow } from '@/hooks/useContactChannels';
import { Plus, Trash2 } from 'lucide-react';

const CHANNEL_TYPES = [
  { value: 'phone', label: 'Telefone' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

interface ContactChannelListProps {
  channels: ChannelRow[];
  onSave: (channel: Partial<ChannelRow>) => void;
  onDelete: (id: string) => void;
  entityType: string;
  entityId: string;
}

export function ContactChannelList({ channels, onSave, onDelete, entityType, entityId }: ContactChannelListProps) {
  const [editing, setEditing] = useState<Partial<ChannelRow> | null>(null);

  const startNew = () => {
    setEditing({ entity_type: entityType, entity_id: entityId, channel_type: 'phone', value: '', is_primary: false });
  };

  const handleSave = () => {
    if (!editing?.value) return;
    onSave(editing);
    setEditing(null);
  };

  return (
    <div className="space-y-3">
      {channels.map((ch) => (
        <div key={ch.id} className="flex items-center justify-between border rounded-lg p-3 text-sm">
          <div>
            <span className="font-medium capitalize">{CHANNEL_TYPES.find(t => t.value === ch.channel_type)?.label ?? ch.channel_type}</span>
            {ch.is_primary && <span className="text-xs text-primary ml-1">(Principal)</span>}
            <p className="text-muted-foreground">{ch.value}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(ch)}>Editar</Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(ch.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      ))}

      {editing ? (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={editing.channel_type ?? 'phone'} onValueChange={(v) => setEditing({ ...editing, channel_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHANNEL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor</Label>
              <Input value={editing.value ?? ''} onChange={(e) => setEditing({ ...editing, value: e.target.value })} placeholder="Telefone, email ou WhatsApp" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={editing.is_primary ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_primary: v })} />
            <Label>Principal</Label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={startNew} className="w-full"><Plus className="h-4 w-4 mr-1" /> Adicionar contato</Button>
      )}
    </div>
  );
}
