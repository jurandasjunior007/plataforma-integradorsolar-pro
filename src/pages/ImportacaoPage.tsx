import { Upload } from 'lucide-react';

export default function ImportacaoPage() {
  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
      <Upload className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Importação</h1>
      <p className="text-muted-foreground max-w-md">
        Em breve você poderá importar cadastros de pessoas e empresas via planilha CSV/Excel.
      </p>
    </div>
  );
}
