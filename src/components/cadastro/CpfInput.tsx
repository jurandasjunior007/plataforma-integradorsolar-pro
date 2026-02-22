import React from 'react';
import { Input } from '@/components/ui/input';
import { maskCpf } from '@/lib/masks';

interface CpfInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function CpfInput({ value, onChange, ...props }: CpfInputProps) {
  return (
    <Input
      {...props}
      value={maskCpf(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
      placeholder="000.000.000-00"
      maxLength={14}
    />
  );
}
