

## Plano de Execucao — Etapas Pendentes (5, 6, 7) + Correcao RLS

### PASSO 1 — Correcao RLS (Migracao SQL)

As 3 politicas criadas na migracao anterior foram todas RESTRICTIVE. PostgreSQL exige pelo menos 1 PERMISSIVE para permitir acesso. Correcao necessaria:

- Dropar `checklist_items_company_access` (RESTRICTIVE duplicada) e recriar como PERMISSIVE
- Dropar `role_permissions_tenant_isolation` (RESTRICTIVE) e recriar como PERMISSIVE
- Dropar `checklist_templates_tenant_isolation` (RESTRICTIVE) e recriar como PERMISSIVE

Importante: Um popup de confirmacao aparecera na tela. Precisa ser aprovado para continuar.

---

### PASSO 2 — Hook usePermissions (Etapa 5)

Novo arquivo: `src/hooks/usePermissions.ts`

- Busca o role do usuario logado via `user_roles`
- Busca permissoes customizadas da tabela `role_permissions`
- Exporta funcao `can(permission)` com defaults hardcoded:
  - admin: tudo permitido
  - supervisor: maioria (exceto admin.access)
  - vendedor: basico (deals.create/edit/view, contacts.create/edit)
- Lista de permissoes: deals.create, deals.edit, deals.delete, deals.view_all, stages.create, stages.edit, stages.delete, checklists.create, checklists.edit, checklists.delete, templates.create, templates.edit, templates.delete, contacts.create, contacts.edit, contacts.delete, reports.view, admin.access

---

### PASSO 3 — Aba de Permissoes no Admin (Etapa 5)

Arquivo: `src/pages/AdminPage.tsx`

- Na aba "Usuarios", adicionar sub-tabs "Lista" e "Permissoes"
- Sub-tab "Lista": conteudo atual (lista de usuarios)
- Sub-tab "Permissoes": tabela matriz com 3 colunas (Admin, Supervisor, Vendedor)
- Linhas = cada permissao, celulas = checkbox
- Cada checkbox faz upsert na tabela `role_permissions`

---

### PASSO 4 — Hook useChecklistTemplates (Etapa 6)

Novo arquivo: `src/hooks/useChecklistTemplates.ts`

- CRUD completo: listar, criar, atualizar, excluir templates
- Funcao `applyTemplate(templateId, stageId)`: le template_data, cria checklist + itens
- Funcao `saveAsTemplate(checklistId, name)`: le checklist + itens e salva como template

---

### PASSO 5 — Biblioteca de Templates (Etapa 6)

Arquivo: `src/components/admin/ChecklistConfigTab.tsx`

- Secao "Biblioteca de Templates" abaixo dos checklists
- Botao "Salvar como Template" ao lado de cada checklist existente
- Listagem de templates (sistema + personalizados) com botoes aplicar/editar/excluir
- Manter os templates hardcoded (SOLAR_CHECKLIST_TEMPLATES) como fallback

---

### PASSO 6 — Duplicacao Multi-Etapa (Etapa 7)

Arquivo: `src/components/admin/DuplicateChecklistDialog.tsx`

- Substituir Select unico por lista de checkboxes (multiplas etapas de destino)
- Secao de preview mostrando os itens que serao duplicados
- Ao duplicar, iterar sobre cada etapa selecionada
- Sufixo "(copia)" quando ja existe checklist com mesmo nome

---

### Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migracao SQL | Corrigir 3 politicas RLS de RESTRICTIVE para PERMISSIVE |
| `src/hooks/usePermissions.ts` | Novo — hook RBAC com funcao can() |
| `src/pages/AdminPage.tsx` | Adicionar sub-aba de permissoes na aba Usuarios |
| `src/hooks/useChecklistTemplates.ts` | Novo — CRUD de templates persistidos |
| `src/components/admin/ChecklistConfigTab.tsx` | Adicionar biblioteca de templates |
| `src/components/admin/DuplicateChecklistDialog.tsx` | Multi-select com preview |

