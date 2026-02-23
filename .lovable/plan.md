

## Plano de Implementacao Completo — 7 Partes

Todas as 7 partes do plano anterior travaram e nenhuma foi implementada. Este plano retoma a execucao completa.

---

### ETAPA 1 — Migracao SQL (3 acoes)

**1A.** Corrigir RLS da tabela `checklist_items`: remover politica RESTRICTIVE e criar PERMISSIVE

**1B.** Criar tabela `role_permissions`:
- Colunas: id, company_id, role (app_role), permission (text), granted (boolean)
- Constraint UNIQUE(company_id, role, permission)
- RLS com politica PERMISSIVE para tenant isolation

**1C.** Criar tabela `checklist_templates`:
- Colunas: id, company_id, name, sector, template_data (jsonb), created_by, created_at, is_system
- RLS com politica PERMISSIVE para tenant isolation

---

### ETAPA 2 — Correcao da Condicional (Select Dinamico)

**Arquivo:** `src/components/admin/ChecklistEditorDialog.tsx`

- Importar `useProfiles` e adicionar queries para buscar contatos e organizacoes
- Quando o campo da regra for `owner_id`, `contact_id` ou `organization_id`, substituir o Input de texto por um Select que mostra os registros reais
- O valor salvo sera o UUID, nao o nome digitado
- Na exibicao das regras existentes, resolver o UUID para mostrar o nome da entidade

---

### ETAPA 3 — Tooltip de Descricao no Funil

**Arquivo:** `src/components/deals/view/DealChecklistPanel.tsx`

- Importar `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` de `@/components/ui/tooltip`
- Importar `HelpCircle` de `lucide-react`
- Ao lado do titulo de cada checklist, quando `checklist.description` existir, renderizar icone HelpCircle com Tooltip mostrando a descricao

---

### ETAPA 4 — CRUD + Reordenacao de Etapas

**Arquivo:** `src/hooks/usePipelines.ts`

- Adicionar mutations: `createStage`, `updateStage`, `deleteStage`, `reorderStages`
- `createStage`: insere com position = ultimo + 1
- `deleteStage`: verifica se ha negocios vinculados antes de excluir
- `reorderStages`: atualiza campo position de todas as etapas reordenadas

**Arquivo:** `src/components/admin/StageListSidebar.tsx`

- Importar `@dnd-kit/core` e `@dnd-kit/sortable` para drag-and-drop
- Adicionar botao "+ Nova Etapa" no topo
- Cada etapa tera icones de editar (lapis) e excluir (lixeira), visiveis no hover
- Inline edit para nome da etapa
- Dialog de confirmacao para exclusao
- Ao soltar item arrastado, chamar `reorderStages`

---

### ETAPA 5 — Sistema de Permissoes (RBAC)

**Novo arquivo:** `src/hooks/usePermissions.ts`

- Busca permissoes da tabela `role_permissions` para o role do usuario logado
- Exporta funcao `can(permission: string): boolean`
- Defaults: admin = tudo permitido, supervisor = maioria, vendedor = basico
- Lista de permissoes: deals.create/edit/delete/view_all, stages.create/edit/delete, checklists.create/edit/delete, templates.create/edit/delete, contacts.create/edit/delete, reports.view, admin.access

**Arquivo:** `src/pages/AdminPage.tsx`

- Na aba "Usuarios", adicionar sub-tabs "Lista" e "Permissoes"
- Sub-tab "Permissoes": tabela matriz com roles nas colunas e permissoes nas linhas
- Cada checkbox salva/atualiza na tabela `role_permissions` via upsert

---

### ETAPA 6 — Gestao de Templates Persistidos

**Novo arquivo:** `src/hooks/useChecklistTemplates.ts`

- CRUD completo: listar, criar, atualizar, excluir templates da tabela `checklist_templates`
- Funcao para aplicar template (criar checklist + itens a partir do template_data)

**Arquivo:** `src/components/admin/ChecklistConfigTab.tsx`

- Adicionar secao "Biblioteca de Templates" com:
  - Listagem de templates (sistema + personalizados)
  - Botao "Salvar como Template" ao lado de cada checklist existente
  - Botao "Criar Template" para criar do zero
  - Botoes de editar/excluir em cada template
  - Controlado pelas permissoes da Etapa 5

---

### ETAPA 7 — Refinamento da Duplicacao

**Arquivo:** `src/components/admin/DuplicateChecklistDialog.tsx`

- Substituir select simples por multi-select com checkboxes (multiplas etapas de destino)
- Adicionar secao de preview mostrando os itens que serao duplicados
- Ao duplicar, iterar sobre cada etapa selecionada e chamar a mutation existente
- Se ja existir checklist com mesmo nome na etapa destino, o nome tera sufixo "(copia)"

---

### Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migracao SQL | Fix RLS + criar role_permissions + criar checklist_templates |
| `src/components/admin/ChecklistEditorDialog.tsx` | Select dinamico para campos UUID |
| `src/components/deals/view/DealChecklistPanel.tsx` | Tooltip com descricao |
| `src/hooks/usePipelines.ts` | Mutations CRUD + reorder |
| `src/components/admin/StageListSidebar.tsx` | Drag-and-drop + CRUD de etapas |
| `src/hooks/usePermissions.ts` | Novo hook RBAC |
| `src/pages/AdminPage.tsx` | Sub-aba de permissoes |
| `src/hooks/useChecklistTemplates.ts` | Novo hook CRUD templates |
| `src/components/admin/ChecklistConfigTab.tsx` | Biblioteca de templates |
| `src/components/admin/DuplicateChecklistDialog.tsx` | Multi-select + preview |

