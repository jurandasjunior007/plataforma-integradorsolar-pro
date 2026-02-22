import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockProducts = [
  { id: '1', name: 'Painel Solar 550W', price: 1200, unit: 'un', active: true },
  { id: '2', name: 'Inversor 5kW', price: 4500, unit: 'un', active: true },
  { id: '3', name: 'Estrutura de fixação', price: 800, unit: 'kit', active: true },
  { id: '4', name: 'Cabo solar 6mm', price: 12, unit: 'm', active: true },
  { id: '5', name: 'String Box', price: 350, unit: 'un', active: false },
];

export default function ProductsPage() {
  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">
                      {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell>
                      <Badge variant={p.active ? 'default' : 'secondary'}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
