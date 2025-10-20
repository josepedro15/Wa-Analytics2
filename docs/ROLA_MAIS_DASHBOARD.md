# Dashboard RolaMais - Documentação

## 📋 Visão Geral

O Dashboard RolaMais é uma funcionalidade exclusiva criada para o usuário específico `bdc06188-645d-4a2d-91cc-a02e44dea18b`. Esta página permite visualizar relatórios HTML personalizados da empresa RolaMais.

## 🔐 Acesso Restrito

- **Usuário Autorizado**: `bdc06188-645d-4a2d-91cc-a02e44dea18b`
- **Rota**: `/rolamais`
- **Proteção**: Verificação automática de ID do usuário
- **Redirecionamento**: Usuários não autorizados são redirecionados para o dashboard principal

## 🏢 Filiais Disponíveis

| ID | Nome | Descrição |
|----|------|-----------|
| `rolamais-main` | RolaMais | RolaMais Principal |

## 🗄️ Estrutura do Banco de Dados

### Tabela `html_RolaMais`
```sql
CREATE TABLE html_RolaMais (
  id int8 PRIMARY KEY,
  html text NOT NULL,
  data text NOT NULL,
  atendente text NOT NULL
);
```

### Campos:
- **id**: Identificador único do registro
- **html**: Conteúdo HTML do relatório
- **data**: Data/hora do relatório (formato ISO)
- **atendente**: Nome da filial (deve corresponder exatamente aos valores definidos)

## 🚀 Como Usar

### 1. Acesso
- Faça login com o usuário autorizado
- No dashboard principal, clique em "Dashboard RolaMais" (botão laranja)
- Ou navegue diretamente para `/rolamais`

### 2. Seleção de Filial
- Escolha a filial RolaMais disponível
- A filial tem ícone de raio (Zap) e cor laranja/vermelha
- Tipo: "Principal"

### 3. Filtro por Data
- Use o campo de data para filtrar relatórios específicos
- Deixe vazio para ver o relatório mais recente
- Clique em "Limpar Filtro" para remover o filtro

### 4. Visualização
- O relatório HTML é renderizado em uma área dedicada
- Use "Baixar PDF" para download do relatório
- Botão "Atualizar" para recarregar dados

## 🔧 Funcionalidades Técnicas

### Hooks Criados
- `useRolaMaisData`: Busca dados gerais da tabela html_RolaMais
- `useRolaMaisBranchData`: Busca dados específicos de uma filial

### Componentes Criados
- `RolaMaisBranchSelector`: Seletor de filiais e filtros
- `RolaMaisReportViewer`: Visualizador de relatórios HTML
- `RolaMaisDashboard`: Página principal
- `RolaMaisRedirect`: Componente de redirecionamento

### Recursos Implementados
- ✅ Verificação de autorização por ID de usuário
- ✅ Cache inteligente com TanStack Query
- ✅ Filtros por data e filial
- ✅ Renderização segura de HTML
- ✅ Download de relatórios em PDF
- ✅ Interface responsiva
- ✅ Tratamento de erros
- ✅ Loading states
- ✅ Notificações toast

## 🛡️ Segurança

### Verificações Implementadas
1. **Autenticação**: Usuário deve estar logado
2. **Autorização**: Apenas ID específico tem acesso
3. **Sanitização**: HTML é renderizado com `dangerouslySetInnerHTML` (considerar sanitização adicional)
4. **RLS**: Dados protegidos por Row Level Security do Supabase

### Recomendações de Segurança
- Considerar implementar sanitização do HTML antes da renderização
- Adicionar logs de acesso para auditoria
- Implementar rate limiting para evitar abuso

## 📱 Interface do Usuário

### Design
- Interface consistente com o resto da aplicação
- Cores laranja/vermelha específicas para RolaMais
- Ícone de raio (Zap) para identificação visual
- Feedback visual para ações do usuário

### Responsividade
- Layout adaptável para mobile e desktop
- Cards responsivos para seleção de filiais
- Visualizador de HTML com scroll otimizado

## 🔄 Fluxo de Dados

1. **Verificação de Acesso**: Sistema verifica se usuário está autorizado
2. **Seleção de Filial**: Usuário escolhe a filial RolaMais
3. **Aplicação de Filtros**: Sistema aplica filtros de data se selecionados
4. **Busca de Dados**: Query no Supabase para buscar HTML correspondente
5. **Renderização**: HTML é renderizado de forma segura
6. **Interação**: Usuário pode baixar PDF, atualizar dados, etc.

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de Acesso Negado**
- Verificar se o usuário está logado
- Confirmar se o ID do usuário está correto
- Verificar se a rota está acessível

**Relatório Não Encontrado**
- Verificar se existe dados na tabela `html_RolaMais`
- Confirmar se o campo `atendente` corresponde exatamente aos valores definidos
- Verificar se os filtros de data não estão muito restritivos

**HTML Não Renderiza**
- Verificar se o campo `html` contém HTML válido
- Verificar se não há caracteres especiais que quebram o HTML
- Considerar implementar sanitização adicional

### Logs Úteis
- Verificar console do navegador para erros de JavaScript
- Verificar network tab para falhas de API
- Verificar logs do Supabase para problemas de query

## 🔮 Melhorias Futuras

### Funcionalidades Sugeridas
- [ ] Sanitização de HTML para maior segurança
- [ ] Cache offline com Service Worker
- [ ] Notificações push para novos relatórios
- [ ] Histórico de visualizações
- [ ] Favoritos por filial
- [ ] Compartilhamento de relatórios
- [ ] Exportação em múltiplos formatos
- [ ] Busca por conteúdo dos relatórios

### Otimizações
- [ ] Lazy loading de relatórios grandes
- [ ] Compressão de HTML no banco
- [ ] CDN para assets estáticos
- [ ] PWA para uso offline

## 📞 Suporte

Para problemas ou dúvidas sobre o Dashboard RolaMais:
- Verificar logs do console do navegador
- Confirmar dados na tabela `html_RolaMais`
- Verificar permissões do usuário
- Contatar equipe de desenvolvimento

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Desenvolvido por**: Equipe MetricsIA
