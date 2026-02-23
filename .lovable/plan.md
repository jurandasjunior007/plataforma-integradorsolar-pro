

## Correção Cirúrgica — Checklist com Avaliação Automática por Campo

### Situação Atual

- `DealChecklistPanel` ja usa `useStageChecklists` (sem mock data) -- OK
- `DealViewPage` ja passa `dealId` -- OK
- `handleStageChange` ja valida checklist antes de mover -- OK, mas usa `deal_checklist_items` (checkboxes manuais)

### O que falta (gap principal)

Os itens de checklist possuem um campo `linked_field` (ex: `contact_id`, `value`, `custom_fields.solar_consumo`) que deveria permitir avaliacao automatica: se o campo do deal esta preenchido, o item e considerado concluido automaticamente. Hoje isso nao funciona — tudo depende de checkbox manual.

### Plano de Alteracoes

Apenas 2 arquivos serao alterados: `DealChecklistPanel.tsx` e `DealViewPage.tsx`.

---

### 1. DealChecklistPanel.tsx

**1.1** Alterar a interface de props para receber tambem o `deal`:

```typescript
interface DealChecklistPanelProps {
  stage: Stage;
  dealId: string;
  deal: {
    id: string;
    custom_fields: Record<string, any> | null;
    value: number | null;
    contact_id: string | null;
    organization_id: string | null;
    owner_id: string | null;
    status: string;
    contact?: { id: string; name: string } | null;
    organization?: { id: string; name: string } | null;
  };
}
```

**1.2** Adicionar funcao `evaluateItem` que resolve o `linked_field` contra os dados do deal:
- Se `linked_field` e nulo: usar o status do checkbox manual (tabela `deal_checklist_items`) como fallback
- Se `linked_field` existe: verificar se o campo correspondente no deal esta preenchido (nao nulo, nao vazio, nao zero)
- Retornar um status: `completed`, `blocking`, `warning`, ou `optional`

**1.3** Adicionar barra de progresso no topo mostrando "X/Y itens concluidos (Z%)"

**1.4** Manter os checkboxes funcionais para itens sem `linked_field` (abordagem hibrida)

---

### 2. DealViewPage.tsx

**2.1** Passar o objeto `deal` completo para o `DealChecklistPanel`:

```tsx
<DealChecklistPanel
  stage={currentStage}
  dealId={deal.id}
  deal={dealForComponents}
/>
```

**2.2** Atualizar `handleStageChange` para usar a mesma logica de `linked_field` na validacao:
- Para itens com `linked_field`: verificar se o campo do deal esta preenchido
- Para itens sem `linked_field`: consultar `deal_checklist_items` para verificar se foram marcados manualmente
- Combinar ambos os resultados para determinar bloqueadores e avisos

---

### Resumo das mudancas

| Arquivo | Alteracao |
|---|---|
| `DealChecklistPanel.tsx` | Adicionar prop `deal`, funcao `evaluateItem`, barra de progresso, abordagem hibrida checkbox + linked_field |
| `DealViewPage.tsx` | Passar `deal` ao componente, atualizar validacao de etapa com logica de linked_field |

Nenhum outro arquivo sera alterado. Nenhuma tabela do banco sera modificada.

