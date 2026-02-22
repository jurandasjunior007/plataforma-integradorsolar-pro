import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function ClientsRedirect() {
  useEffect(() => {
    toast({ title: 'A seção de clientes foi movida para Cadastro > Pessoas' });
  }, []);

  return <Navigate to="/cadastro/pessoas" replace />;
}
