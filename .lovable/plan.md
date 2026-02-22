

## Ajustes no Card do Kanban e Remoção do Menu Tarefas

### Resumo

Duas alterações principais:
1. **Redesenhar o DealCard** para seguir o layout da imagem de referência (estilo SunHub)
2. **Remover "Tarefas" do menu lateral** -- o módulo de tarefas permanece apenas como seção dentro do Deal View e Resumo

---

### 1. Novo Layout do DealCard

Baseado na imagem de referência, o card terá 3 linhas:

```text
+--------------------------------------------+
| Titulo do Negocio           [copy] [edit]  |
| Nome do Cliente...    R$ 17.000,04         |
|------------------------------------------- |
| [Avatar]  [task icons]           [698d]    |
+--------------------------------------------+
```

**Linha 1**: Titulo (bold, truncado) + icones de acao (copiar, editar) alinhados a direita, visiveis no hover

**Linha 2**: Nome do contato/organizacao (truncado, cinza) + valor monetario alinhado a direita

**Linha 3** (separada por borda fina): Avatar do responsavel (esquerda) + icones de status de tarefa (pequenos, coloridos, centro) + badge com dias na etapa (direita, apenas 1 contador como na imagem)

Mudancas em relacao ao card atual:
- Valor sobe para a segunda linha, ao lado do nome do cliente (em vez de bloco separado)
- Remove o contador "dias no funil" -- mantém apenas "dias na etapa"
- Icones de acao mudam de dropdown "..." para icones diretos (copiar, editar) visiveis no hover
- Badge de dias fica com estilo mais discreto (chip verde como na imagem)

---

### 2. Remover "Tarefas" do Menu Lateral

**AppSidebar.tsx**: Remover o item "Tarefas" (`/tarefas`) do array `navItems`

**App.tsx**: Remover a rota `/tarefas` e o import de `TasksPage`

A pagina `TasksPage.tsx` pode ser mantida no codigo como referencia, mas nao sera acessivel via navegacao. As tarefas continuam acessiveis dentro da tela do negocio (Deal View) e do Resumo (Dashboard).

---

### Detalhes Tecnicos

**Arquivos modificados:**
- `src/components/kanban/DealCard.tsx` -- redesenho completo do layout
- `src/components/layout/AppSidebar.tsx` -- remover item "Tarefas"
- `src/App.tsx` -- remover rota `/tarefas`

**Nenhuma alteracao no banco de dados** -- apenas mudancas visuais e de navegacao.

