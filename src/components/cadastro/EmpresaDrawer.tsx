import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CnpjInput } from './CnpjInput';
import { PhoneInput } from './PhoneInput';
import { OwnerSelect } from './OwnerSelect';
import { AddressForm } from './AddressForm';
import { ContactChannelList } from './ContactChannelList';
import { AuditTimeline } from './AuditTimeline';
import { useAddresses } from '@/hooks/useAddresses';
import { useContactChannels } from '@/hooks/useContactChannels';
import { useAuthContext } from '@/contexts/AuthContext';
import type { OrganizationRow } from '@/hooks/useOrganizations';
import { toast } from 'sonner';

interface EmpresaDrawerProps {
  open: boolean;
  onClose: () => void;
  organization?: OrganizationRow | null;
  onSave: (data: Partial<OrganizationRow>) => void;
}

export function EmpresaDrawer({ open, onClose, organization, onSave }: EmpresaDrawerProps) {
  const { profile } = useAuthContext();
  const isEdit = !!organization?.id;

  const [form, setForm] = useState({
    legal_name: '',
    trade_name: '',
    cnpj: '',
    state_registration_ie: '',
    email_principal: '',
    phone_principal: '',
    whatsapp_principal: '',
    owner_user_id: profile?.id ?? '',
    segment: '',
    notes: '',
  });

  useEffect(() => {
    if (organization) {
      setForm({
        legal_name: organization.legal_name ?? organization.name ?? '',
        trade_name: organization.trade_name ?? '',
        cnpj: organization.cnpj ?? '',
        state_registration_ie: organization.state_registration_ie ?? '',
        email_principal: organization.email_principal ?? '',
        phone_principal: organization.phone_principal ?? '',
        whatsapp_principal: organization.whatsapp_principal ?? '',
        owner_user_id: organization.owner_user_id ?? profile?.id ?? '',
        segment: organization.segment ?? '',
        notes: organization.notes ?? '',
      });
    } else {
      setForm({
        legal_name: '', trade_name: '', cnpj: '', state_registration_ie: '',
        email_principal: '', phone_principal: '', whatsapp_principal: '',
        owner_user_id: profile?.id ?? '', segment: '', notes: '',
      });
    }
  }, [organization, profile?.id]);

  const { addresses, upsertAddress, deleteAddress } = useAddresses('organization', organization?.id);
  const { channels, upsertChannel, deleteChannel } = useContactChannels('organization', organization?.id);

  const handleSubmit = () => {
    if (!form.legal_name.trim()) { toast.error('Razão social é obrigatória'); return; }
    if (!form.owner_user_id) { toast.error('Selecione o responsável'); return; }

    onSave({
      ...(isEdit ? { id: organization!.id, before: organization } : {}),
      ...form,
    } as any);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar Empresa' : 'Nova Empresa'}</SheetTitle>
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
              <Label>Razão social *</Label>
              <Input value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} />
            </div>
            <div>
              <Label>Nome fantasia</Label>
              <Input value={form.trade_name} onChange={(e) => setForm({ ...form, trade_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CNPJ</Label><CnpjInput value={form.cnpj} onChange={(v) => setForm({ ...form, cnpj: v })} /></div>
              <div><Label>Inscrição Estadual</Label><Input value={form.state_registration_ie} onChange={(e) => setForm({ ...form, state_registration_ie: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={form.email_principal} onChange={(e) => setForm({ ...form, email_principal: e.target.value })} /></div>
              <div><Label>Segmento</Label><Input value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Telefone</Label><PhoneInput value={form.phone_principal} onChange={(v) => setForm({ ...form, phone_principal: v })} /></div>
              <div><Label>WhatsApp</Label><PhoneInput value={form.whatsapp_principal} onChange={(v) => setForm({ ...form, whatsapp_principal: v })} /></div>
            </div>
            <div>
              <Label>Responsável *</Label>
              <OwnerSelect value={form.owner_user_id} onChange={(v) => setForm({ ...form, owner_user_id: v })} />
            </div>
            <Button onClick={handleSubmit} className="w-full">{isEdit ? 'Salvar alterações' : 'Criar empresa'}</Button>
          </TabsContent>

          <TabsContent value="enderecos" className="mt-4">
            {isEdit && (
              <AddressForm
                addresses={addresses}
                onSave={(addr) => upsertAddress.mutate(addr as any)}
                onDelete={(id) => deleteAddress.mutate(id)}
                entityType="organization"
                entityId={organization!.id}
              />
            )}
          </TabsContent>

          <TabsContent value="contatos" className="mt-4">
            {isEdit && (
              <ContactChannelList
                channels={channels}
                onSave={(ch) => upsertChannel.mutate(ch as any)}
                onDelete={(id) => deleteChannel.mutate(id)}
                entityType="organization"
                entityId={organization!.id}
              />
            )}
          </TabsContent>

          <TabsContent value="notas" className="mt-4">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anotações sobre esta empresa..."
              rows={8}
            />
            {isEdit && <Button className="mt-2" onClick={handleSubmit}>Salvar notas</Button>}
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            {isEdit && <AuditTimeline entityType="organization" entityId={organization!.id} />}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
