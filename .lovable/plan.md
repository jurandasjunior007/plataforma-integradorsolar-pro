
## Plano de Evolucao — Correcoes + Gestao de Etapas + Permissoes + Melhorias UX

Este plano aborda todos os problemas reportados e as novas funcionalidades solicitadas, organizados por prioridade.

---

### PARTE 1 — Correcao Critica: Erro ao Criar Itens do Checklist

**Problema identificado:** A tabela `checklist_items` possui uma politica RLS do tipo RESTRICTIVE (que funciona como filtro AND), porem nao possui nenhuma politica PERMISSIVE. Como o sistema RLS exige que pelo menos uma politica PERMISSIVE autorize a operacao, todas as insercoes/atualizacoes/exclusoes sao negadas.

**Solucao:** Criar uma migracao SQL que:
1. Remove a politica RESTRICTIVE atual
2. Cria uma politica PERMISSIVE para usuarios autenticados com filtro `company_id = get_user_company_id(auth.uid())`

```sql
DROP POLICY IF EXISTS "Tenant isolation" ON checklist_items;
CREATE POLICY "Tenant isolation" ON checklist_items
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));
```

---

### PARTE 2 — Correcao: Condicional do Checklist nao Encontra Usuarios

**Problema:** Quando o admin seleciona "Responsavel" como campo da regra condicional e digita o nome de um usuario (ex: "Jurandir Ferreira..."), o sistema compara o `owner_id` (que armazena um UUID) com o texto digitado. Isso nunca vai funcionar.

**Solucao:** No `ChecklistEditorDialog.tsx`, quando o campo selecionado for `owner_id`, `contact_id` ou `organization_id`, substituir o campo de texto "Valor" por um select que busca os registros reais do banco:
- `owner_id` -> buscar `profiles` e mostrar nomes dos usuarios
- `contact_id` -> buscar `contacts`
- `organization_id` -> buscar `organizations`

Ao selecionar, o valor salvo sera o UUID do registro, nao o nome. Na listagem das regras existentes, exibir o nome resolvido em vez do UUID.

**Arquivos:** `ChecklistEditorDialog.tsx` (adicionar hooks useProfiles, queries para contatos e orgs)

---

### PARTE 3 — Tooltip de Descricao do Checklist no Funil

**Problema:** A descricao do checklist configurada pelo admin nao aparece no funil para o usuario final.

**Solucao:** No `DealChecklistPanel.tsx`, ao lado do titulo de cada checklist, adicionar um icone de ajuda (HelpCircle do lucide-react) com um Tooltip que exibe a descricao quando o cursor para em cima.

```text
[QUALIFICACAO DO LEAD]  (i) <-- hover mostra "Verificar dados minimos..."
```

**Arquivo:** `DealChecklistPanel.tsx` (importar Tooltip + HelpCircle)

---

### PARTE 4 — Gestao Completa de Etapas (CRUD + Reordenacao)

**4.1 — Criar, Editar e Excluir Etapas**

No `usePipelines.ts`, adicionar mutations:
- `createStage(name, pipeline_id, color?)` — insere nova etapa com position = ultimo + 1
- `updateStage(id, name?, color?, position?)` — edita nome/cor
- `deleteStage(id)` — exclui (com verificacao: so permite se nao houver negocios vinculados)

No `StageListSidebar.tsx`:
- Botao "+ Nova Etapa" no topo
- Icone de lapis para editar nome/cor
- Icone de lixeira para excluir (com dialog de confirmacao)
- Inline edit para nome da etapa

**4.2 — Reordenacao via Drag-and-Drop**

No `StageListSidebar.tsx`, usar `@dnd-kit/sortable` (ja instalado) para permitir arrastar etapas e reordenar. Ao soltar, atualizar o campo `position` de todas as etapas reordenadas no banco.

**Arquivos:**
- `usePipelines.ts` — adicionar createStage, updateStage, deleteStage, reorderStages mutations
- `StageListSidebar.tsx` — adicionar drag-and-drop, botoes de CRUD, inline edit

---

### PARTE 5 — Sistema de Permissoes por Funcao (RBAC)

**5.1 — Tabela de Permissoes**

Criar nova tabela `role_permissions` no banco:

```sql
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  permission text NOT NULL,
  granted boolean DEFAULT true,
  UNIQUE(company_id, role, permission)
);
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON role_permissions
  FOR ALL TO authenticated
  USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));
```

Permissoes disponiveis (exemplos):
- `deals.create`, `deals.edit`, `deals.delete`, `deals.view_all`
- `stages.create`, `stages.edit`, `stages.delete`
- `checklists.create`, `checklists.edit`, `checklists.delete`
- `templates.create`, `templates.edit`, `templates.delete`
- `contacts.create`, `contacts.edit`, `contacts.delete`
- `reports.view`
- `admin.access`

**5.2 — Hook usePermissions**

Novo hook `usePermissions.ts` que:
- Busca as permissoes do role do usuario logado
- Exporta funcao `can(permission: string): boolean`
- Tem defaults: admin = tudo permitido, supervisor = maioria, vendedor = basico

**5.3 — Tela de Configuracao no Admin**

Na aba "Usuarios" do `AdminPage.tsx`, adicionar sub-aba "Permissoes" com uma tabela estilo matriz:

```text
                      Admin   Supervisor   Vendedor
Criar negocios         [x]      [x]          [x]
Excluir negocios       [x]      [ ]          [ ]
Criar etapas           [x]      [ ]          [ ]
Editar checklists      [x]      [x]          [ ]
...
```

Cada checkbox salva/atualiza na tabela `role_permissions`.

**Arquivos:**
- Migracao SQL para criar `role_permissions`
- `src/hooks/usePermissions.ts` (novo)
- `src/pages/AdminPage.tsx` — aba de permissoes
- Componentes que precisam verificar permissao antes de mostrar botoes de acao

---

### PARTE 6 — Evolucao dos Templates

**6.1 — Tabela de Templates Persistidos**

Criar tabela `checklist_templates` no banco para templates personalizados:

```sql
CREATE TABLE public.checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sector text NOT NULL DEFAULT 'geral',
  template_data jsonb NOT NULL DEFAULT '[]',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  is_system boolean DEFAULT false
);
```

**6.2 — Interface de Gestao**

No `ChecklistConfigTab.tsx` ou no `AdminPage.tsx`, adicionar secao de "Biblioteca de Templates":
- Listar templates disponiveis (sistema + personalizados da empresa)
- Botao "Salvar como Template" ao lado de cada checklist existente
- CRUD completo: criar, editar, excluir templates
- Somente admin pode criar/editar/excluir (controlado pelas permissoes da Parte 5)

**Arquivos:**
- Migracao SQL
- `src/hooks/useChecklistTemplates.ts` (novo)
- `ChecklistConfigTab.tsx` — integrar gestao de templates

---

### PARTE 7 — Duplicacao de Checklists (ja existe, refinar)

A funcionalidade de duplicar checklist ja esta implementada (`DuplicateChecklistDialog.tsx`). Refinamentos:
- Mostrar preview dos itens que serao duplicados
- Se ja existe checklist com mesmo nome na etapa destino, adicionar "(copia)" automaticamente (ja implementado no hook)
- Permitir selecionar multiplas etapas de destino de uma vez

**Arquivo:** `DuplicateChecklistDialog.tsx` — adicionar multi-select e preview

---

### Resumo Tecnico

| Arquivo | Alteracao |
|---|---|
| Migracao SQL | Fix RLS checklist_items, criar role_permissions, criar checklist_templates |
| `src/hooks/usePipelines.ts` | Adicionar CRUD e reorder mutations para stages |
| `src/hooks/usePermissions.ts` | Novo hook de permissoes |
| `src/hooks/useChecklistTemplates.ts` | Novo hook CRUD templates |
| `src/components/admin/StageListSidebar.tsx` | Drag-and-drop, criar/editar/excluir etapas |
| `src/components/admin/ChecklistEditorDialog.tsx` | Select dinamico para owner_id/contact_id/org_id |
| `src/components/deals/view/DealChecklistPanel.tsx` | Tooltip com descricao |
| `src/components/admin/ChecklistConfigTab.tsx` | Gestao de templates |
| `src/components/admin/DuplicateChecklistDialog.tsx` | Multi-select e preview |
| `src/pages/AdminPage.tsx` | Aba de permissoes por funcao |

### Ordem de Execucao

1. Migracao SQL (fix RLS + novas tabelas)
2. Correcao condicional (select dinamico no editor)
3. Tooltip descricao no funil
4. CRUD + reorder de etapas
5. Sistema de permissoes
6. Gestao de templates
7. Refinamento duplicacao
