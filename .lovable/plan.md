

## Evolucao Enterprise do Checklist (Modelo Ploomes)

### Resumo

6 melhorias que elevam o sistema de checklist ao nivel enterprise, adicionando checklists condicionais, barra de progresso no header, campo vinculado na configuracao, regras condicionais no admin, status visual refinado e templates prontos para energia solar.

---

### Melhoria 1 — Checklists Condicionais no DealChecklistPanel

**Arquivo:** `src/components/deals/view/DealChecklistPanel.tsx`

- Importar `rules` do hook `useStageChecklists` (ja existe, apenas nao esta sendo usado)
- Adicionar funcao `checklistMatchesRules` que avalia as regras de cada checklist contra os dados do deal
- Operadores suportados: `equals`, `not_equals`, `contains`, `not_empty`, `is_empty`, `greater_than`, `less_than`
- Filtrar checklists no render: `.filter(cl => checklistMatchesRules(cl.id, rules, deal))`
- Atualizar calculo de progresso para considerar apenas checklists visiveis

---

### Melhoria 2 — Barra de Progresso no Header

**Arquivo:** `src/components/deals/view/DealViewHeader.tsx`

- Adicionar prop `checklistProgress?: { completed: number; total: number; hasBlockers: boolean }`
- Renderizar barra de progresso fina (h-1.5) abaixo do titulo com 3 cores: vermelho se bloqueado, verde se 100%, primary em progresso
- Mostrar texto "X/Y checklist" e indicador "Bloqueado" quando houver blockers

**Arquivo:** `src/pages/DealViewPage.tsx`

- Calcular `checklistProgress` via `useMemo` usando `checklists`, `items` e `getFieldValue`
- Considerar tambem regras condicionais no calculo (apenas checklists visiveis)
- Passar `checklistProgress` para o `DealViewHeader`

---

### Melhoria 3 — Campo Vinculado na Configuracao do Admin

**Arquivo:** `src/components/admin/ChecklistEditorDialog.tsx`

- Adicionar select "Campo vinculado" em cada item do checklist com 19 opcoes (value, contact_id, custom_fields.consumo_kwh, etc.)
- Ao mudar o select, chamar `updateItem.mutateAsync({ id, linked_field: valor })`
- Exibir badge visual no item indicando o campo vinculado quando configurado

**Arquivo:** `src/hooks/useStageChecklists.ts`

- Expandir tipo de input do `updateItem` para incluir `linked_field?: string | null`
- Expandir tipo de input do `createItem` para incluir `linked_field?: string | null`

---

### Melhoria 4 — Regras Condicionais Aprimoradas no Admin

**Arquivo:** `src/components/admin/ChecklistEditorDialog.tsx`

- Expandir `conditionFields` com mais opcoes: status, owner_id, custom_fields.tipo_cliente, custom_fields.forma_pagamento, etc.
- Expandir `operators` com `not_empty` e `is_empty`
- Adicionar aviso informativo: "Quando ha regras definidas, este checklist so aparece para negocios que satisfazem TODAS as condicoes."
- Permitir valor vazio quando operador for `not_empty` ou `is_empty`

---

### Melhoria 5 — Status Visual com 4 Estados (Ploomes)

**Arquivo:** `src/components/deals/view/DealChecklistPanel.tsx`

- Substituir icone `ShieldAlert` por `XCircle` (importar de lucide-react) para status "blocking"
- `completed`: CheckCircle2 verde + texto line-through muted
- `blocking`: XCircle vermelho + badge "Bloqueia"
- `warning`: AlertTriangle ambar + badge "Pendente" (trocar de "Obrigatorio")
- `optional`: Circle cinza claro, sem badge

---

### Melhoria 6 — Templates de Checklist para Energia Solar

**Novo arquivo:** `src/lib/checklistTemplates.ts`

- Exportar constante `SOLAR_CHECKLIST_TEMPLATES` com 7 templates (Prospeccao, Levantamento Tecnico, Proposta, Fechamento, Instalacao, Homologacao, Pos-Venda)
- Cada template contem checklists com itens pre-configurados com `linked_field`, `is_required` e `block_stage_advance`

**Arquivo:** `src/components/admin/ChecklistConfigTab.tsx`

- Adicionar botao "Usar template solar" ao lado de "Novo Checklist"
- Ao clicar, abrir dialog listando os 7 templates com preview de itens
- Ao selecionar um template, criar checklist e itens automaticamente via `createChecklist` e `createItem`

---

### Detalhes Tecnicos

| Arquivo | Tipo de Alteracao |
|---|---|
| `src/components/deals/view/DealChecklistPanel.tsx` | Adicionar regras condicionais, icones Ploomes, importar rules |
| `src/components/deals/view/DealViewHeader.tsx` | Adicionar prop e barra de progresso |
| `src/pages/DealViewPage.tsx` | Calcular e passar checklistProgress, importar rules |
| `src/components/admin/ChecklistEditorDialog.tsx` | Campo vinculado por item, campos de regra expandidos |
| `src/hooks/useStageChecklists.ts` | Expandir updateItem/createItem com linked_field |
| `src/components/admin/ChecklistConfigTab.tsx` | Botao e dialog de template solar |
| `src/lib/checklistTemplates.ts` | Novo arquivo com templates |

Nenhuma migracao de banco necessaria — `linked_field` ja existe em `checklist_items` e `checklist_rules` ja existe como tabela.

