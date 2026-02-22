import React from 'react';
import { Input } from '@/components/ui/input';
import { maskCnpj } from '@/lib/masks';

interface CnpjInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function CnpjInput({ value, onChange, ...props }: CnpjInputProps) {
  return (
    <Input
      {...props}
      value={maskCnpj(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 14))}
      placeholder="00.000.000/0000-00"
      maxLength={18}
    />
  );
}
