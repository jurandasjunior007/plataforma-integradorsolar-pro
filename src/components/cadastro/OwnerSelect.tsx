import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfiles } from '@/hooks/useProfiles';

interface OwnerSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function OwnerSelect({ value, onChange }: OwnerSelectProps) {
  const { data: profiles, isLoading } = useProfiles();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Carregando...' : 'Selecione o responsável'} />
      </SelectTrigger>
      <SelectContent>
        {(profiles ?? []).map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
