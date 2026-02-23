

## Plano Completo — 7 Partes (Implementacao Imediata)

Este plano retoma TODAS as funcionalidades pendentes que travaram nas tentativas anteriores.

---

### PARTE 1 — Migracao SQL (Correcao Critica + Novas Tabelas)

**Problema raiz:** A tabela `checklist_items` so tem politica RLS RESTRICTIVE, sem nenhuma PERMISSIVE. Isso bloqueia todas as operacoes (INSERT/UPDATE/DELETE).

**Acoes:**

1A. Adicionar politica PERMISSIVE na tabela `checklist_items`:
```sql
CREATE POLICY "checklist_items_permissive" ON checklist_items
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));
```

1B. Criar tabela `role_permissions` para o sistema RBAC:
- Colunas: id (uuid PK), company_id, role (app_role), permission (text), granted (boolean)
- Constraint UNIQUE(company_id, role, permission)
- RLS permissive para tenant isolation

1C. Criar tabela `checklist_templates` para templates persistidos:
- Colunas: id (uuid PK), company_id, name, sector (default 'geral'), template_data (jsonb), created_by, created_at, is_system (boolean)
- RLS permissive para tenant isolation

---

### PARTE 2 — Select Dinamico nas Regras Condicionais

**Arquivo:** `src/components/admin/ChecklistEditorDialog.tsx`

**Problema:** Quando o admin seleciona "Responsavel" e digita um nome, o sistema salva o texto, mas o campo `owner_id` armazena UUID. A comparacao nunca funciona.

**Solucao:**
- Importar `useProfiles` para buscar usuarios
- Adicionar queries inline para buscar contatos e organizacoes
- Quando `ruleField` for `owner_id`, `contact_id` ou `organization_id`, trocar o Input por um Select com os registros reais do banco
- Salvar o UUID selecionado (nao o nome)
- Na listagem de regras existentes, resolver UUIDs para nomes visiveis

---

### PARTE 3 — Tooltip de Descricao no Funil

**Arquivo:** `src/components/deals/view/DealChecklistPanel.tsx`

- Importar `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` e `HelpCircle`
- Ao lado do titulo de cada checklist (linha 253), quando `checklist.description` existir, renderizar icone HelpCircle com Tooltip mostrando a descricao

---

### PARTE 4 — CRUD + Reordenacao de Etapas

**Arquivo:** `src/hooks/usePipelines.ts`

Adicionar 4 mutations:
- `createStage(name, pipeline_id, color?)` — insere com position = ultimo + 1
- `updateStage(id, name?, color?)` — edita nome/cor da etapa
- `deleteStage(id)` — verifica se ha negocios vinculados antes de excluir
- `reorderStages(orderedIds[])` — atualiza position de todas as etapas

**Arquivo:** `src/components/admin/StageListSidebar.tsx`

- Importar `@dnd-kit/core` e `@dnd-kit/sortable` (ja instalados)
- Botao "+ Nova Etapa" no topo da sidebar
- Icone de lapis (editar nome inline) e lixeira (excluir com confirmacao) visiveis no hover
- Drag handle (GripVertical) para arrastar e reordenar etapas
- Dialog de confirmacao antes de excluir

---

### PARTE 5 — Sistema de Permissoes (RBAC)

**Novo arquivo:** `src/hooks/usePermissions.ts`

- Busca permissoes da tabela `role_permissions` para o role do usuario logado
- Exporta funcao `can(permission: string): boolean`
- Defaults hardcoded: admin = tudo, supervisor = maioria, vendedor = basico
- Permissoes: deals.create/edit/delete/view_all, stages.create/edit/delete, checklists.create/edit/delete, templates.create/edit/delete, contacts.create/edit/delete, reports.view, admin.access

**Arquivo:** `src/pages/AdminPage.tsx`

- Na aba "Usuarios", adicionar sub-tabs "Lista" e "Permissoes"
- Sub-tab "Permissoes": tabela matriz com 3 colunas (Admin, Supervisor, Vendedor) e linhas para cada permissao
- Cada checkbox faz upsert na tabela `role_permissions`

---

### PARTE 6 — Gestao de Templates Persistidos

**Novo arquivo:** `src/hooks/useChecklistTemplates.ts`

- CRUD completo: listar, criar, atualizar, excluir templates
- Funcao para aplicar template (criar checklist + itens)

**Arquivo:** `src/components/admin/ChecklistConfigTab.tsx`

- Adicionar secao "Biblioteca de Templates" abaixo dos checklists
- Botao "Salvar como Template" ao lado de cada checklist existente
- Listagem de templates com botoes editar/excluir
- Controlado pelas permissoes da Parte 5

---

### PARTE 7 — Duplicacao Multi-Etapa com Preview

**Arquivo:** `src/components/admin/DuplicateChecklistDialog.tsx`

- Substituir select unico por lista de checkboxes (selecionar multiplas etapas)
- Adicionar secao de preview listando os itens que serao duplicados
- Ao duplicar, iterar sobre cada etapa selecionada
- Sufixo "(copia)" automatico quando ja existe checklist com mesmo nome

---

### Resumo de Arquivos Afetados

| Arquivo | Tipo |
|---|---|
| Migracao SQL | Fix RLS checklist_items + criar role_permissions + checklist_templates |
| `src/components/admin/ChecklistEditorDialog.tsx` | Select dinamico para UUIDs |
| `src/components/deals/view/DealChecklistPanel.tsx` | Tooltip descricao |
| `src/hooks/usePipelines.ts` | CRUD + reorder mutations |
| `src/components/admin/StageListSidebar.tsx` | Drag-and-drop + CRUD visual |
| `src/hooks/usePermissions.ts` | Novo hook RBAC |
| `src/pages/AdminPage.tsx` | Aba de permissoes |
| `src/hooks/useChecklistTemplates.ts` | Novo hook templates |
| `src/components/admin/ChecklistConfigTab.tsx` | Biblioteca de templates |
| `src/components/admin/DuplicateChecklistDialog.tsx` | Multi-select + preview |

