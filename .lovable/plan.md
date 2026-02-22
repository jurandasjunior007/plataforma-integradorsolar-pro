
# Plano: Menu "Cadastro" - Base do CRM

## Resumo
Reestruturar o menu lateral substituindo "Clientes" por "Cadastro" com submenus (Pessoas, Empresas, Enderecos, Importacao, Duplicidades), migrar as tabelas do banco para suportar todos os campos necessarios (PF/PJ), criar tabelas novas (addresses, contact_channels, audit_logs), implementar RLS granular por role, e construir as telas completas com listagem, busca, filtros, drawer de detalhe com abas, validacao com mascaras e auditoria.

---

## Fase 1: Migracao do Banco de Dados

### 1.1 Alterar tabela `contacts` (Pessoas PF)
Adicionar colunas faltantes:
- `type` TEXT DEFAULT 'person'
- `full_name` TEXT (renomear `name` para `full_name` via alias ou nova coluna)
- `rg`, `birth_date`, `whatsapp` (whatsapp ja existe)
- `status_cadastro` TEXT DEFAULT 'ativo'
- `owner_user_id` UUID (responsavel comercial)
- `tags` TEXT[] DEFAULT '{}'
- `deleted_at` TIMESTAMPTZ (soft delete)

Renomear campos para padroes solicitados:
- `email` -> `email_principal`
- `phone` -> `phone_principal`
- `whatsapp` -> `whatsapp_principal`

Criar indice unico parcial: `(company_id, cpf) WHERE deleted_at IS NULL AND cpf IS NOT NULL`

### 1.2 Alterar tabela `organizations` (Empresas PJ)
Adicionar colunas:
- `legal_name` TEXT (renomear `name`)
- `trade_name` TEXT
- `state_registration_ie` TEXT
- `whatsapp_principal` TEXT
- `status_cadastro` TEXT DEFAULT 'ativo'
- `owner_user_id` UUID
- `segment` TEXT
- `deleted_at` TIMESTAMPTZ

Renomear: `email` -> `email_principal`, `phone` -> `phone_principal`

Criar indice unico parcial: `(company_id, cnpj) WHERE deleted_at IS NULL AND cnpj IS NOT NULL`

### 1.3 Criar tabela `addresses`
```
id, company_id, entity_type, entity_id, label, cep,
street, number, complement, neighborhood, city, state,
is_primary, latitude, longitude, created_at, updated_at, deleted_at
```
RLS: tenant isolation por company_id.

### 1.4 Criar tabela `contact_channels`
```
id, company_id, entity_type, entity_id, channel_type,
value, is_primary, created_at, updated_at, deleted_at
```
RLS: tenant isolation por company_id.

### 1.5 Criar/ajustar tabela `audit_logs`
A tabela `audit_log` ja existe mas precisa de ajustes:
- Renomear `details` para campos separados: `before_json` JSONB e `after_json` JSONB
- Ou adicionar `before_json` e `after_json` como colunas extras, mantendo `details`
- Adicionar `entity_type` e `entity_id` (ja existem)
- Garantir que `action` suporte: 'create', 'update', 'soft_delete', 'restore'

### 1.6 Indices
- `contacts(company_id, cpf)`
- `contacts(company_id, phone_principal)`
- `organizations(company_id, cnpj)`
- `addresses(company_id, entity_type, entity_id)`
- `deals(company_id, contact_id)`, `deals(company_id, organization_id)`

### 1.7 RLS granular por role
Para `contacts` e `organizations`:
- **Admin**: SELECT/INSERT/UPDATE/DELETE tudo da empresa
- **Supervisor**: SELECT/INSERT/UPDATE tudo da empresa; DELETE somente se nao houver deals vinculados
- **Vendedor**: SELECT apenas `owner_user_id = auth.uid()`; INSERT com `owner_user_id = auth.uid()`; UPDATE apenas seus proprios

Criar funcao auxiliar `get_user_role()` para uso nas policies.

---

## Fase 2: Sidebar e Rotas

### 2.1 Menu lateral
Substituir item "Clientes" por "Cadastro" com submenu colapsavel:
- Pessoas (`/cadastro/pessoas`)
- Empresas (`/cadastro/empresas`)
- Enderecos (`/cadastro/enderecos`)
- Importacao (`/cadastro/importacao`) - placeholder
- Duplicidades (`/cadastro/duplicidades`) - placeholder

Usar componente `Collapsible` do Shadcn dentro do `SidebarMenu`.

### 2.2 Rotas no App.tsx
Adicionar rotas:
- `/cadastro/pessoas` -> PessoasPage
- `/cadastro/empresas` -> EmpresasPage
- `/cadastro/enderecos` -> EnderecosPage
- `/cadastro/importacao` -> ImportacaoPage (placeholder)
- `/cadastro/duplicidades` -> DuplicidadesPage (placeholder)
- Remover rota `/clientes`

---

## Fase 3: Paginas e Componentes

### 3.1 PessoasPage (Listagem)
- Tabela com colunas: Nome, CPF (mascarado), Telefone, Email, Responsavel, Status
- Busca por nome/CPF/telefone
- Filtros: Status (Ativo/Inativo), Responsavel
- Paginacao
- Botao "Nova Pessoa"
- Acoes por linha: Editar, Inativar/Excluir (conforme permissao)

### 3.2 EmpresasPage (Listagem)
- Similar a Pessoas: Razao Social, CNPJ, Telefone, Segmento, Responsavel, Status
- Mesma estrutura de filtros e acoes

### 3.3 Drawer/Dialog de Detalhe (PessoaDrawer / EmpresaDrawer)
Abas:
- **Dados Principais**: formulario com campos, mascaras (CPF/CNPJ/telefone/CEP), validacao
- **Enderecos**: lista de enderecos com CRUD inline, label (Instalacao/Cobranca/etc), marcacao de primario
- **Contatos**: canais adicionais (telefones/emails extras) via contact_channels
- **Anotacoes**: campo de notas com historico
- **Historico**: timeline de audit_logs filtrada por entity

### 3.4 Componentes reutilizaveis
- `CpfInput` / `CnpjInput` / `PhoneInput` / `CepInput` - inputs com mascara
- `AddressForm` - formulario de endereco reutilizavel
- `ContactChannelList` - lista de canais adicionais
- `AuditTimeline` - timeline de auditoria
- `OwnerSelect` - seletor de responsavel (profiles da empresa)
- `StatusBadge` - badge ativo/inativo

### 3.5 Validacoes no frontend
- CPF: mascara `000.000.000-00`, salvar so digitos
- CNPJ: mascara `00.000.000/0000-00`, salvar so digitos
- Telefone: mascara `(00) 00000-0000`, salvar so digitos
- CEP: mascara `00000-000`
- Email: validar formato
- Nome obrigatorio, responsavel obrigatorio, pelo menos 1 contato

### 3.6 Hooks de dados
- `useContacts()` - CRUD de pessoas com paginacao e filtros
- `useOrganizations()` - CRUD de empresas
- `useAddresses(entityType, entityId)` - enderecos por entidade
- `useContactChannels(entityType, entityId)` - canais extras
- `useAuditLogs(entityType, entityId)` - historico de auditoria

### 3.7 Auditoria
- Ao criar/editar/excluir, inserir registro em `audit_logs` com before/after JSON
- Implementar no frontend via funcao utilitaria que envolve as operacoes de CRUD

---

## Fase 4: Integracoes

### 4.1 Verificacao de duplicidade
- Ao digitar CPF/CNPJ/telefone no formulario, fazer busca em tempo real
- Se encontrar match na mesma empresa, exibir alerta com link para o cadastro existente

### 4.2 Soft delete
- Nunca deletar fisicamente
- Setar `deleted_at = now()`
- Se houver deals vinculados, bloquear exclusao e sugerir "Inativar"
- Filtrar `deleted_at IS NULL` em todas as queries

### 4.3 Placeholder na Administracao
- Botao "Campos personalizados" na area de Admin (placeholder para futuro)

---

## Arquivos a criar/modificar

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar (alterar contacts, organizations, criar addresses, contact_channels, ajustar audit_log, RLS) |
| `src/types/crm.ts` | Atualizar interfaces |
| `src/components/layout/AppSidebar.tsx` | Substituir "Clientes" por "Cadastro" com submenu |
| `src/App.tsx` | Atualizar rotas |
| `src/pages/PessoasPage.tsx` | Criar |
| `src/pages/EmpresasPage.tsx` | Criar |
| `src/pages/EnderecosPage.tsx` | Criar |
| `src/pages/ImportacaoPage.tsx` | Criar (placeholder) |
| `src/pages/DuplicidadesPage.tsx` | Criar (placeholder) |
| `src/components/cadastro/PessoaDrawer.tsx` | Criar |
| `src/components/cadastro/EmpresaDrawer.tsx` | Criar |
| `src/components/cadastro/AddressForm.tsx` | Criar |
| `src/components/cadastro/ContactChannelList.tsx` | Criar |
| `src/components/cadastro/AuditTimeline.tsx` | Criar |
| `src/components/cadastro/CpfInput.tsx` | Criar |
| `src/components/cadastro/CnpjInput.tsx` | Criar |
| `src/components/cadastro/PhoneInput.tsx` | Criar |
| `src/components/cadastro/CepInput.tsx` | Criar |
| `src/components/cadastro/OwnerSelect.tsx` | Criar |
| `src/components/cadastro/StatusBadge.tsx` | Criar |
| `src/hooks/useContacts.ts` | Criar |
| `src/hooks/useOrganizations.ts` | Criar |
| `src/hooks/useAddresses.ts` | Criar |
| `src/hooks/useContactChannels.ts` | Criar |
| `src/hooks/useAuditLogs.ts` | Criar |
| `src/lib/masks.ts` | Criar (funcoes de mascara/normalizacao) |
| `src/lib/audit.ts` | Criar (utilitario de auditoria) |
| `src/pages/ClientsPage.tsx` | Remover |
