
## Plano Simplificado — Parte 1 de 3

Para evitar travamento, este plano cobre APENAS as correcoes criticas e primeiras melhorias. As partes seguintes serao implementadas em mensagens separadas.

---

### PASSO 1 — Migracao SQL (requer aprovacao do popup)

Quando a implementacao comecar, vai aparecer um popup/botao pedindo para confirmar a execucao do SQL. Voce precisa clicar em "Aprovar" ou "Confirmar" nesse popup.

O SQL faz 3 coisas:
1. Adiciona politica PERMISSIVE na tabela `checklist_items` (corrige o erro ao criar itens)
2. Cria tabela `role_permissions` para o sistema de permissoes
3. Cria tabela `checklist_templates` para templates persistidos

### PASSO 2 — Correcao do Select Dinamico (ChecklistEditorDialog)

Arquivo: `src/components/admin/ChecklistEditorDialog.tsx`

- Quando o campo da regra condicional for `owner_id`, trocar o input de texto por um Select que busca usuarios reais do banco
- Quando for `contact_id`, buscar contatos reais
- Quando for `organization_id`, buscar organizacoes reais
- Salvar o UUID selecionado (nao o nome digitado)

### PASSO 3 — Tooltip de Descricao no Funil

Arquivo: `src/components/deals/view/DealChecklistPanel.tsx`

- Adicionar icone de ajuda (HelpCircle) ao lado do titulo de cada checklist
- Ao passar o cursor no icone, mostra a descricao do checklist em um tooltip

### PASSO 4 — CRUD de Etapas + Drag-and-Drop

Arquivo: `src/hooks/usePipelines.ts`
- Adicionar mutations: createStage, updateStage, deleteStage, reorderStages

Arquivo: `src/components/admin/StageListSidebar.tsx`
- Botao "+ Nova Etapa"
- Icones de editar e excluir em cada etapa
- Drag-and-drop para reordenar etapas usando @dnd-kit/sortable

---

### IMPORTANTE

Quando a implementacao iniciar, o primeiro passo sera a migracao SQL. Um popup de confirmacao aparecera na tela. Voce precisa clicar para aprovar. Sem essa aprovacao, nada mais pode avancar.

As partes restantes (RBAC completo, templates persistidos, duplicacao multi-etapa) serao implementadas em uma segunda rodada apos esta primeira ser concluida.
