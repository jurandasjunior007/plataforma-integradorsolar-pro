import { TopBar } from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockContacts = [
  { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-1111', type: 'PF' },
  { id: '2', name: 'João Santos', email: 'joao@email.com', phone: '(11) 99999-2222', type: 'PF' },
  { id: '3', name: 'Ana Oliveira', email: 'ana@email.com', phone: '(11) 99999-3333', type: 'PF' },
  { id: '4', name: 'Carlos Ferreira', email: 'carlos@email.com', phone: '(11) 99999-4444', type: 'PF' },
  { id: '5', name: 'Empresa Solar Ltda', email: 'contato@solar.com', phone: '(11) 3333-1111', type: 'PJ' },
  { id: '6', name: 'Tech Energy S.A.', email: 'info@tech.com', phone: '(11) 3333-2222', type: 'PJ' },
];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = mockContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      (activeTab === 'all' || c.type === activeTab)
  );

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Clientes</h1>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Novo cliente
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="PF">Pessoa Física</TabsTrigger>
                <TabsTrigger value="PJ">Empresas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{c.type}</TableCell>
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
      </div>
    </>
  );
}
