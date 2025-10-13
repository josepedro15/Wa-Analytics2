# 🎯 Setup - Sistema de Captura de Leads (Palestra)

## 📋 Visão Geral

Sistema completo de captura de leads em duas etapas:
1. **Página de Captura** (`/palestra`): Coleta nome, email e telefone
2. **Página de Gatilhos** (`/palestra/gatilhos`): Usuário escolhe interesse
3. **Página de Obrigado** (`/palestra/obrigado`): Confirmação final

## 🗄️ Configuração do Banco de Dados

### 1. Aplicar Migration

Execute a migration no Supabase SQL Editor:

```bash
# No terminal (se usando Supabase CLI)
supabase db push

# OU copie e execute manualmente no SQL Editor do Supabase:
# database/supabase/migrations/20250114000000_create_palestra_leads.sql
```

### 2. Verificar Tabela Criada

No Supabase SQL Editor, execute:

```sql
-- Verificar se tabela foi criada
SELECT * FROM palestra_leads LIMIT 1;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'palestra_leads';

-- Verificar índices
SELECT * FROM pg_indexes WHERE tablename = 'palestra_leads';
```

### 3. Estrutura da Tabela

```sql
palestra_leads:
  - id (UUID, PK)
  - nome (TEXT, NOT NULL)
  - email (TEXT, NOT NULL)
  - telefone (TEXT, NOT NULL)
  - gatilho (TEXT, NULLABLE)
  - webhook_sent (BOOLEAN, DEFAULT FALSE)
  - webhook_sent_at (TIMESTAMPTZ, NULLABLE)
  - created_at (TIMESTAMPTZ, DEFAULT NOW())
  - updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

## 🔐 Políticas de Segurança (RLS)

A tabela possui as seguintes políticas:

- ✅ **INSERT público**: Qualquer pessoa pode inserir dados (captura de leads)
- ✅ **SELECT autenticado**: Apenas usuários autenticados podem visualizar
- ✅ **UPDATE apenas admins**: Apenas admins podem atualizar registros

## 🌐 Webhook Configuration

### Endpoint

```
POST https://webhook.aiensed.com/webhook/capturaotto
```

### Payload Enviado

```json
{
  "nome": "Nome do Lead",
  "telefone": "(11) 99999-9999",
  "email": "email@example.com",
  "gatilho": "Quero ver um relatório de exemplo"
}
```

### Quando é Enviado

O webhook é disparado quando o usuário seleciona uma das 3 opções de interesse na página `/palestra/gatilhos`.

## 📱 Fluxo do Usuário

### Passo 1: Captura de Dados (`/palestra`)

**Campos:**
- Nome Completo (mínimo 3 caracteres)
- Email (validação de formato)
- WhatsApp (formatação automática)

**Validações:**
- Todos os campos são obrigatórios
- Email deve ser válido
- Telefone: 10-15 dígitos
- Formatação automática: `(XX) XXXXX-XXXX`

**Ação ao Enviar:**
1. Validar dados
2. Salvar no Supabase (`palestra_leads`)
3. Armazenar dados no `sessionStorage`
4. Redirecionar para `/palestra/gatilhos`

### Passo 2: Seleção de Interesse (`/palestra/gatilhos`)

**Opções Disponíveis:**

1. 🗂️ **Quero ver um relatório de exemplo**
   - Ver demonstração prática

2. 💡 **Quero entender melhor como funciona**
   - Conhecer o processo completo

3. 💼 **Como isso pode se aplicar no meu negócio?**
   - Personalização para negócio específico

**Ação ao Clicar:**
1. Atualizar registro no banco (adicionar gatilho)
2. Enviar dados para webhook
3. Marcar como `webhook_sent = true`
4. Redirecionar para `/palestra/obrigado`

### Passo 3: Confirmação (`/palestra/obrigado`)

**Exibir:**
- Mensagem de sucesso
- Próximos passos
- Informações de contato
- Botões de navegação

## 🎨 Design e UX

### Cores e Gradientes

```css
/* Paleta Principal */
Blue Gradient: from-blue-600 to-indigo-600
Purple Gradient: from-purple-500 to-pink-600
Green Gradient: from-green-500 to-emerald-600

/* Backgrounds */
Page Background: from-blue-50 via-indigo-50 to-purple-50
Card Background: white/90 with backdrop-blur
```

### Ícones

- **Palestra**: `Sparkles`
- **Usuário**: `User`
- **Email**: `Mail`
- **Telefone**: `Phone`
- **Sucesso**: `CheckCircle`
- **Gatilhos**: `FileText`, `Lightbulb`, `Briefcase`

## 🧪 Testar o Fluxo

### 1. Teste Manual

```bash
# Iniciar servidor
npm run dev

# Acessar
http://localhost:8080/palestra
```

### 2. Teste de Captura

1. Preencher formulário
2. Verificar validações (campo vazio, email inválido, etc.)
3. Submeter dados válidos
4. Verificar redirecionamento

### 3. Verificar no Banco

```sql
-- Ver leads cadastrados
SELECT * FROM palestra_leads 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver leads com gatilho
SELECT nome, email, gatilho, webhook_sent, created_at 
FROM palestra_leads 
WHERE gatilho IS NOT NULL
ORDER BY created_at DESC;
```

### 4. Testar Webhook

```bash
# Verificar logs do webhook (se disponível)
# ou usar ferramenta como RequestBin para debug

# Verificar se webhook_sent = true após escolher gatilho
SELECT id, nome, gatilho, webhook_sent, webhook_sent_at 
FROM palestra_leads 
WHERE webhook_sent = true
ORDER BY webhook_sent_at DESC;
```

## 📊 Monitoramento

### Queries Úteis

```sql
-- Total de leads hoje
SELECT COUNT(*) as total_leads_hoje
FROM palestra_leads
WHERE DATE(created_at) = CURRENT_DATE;

-- Leads por gatilho
SELECT gatilho, COUNT(*) as total
FROM palestra_leads
WHERE gatilho IS NOT NULL
GROUP BY gatilho
ORDER BY total DESC;

-- Taxa de conversão (gatilho escolhido)
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN gatilho IS NOT NULL THEN 1 END) as com_gatilho,
  ROUND(
    100.0 * COUNT(CASE WHEN gatilho IS NOT NULL THEN 1 END) / COUNT(*), 
    2
  ) as taxa_conversao_percent
FROM palestra_leads;

-- Webhooks não enviados (retry)
SELECT id, nome, email, telefone, gatilho, created_at
FROM palestra_leads
WHERE gatilho IS NOT NULL 
  AND webhook_sent = false
ORDER BY created_at DESC;

-- Leads por dia (últimos 7 dias)
SELECT 
  DATE(created_at) as data,
  COUNT(*) as total,
  COUNT(CASE WHEN gatilho IS NOT NULL THEN 1 END) as com_gatilho
FROM palestra_leads
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

## 🔧 Troubleshooting

### Lead não está sendo salvo

1. Verificar se migration foi aplicada:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'palestra_leads';
   ```

2. Verificar políticas RLS:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'palestra_leads';
   ```

3. Verificar console do navegador para erros

### Webhook não está sendo enviado

1. Verificar URL do webhook no código:
   ```typescript
   // src/hooks/usePalestraLead.tsx (linha ~52)
   const webhookResponse = await fetch('https://webhook.aiensed.com/webhook/capturaotto', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(webhookPayload)
   });
   ```

2. Verificar logs do navegador (Network tab)

3. Testar webhook manualmente:
   ```bash
   curl -X POST https://webhook.aiensed.com/webhook/capturaotto \
     -H "Content-Type: application/json" \
     -d '{
       "nome": "Teste",
       "telefone": "(11) 99999-9999",
       "email": "teste@example.com",
       "gatilho": "Teste"
     }'
   ```

### Redirecionamento não funciona

1. Verificar se dados estão no sessionStorage:
   ```javascript
   // No console do navegador
   console.log(sessionStorage.getItem('palestraLeadData'));
   ```

2. Verificar rotas no `App.tsx`

## 📝 Manutenção

### Limpar Dados de Teste

```sql
-- Deletar leads de teste
DELETE FROM palestra_leads
WHERE email LIKE '%@test.com' OR email LIKE '%@example.com';

-- Resetar tabela (CUIDADO!)
TRUNCATE TABLE palestra_leads RESTART IDENTITY CASCADE;
```

### Backup de Dados

```sql
-- Exportar para CSV
COPY (
  SELECT * FROM palestra_leads 
  ORDER BY created_at DESC
) TO '/tmp/palestra_leads_backup.csv' 
WITH CSV HEADER;
```

## 🚀 Deploy

### Checklist

- [ ] Migration aplicada no Supabase de produção
- [ ] Políticas RLS configuradas
- [ ] Webhook testado e funcionando
- [ ] Páginas testadas em produção
- [ ] Analytics configurado (opcional)
- [ ] Monitoramento configurado

### Variáveis de Ambiente

Não é necessário adicionar novas variáveis de ambiente. O sistema usa:
- `VITE_SUPABASE_URL` (já existente)
- `VITE_SUPABASE_ANON_KEY` (já existente)

---

## 📧 Suporte

Para dúvidas ou problemas:
1. Verificar logs do navegador
2. Verificar logs do Supabase
3. Consultar queries de monitoramento acima
4. Revisar código dos hooks e páginas

