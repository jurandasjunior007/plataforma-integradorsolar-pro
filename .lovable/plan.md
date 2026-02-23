

## Parte 1 — Migracao SQL (Correcao Critica + Novas Tabelas)

A migracao NUNCA foi executada nas tentativas anteriores. Este plano executa APENAS a migracao SQL para desbloquear tudo.

---

### O que sera feito (1 unica migracao SQL)

**1A. Corrigir RLS da tabela `checklist_items`**
- A tabela so tem politica RESTRICTIVE, que bloqueia todas as operacoes mesmo para usuarios autenticados
- Sera adicionada uma politica PERMISSIVE que permite operacoes quando `company_id` do registro bate com o `company_id` do usuario logado

**1B. Criar tabela `role_permissions`**
- Colunas: id (uuid), company_id, role (app_role), permission (text), granted (boolean), created_at
- Constraint UNIQUE em (company_id, role, permission) para evitar duplicatas
- RLS com politica RESTRICTIVE + PERMISSIVE para isolamento por empresa

**1C. Criar tabela `checklist_templates`**
- Colunas: id (uuid), company_id, name, sector (default 'geral'), template_data (jsonb), created_by, created_at, is_system (boolean)
- RLS com politica RESTRICTIVE + PERMISSIVE para isolamento por empresa

---

### Acao necessaria do usuario

Quando eu iniciar a implementacao, aparecera um botao/popup pedindo para confirmar a execucao do SQL. Voce precisa clicar em "Aprovar" para que o SQL seja executado no banco de dados.

Sem essa confirmacao, nada avanca — foi exatamente isso que travou nas vezes anteriores.

---

### Apos a migracao

Com a migracao concluida, as Partes 2-4 (select dinamico, tooltip, CRUD de etapas) poderao ser implementadas sem travamento.

