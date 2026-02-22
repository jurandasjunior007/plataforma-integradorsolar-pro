import { Copy } from 'lucide-react';

export default function DuplicidadesPage() {
  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
      <Copy className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Duplicidades</h1>
      <p className="text-muted-foreground max-w-md">
        Em breve você poderá identificar e mesclar cadastros duplicados automaticamente.
      </p>
    </div>
  );
}
