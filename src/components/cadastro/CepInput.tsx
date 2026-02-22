import React from 'react';
import { Input } from '@/components/ui/input';
import { maskCep } from '@/lib/masks';

interface CepInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function CepInput({ value, onChange, ...props }: CepInputProps) {
  return (
    <Input
      {...props}
      value={maskCep(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
      placeholder="00000-000"
      maxLength={9}
    />
  );
}
