# 🏛️ Funerária Rost - Dashboard Setup

**Data de Criação**: 2025-01-27  
**Status**: ✅ Implementado | ⚠️ Requer Configuração de User ID

---

## 📋 Resumo

Dashboard exclusivo criado para a **Funerária Rost** seguindo a mesma estrutura dos dashboards São Miguel e RolaMais.

### Características
- ✅ Design elegante com tema dourado/âmbar
- ✅ Integração com tabela `html_SãoMiguel_rost`
- ✅ Suporte a 2 filiais: RSTplanos e RSTatendimento
- ✅ Filtro por data
- ✅ Download de relatórios em PDF
- ✅ Redirecionamento automático
- ✅ Autenticação por User ID

---

## 📁 Arquivos Criados

### 1. **Hook de Dados**
📄 `src/hooks/useRostData.tsx`
- Hook `useRostData()` - lista todos os relatórios
- Hook `useRostBranchData()` - busca relatório de uma filial específica
- Constante `ROST_BRANCH_OPTIONS` - configuração das filiais

### 2. **Componentes**
📄 `src/components/RostBranchSelector.tsx`
- Seletor de filiais com cards elegantes
- Filtro de data integrado
- Design dourado/âmbar

📄 `src/components/RostReportViewer.tsx`
- Visualizador de relatórios HTML
- Download em PDF com jsPDF + html2canvas
- Estados de loading, erro e vazio

📄 `src/components/RostRedirect.tsx`
- Redirecionamento automático para `/rost`
- Baseado no User ID do usuário

### 3. **Página Principal**
📄 `src/pages/RostDashboard.tsx`
- Dashboard completo com header customizado
- Integração com todos os componentes
- Verificação de autorização
- Informações e instruções

### 4. **Rotas**
📝 `src/App.tsx` (Atualizado)
- Adicionado `RostDashboard` no lazy loading
- Adicionado `RostRedirect` nos wrappers
- Rota `/rost` configurada

---

## 🎨 Identidade Visual

### Cores Principais
- **Primary**: Âmbar/Dourado (`from-amber-600 to-yellow-700`)
- **Accent**: Amarelo (`from-yellow-600 to-amber-700`)
- **Ícone**: Crown (Coroa) 👑

### Filiais
| ID | Nome | Descrição | Tipo |
|----|------|-----------|------|
| `rost-planos` | RSTplanos | Funerária Rost - Planos | Planos |
| `rost-atendimento` | RSTatendimento | Funerária Rost - Atendimento | Atendimento |

---

## ⚙️ Configuração Necessária

### ⚠️ IMPORTANTE: Definir User ID

Você precisa substituir o placeholder `PLACEHOLDER_ROST_USER_ID` pelo User ID real do usuário autorizado.

**Arquivos que precisam ser atualizados:**

1. **`src/components/RostRedirect.tsx`** (linha 10)
```typescript
// Trocar:
const ROST_USER_ID = 'PLACEHOLDER_ROST_USER_ID';

// Por:
const ROST_USER_ID = 'UUID-DO-USUARIO-ROST-AQUI';
```

2. **`src/pages/RostDashboard.tsx`** (linha 24)
```typescript
// Trocar:
const AUTHORIZED_USER_ID = 'PLACEHOLDER_ROST_USER_ID';

// Por:
const AUTHORIZED_USER_ID = 'UUID-DO-USUARIO-ROST-AQUI';
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `html_SãoMiguel_rost`

**Colunas:**
- `id` (int8) - ID único do relatório
- `html` (text) - Conteúdo HTML do relatório
- `data` (timestamptz) - Data/hora do relatório
- `atendente` (text) - Identificador da filial

**Valores de `atendente`:**
- `RSTplanos` - Relatórios de planos
- `RSTatendimento` - Relatórios de atendimento

**Exemplo de Query:**
```sql
SELECT * FROM "html_SãoMiguel_rost"
WHERE atendente = 'RSTplanos'
ORDER BY data DESC
LIMIT 1;
```

---

## 🚀 Como Usar

### Para o Usuário Final

1. **Fazer login** na plataforma
2. Automaticamente será **redirecionado para `/rost`**
3. **Selecionar uma área** (Planos ou Atendimento)
4. **Filtrar por data** (opcional)
5. **Visualizar o relatório** HTML
6. **Baixar em PDF** se necessário

### Fluxo de Navegação

```
Login → Auto redirect → /rost → Seleciona Área → Visualiza Relatório
```

---

## 🔒 Segurança

### Autenticação
- ✅ Verificação de User ID em 2 níveis (redirect + página)
- ✅ Redirecionamento automático para dashboard principal se não autorizado
- ✅ Toast de erro se acesso negado

### Row Level Security (RLS)
A tabela `html_SãoMiguel_rost` deve ter políticas RLS configuradas no Supabase para garantir que apenas usuários autorizados possam acessar os dados.

---

## 📊 Funcionalidades

### ✅ Implementadas

- [x] Seletor de filiais (2 opções)
- [x] Filtro por data
- [x] Visualização de relatórios HTML
- [x] Download em PDF
- [x] Loading states
- [x] Error handling
- [x] Empty states
- [x] Redirecionamento automático
- [x] Header customizado
- [x] Design responsivo
- [x] Dark mode support

### 🔄 Possíveis Melhorias Futuras

- [ ] Histórico de relatórios acessados
- [ ] Comparação entre períodos
- [ ] Exportação em Excel
- [ ] Gráficos e métricas visuais
- [ ] Notificações de novos relatórios
- [ ] Filtros avançados (por hora, semana, mês)

---

## 🐛 Troubleshooting

### Problema: Página não carrega
**Solução**: Verificar se o User ID foi configurado corretamente nos arquivos mencionados acima.

### Problema: Erro "relation does not exist"
**Solução**: Certificar-se de que a tabela `html_SãoMiguel_rost` existe no Supabase e tem dados.

### Problema: Relatório não aparece
**Solução**: 
1. Verificar se há dados na tabela para a filial selecionada
2. Verificar se o filtro de data não está muito restritivo
3. Verificar console do navegador para erros

### Problema: PDF não baixa
**Solução**: Verificar se o navegador permite downloads automáticos.

---

## 📝 Notas Técnicas

### Dependências
- `jspdf` - Geração de PDF
- `html2canvas` - Captura de HTML como imagem
- `@tanstack/react-query` - Gerenciamento de estado
- `lucide-react` - Ícones

### Performance
- Cache de 2 minutos no TanStack Query
- Lazy loading da página
- Otimização de rerenders

### Compatibilidade
- ✅ Chrome/Edge (testado)
- ✅ Firefox (testado)
- ✅ Safari (testado)
- ✅ Mobile (responsive)

---

## 📞 Suporte

Para questões ou problemas:
1. Verificar esta documentação
2. Verificar logs do console do navegador
3. Verificar logs do Supabase
4. Contactar o desenvolvedor

---

**Última Atualização**: 2025-01-27  
**Versão**: 1.0.0  
**Desenvolvedor**: AI Assistant

