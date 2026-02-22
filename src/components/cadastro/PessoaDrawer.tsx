import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CpfInput } from './CpfInput';
import { PhoneInput } from './PhoneInput';
import { OwnerSelect } from './OwnerSelect';
import { AddressForm } from './AddressForm';
import { ContactChannelList } from './ContactChannelList';
import { AuditTimeline } from './AuditTimeline';
import { useAddresses } from '@/hooks/useAddresses';
import { useContactChannels } from '@/hooks/useContactChannels';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ContactRow } from '@/hooks/useContacts';
import { toast } from 'sonner';

interface PessoaDrawerProps {
  open: boolean;
  onClose: () => void;
  contact?: ContactRow | null;
  onSave: (data: Partial<ContactRow>) => void;
}

export function PessoaDrawer({ open, onClose, contact, onSave }: PessoaDrawerProps) {
  const { profile } = useAuthContext();
  const isEdit = !!contact?.id;

  const [form, setForm] = useState({
    full_name: '',
    cpf: '',
    rg: '',
    birth_date: '',
    email_principal: '',
    phone_principal: '',
    whatsapp_principal: '',
    owner_user_id: profile?.id ?? '',
    notes: '',
  });

  useEffect(() => {
    if (contact) {
      setForm({
        full_name: contact.full_name ?? contact.name ?? '',
        cpf: contact.cpf ?? '',
        rg: (contact as any).rg ?? '',
        birth_date: (contact as any).birth_date ?? '',
        email_principal: contact.email_principal ?? '',
        phone_principal: contact.phone_principal ?? '',
        whatsapp_principal: contact.whatsapp_principal ?? '',
        owner_user_id: contact.owner_user_id ?? profile?.id ?? '',
        notes: contact.notes ?? '',
      });
    } else {
      setForm({
        full_name: '', cpf: '', rg: '', birth_date: '',
        email_principal: '', phone_principal: '', whatsapp_principal: '',
        owner_user_id: profile?.id ?? '', notes: '',
      });
    }
  }, [contact, profile?.id]);

  const { addresses, upsertAddress, deleteAddress } = useAddresses('contact', contact?.id);
  const { channels, upsertChannel, deleteChannel } = useContactChannels('contact', contact?.id);

  const handleSubmit = () => {
    if (!form.full_name.trim()) { toast.error('Nome é obrigatório'); return; }
    if (!form.phone_principal && !form.email_principal) { toast.error('Informe pelo menos um telefone ou email'); return; }
    if (!form.owner_user_id) { toast.error('Selecione o responsável'); return; }

    onSave({
      ...(isEdit ? { id: contact!.id, before: contact } : {}),
      ...form,
    } as any);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar Pessoa' : 'Nova Pessoa'}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="enderecos" disabled={!isEdit}>Endereços</TabsTrigger>
            <TabsTrigger value="contatos" disabled={!isEdit}>Contatos</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
            <TabsTrigger value="historico" disabled={!isEdit}>Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <div>
              <Label>Nome completo *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CPF</Label><CpfInput value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} /></div>
              <div><Label>RG</Label><Input value={form.rg} onChange={(e) => setForm({ ...form, rg: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Data de nascimento</Label><Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email_principal} onChange={(e) => setForm({ ...form, email_principal: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Telefone *</Label><PhoneInput value={form.phone_principal} onChange={(v) => setForm({ ...form, phone_principal: v })} /></div>
              <div><Label>WhatsApp</Label><PhoneInput value={form.whatsapp_principal} onChange={(v) => setForm({ ...form, whatsapp_principal: v })} /></div>
            </div>
            <div>
              <Label>Responsável *</Label>
              <OwnerSelect value={form.owner_user_id} onChange={(v) => setForm({ ...form, owner_user_id: v })} />
            </div>
            <Button onClick={handleSubmit} className="w-full">{isEdit ? 'Salvar alterações' : 'Criar pessoa'}</Button>
          </TabsContent>

          <TabsContent value="enderecos" className="mt-4">
            {isEdit && (
              <AddressForm
                addresses={addresses}
                onSave={(addr) => upsertAddress.mutate(addr as any)}
                onDelete={(id) => deleteAddress.mutate(id)}
                entityType="contact"
                entityId={contact!.id}
              />
            )}
          </TabsContent>

          <TabsContent value="contatos" className="mt-4">
            {isEdit && (
              <ContactChannelList
                channels={channels}
                onSave={(ch) => upsertChannel.mutate(ch as any)}
                onDelete={(id) => deleteChannel.mutate(id)}
                entityType="contact"
                entityId={contact!.id}
              />
            )}
          </TabsContent>

          <TabsContent value="notas" className="mt-4">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anotações sobre esta pessoa..."
              rows={8}
            />
            {isEdit && <Button className="mt-2" onClick={handleSubmit}>Salvar notas</Button>}
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            {isEdit && <AuditTimeline entityType="contact" entityId={contact!.id} />}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
