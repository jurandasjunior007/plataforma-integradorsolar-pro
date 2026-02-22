import { MapPin } from 'lucide-react';

export default function EnderecosPage() {
  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
      <MapPin className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Endereços</h1>
      <p className="text-muted-foreground max-w-md">
        A gestão de endereços é feita diretamente no cadastro de Pessoas e Empresas, na aba "Endereços".
      </p>
    </div>
  );
}
