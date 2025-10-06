# Dashboard São Miguel - Documentação

## 📋 Visão Geral

O Dashboard São Miguel é uma funcionalidade exclusiva criada para o usuário específico `1c93324c-65d3-456e-992e-c84e1f7d6ab1`. Esta página permite visualizar relatórios HTML personalizados de 5 filiais diferentes da empresa São Miguel.

## 🔐 Acesso Restrito

- **Usuário Autorizado**: `1c93324c-65d3-456e-992e-c84e1f7d6ab1`
- **Rota**: `/sao-miguel`
- **Proteção**: Verificação automática de ID do usuário
- **Redirecionamento**: Usuários não autorizados são redirecionados para o dashboard principal

## 🏢 Filiais Disponíveis

| ID | Nome | Descrição |
|----|------|-----------|
| `smv-planos` | SMVplanoSMVplanos | São Miguel Viamão planos |
| `smv-atendimento` | SMVatendimwnto | São Miguel Viamão atendimento |
| `smpoa-atendimento` | SMPOAatendimento | São Miguel Porto Alegre atendimento |
| `rost-atendimento` | SMVplanoRSTatendimento | Rost atendimento |
| `rost-planos` | SMVplanoRSTPlanos | Rost planos |

## 🗄️ Estrutura do Banco de Dados

### Tabela `html`
```sql
CREATE TABLE html (
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
- No dashboard principal, clique em "Dashboard São Miguel" (botão azul)
- Ou navegue diretamente para `/sao-miguel`

### 2. Seleção de Filial
- Escolha uma das 5 filiais disponíveis
- Cada filial tem um ícone e cor específica
- Filiais de "Planos" têm ícone de gráfico (TrendingUp)
- Filiais de "Atendimento" têm ícone de usuários (Users)

### 3. Filtro por Data
- Use o campo de data para filtrar relatórios específicos
- Deixe vazio para ver o relatório mais recente
- Clique em "Limpar Filtro" para remover o filtro

### 4. Visualização
- O relatório HTML é renderizado em uma área dedicada
- Use "Tela Cheia" para visualização expandida
- Baixe o HTML para uso offline
- Abra em nova aba para visualização separada

## 🔧 Funcionalidades Técnicas

### Hooks Criados
- `useSaoMiguelData`: Busca dados gerais da tabela html
- `useBranchData`: Busca dados específicos de uma filial

### Componentes Criados
- `SaoMiguelBranchSelector`: Seletor de filiais e filtros
- `SaoMiguelReportViewer`: Visualizador de relatórios HTML
- `SaoMiguelDashboard`: Página principal

### Recursos Implementados
- ✅ Verificação de autorização por ID de usuário
- ✅ Cache inteligente com TanStack Query
- ✅ Filtros por data e filial
- ✅ Renderização segura de HTML
- ✅ Download de relatórios
- ✅ Visualização em tela cheia
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
- Cores específicas para cada filial
- Ícones intuitivos para diferentes tipos de relatório
- Feedback visual para ações do usuário

### Responsividade
- Layout adaptável para mobile e desktop
- Cards responsivos para seleção de filiais
- Visualizador de HTML com scroll otimizado

## 🔄 Fluxo de Dados

1. **Verificação de Acesso**: Sistema verifica se usuário está autorizado
2. **Seleção de Filial**: Usuário escolhe uma das 5 filiais
3. **Aplicação de Filtros**: Sistema aplica filtros de data se selecionados
4. **Busca de Dados**: Query no Supabase para buscar HTML correspondente
5. **Renderização**: HTML é renderizado de forma segura
6. **Interação**: Usuário pode baixar, visualizar em tela cheia, etc.

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de Acesso Negado**
- Verificar se o usuário está logado
- Confirmar se o ID do usuário está correto
- Verificar se a rota está acessível

**Relatório Não Encontrado**
- Verificar se existe dados na tabela `html`
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
- [ ] Exportação em PDF
- [ ] Busca por conteúdo dos relatórios

### Otimizações
- [ ] Lazy loading de relatórios grandes
- [ ] Compressão de HTML no banco
- [ ] CDN para assets estáticos
- [ ] PWA para uso offline

## 📞 Suporte

Para problemas ou dúvidas sobre o Dashboard São Miguel:
- Verificar logs do console do navegador
- Confirmar dados na tabela `html`
- Verificar permissões do usuário
- Contatar equipe de desenvolvimento

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Desenvolvido por**: Equipe MetricsIA
