import React from 'react';
import { Input } from '@/components/ui/input';
import { maskPhone } from '@/lib/masks';

interface PhoneInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  return (
    <Input
      {...props}
      value={maskPhone(value)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
      placeholder="(00) 00000-0000"
      maxLength={15}
    />
  );
}
