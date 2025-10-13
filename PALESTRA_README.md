# 🎯 Sistema de Captura de Leads - Palestra

## ✅ O que foi criado?

Um sistema completo de captura de leads em **3 páginas**:

### 1️⃣ `/palestra` - Página de Captura
- **Campos**: Nome, Email, WhatsApp
- **Validação**: Todos obrigatórios com formatação automática
- **Ação**: Salva no Supabase → Redireciona para gatilhos

### 2️⃣ `/palestra/gatilhos` - Seleção de Interesse
- **3 Opções**:
  - 🗂️ Quero ver um relatório de exemplo
  - 💡 Quero entender melhor como funciona
  - 💼 Como isso pode se aplicar no meu negócio?
- **Ação**: Atualiza banco → Envia webhook → Redireciona

### 3️⃣ `/palestra/obrigado` - Confirmação
- Mensagem de sucesso
- Próximos passos
- Botões de ação

---

## 🚀 Como Usar (Quick Start)

### **Passo 1: Aplicar Migration**

No **Supabase SQL Editor**, execute:

```sql
-- Copie todo o conteúdo do arquivo:
-- database/supabase/migrations/20250114000000_create_palestra_leads.sql

-- E cole no SQL Editor do Supabase
```

### **Passo 2: Testar**

```bash
# Iniciar servidor
npm run dev

# Acessar no navegador
http://localhost:8080/palestra
```

### **Passo 3: Verificar Dados**

No **Supabase** > **Table Editor** > `palestra_leads`:
- Ver leads cadastrados
- Verificar gatilhos selecionados
- Confirmar envio de webhook

---

## 📁 Arquivos Criados

```
📦 Wa-Analytics2-2/
├── 🗄️ database/supabase/migrations/
│   └── 20250114000000_create_palestra_leads.sql
│
├── 🎣 src/hooks/
│   └── usePalestraLead.tsx
│
├── 📄 src/pages/
│   ├── Palestra.tsx
│   ├── PalestraGatilhos.tsx
│   └── PalestraObrigado.tsx
│
├── 🛣️ src/App.tsx (rotas adicionadas)
│
└── 📚 docs/
    └── PALESTRA_SETUP.md
```

---

## 🔍 Testar Fluxo Completo

1. **Acessar**: `http://localhost:8080/palestra`
2. **Preencher**:
   - Nome: João Silva
   - Email: joao@test.com
   - WhatsApp: 11999998888
3. **Clicar**: Continuar
4. **Escolher**: Qualquer uma das 3 opções
5. **Verificar**: Redirecionamento para página de obrigado

### ✅ Verificar no Banco

```sql
-- Ver último lead
SELECT * FROM palestra_leads 
ORDER BY created_at DESC 
LIMIT 1;
```

Deve retornar algo como:
```
id: uuid...
nome: João Silva
email: joao@test.com
telefone: (11) 99999-8888
gatilho: Quero ver um relatório de exemplo
webhook_sent: true
webhook_sent_at: 2025-01-14 10:30:00
created_at: 2025-01-14 10:29:00
updated_at: 2025-01-14 10:30:00
```

---

## 🌐 Webhook

### Endpoint
```
POST https://webhook.aiensed.com/webhook/capturaotto
```

### Payload
```json
{
  "nome": "João Silva",
  "telefone": "(11) 99999-8888",
  "email": "joao@test.com",
  "gatilho": "Quero ver um relatório de exemplo"
}
```

---

## 🎨 Design

### Cores
- **Blue**: `from-blue-600 to-indigo-600`
- **Purple**: `from-purple-500 to-pink-600`
- **Green**: `from-green-500 to-emerald-600`

### Responsivo
- ✅ Mobile First
- ✅ Tablet
- ✅ Desktop

---

## 📊 Monitorar Leads

### Query: Leads de Hoje
```sql
SELECT COUNT(*) as total_leads_hoje
FROM palestra_leads
WHERE DATE(created_at) = CURRENT_DATE;
```

### Query: Por Gatilho
```sql
SELECT gatilho, COUNT(*) as total
FROM palestra_leads
WHERE gatilho IS NOT NULL
GROUP BY gatilho
ORDER BY total DESC;
```

### Query: Taxa de Conversão
```sql
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN gatilho IS NOT NULL THEN 1 END) as com_gatilho,
  ROUND(100.0 * COUNT(CASE WHEN gatilho IS NOT NULL THEN 1 END) / COUNT(*), 2) as taxa_percent
FROM palestra_leads;
```

---

## 🔧 Troubleshooting

### ❌ "Tabela não existe"
**Solução**: Aplicar migration no Supabase SQL Editor

### ❌ "Erro ao salvar dados"
**Solução**: Verificar políticas RLS no Supabase

### ❌ "Redirecionamento não funciona"
**Solução**: Verificar console do navegador (F12)

### ❌ "Webhook não enviado"
**Solução**: 
1. Verificar Network tab no DevTools
2. Testar endpoint manualmente (curl)
3. Ver logs do webhook

---

## 📝 Próximos Passos

### Opcional - Melhorias Futuras

1. **Analytics**
   - Adicionar Google Analytics/Pixel
   - Track conversões por gatilho

2. **Email Automático**
   - Enviar email de confirmação
   - Sequência de emails

3. **CRM Integration**
   - Integrar com CRM
   - Criar deals automáticos

4. **A/B Testing**
   - Testar diferentes copies
   - Diferentes layouts

5. **Admin Panel**
   - Visualizar leads no admin
   - Exportar leads

---

## 🎓 Documentação Completa

Para mais detalhes, consulte: `docs/PALESTRA_SETUP.md`

---

**Criado por**: José Pedro  
**Data**: 14/01/2025  
**Versão**: 1.0.0  
**Status**: ✅ Pronto para uso

