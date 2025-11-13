# 🔧 Solução para Erro 500 - Usuário Rost

## 🔴 Problema Identificado

O usuário `rost@metrics.com` (ID: `dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f`) está recebendo erro **500 (Internal Server Error)** ao tentar fazer login.

### Causa Raiz

O erro ocorre porque:

1. **Usuário existe no `auth.users`** mas não tem dados iniciais nas tabelas relacionadas
2. **Políticas RLS** do Supabase bloqueiam acesso quando não há dados no `dashboard_data`
3. **Hook `useDashboardData`** tenta buscar dados que não existem, causando erro no servidor
4. **Falta de dados iniciais** impede o login bem-sucedido

---

## ✅ Solução

### Opção 1: Executar SQL no Supabase (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute o script: `database/fix_rost_user.sql`

O script irá:
- ✅ Verificar se o usuário existe
- ✅ Criar perfil no `profiles` se não existir
- ✅ Criar dados iniciais no `dashboard_data` com valores zerados
- ✅ Verificar políticas RLS
- ✅ Confirmar que tudo foi criado corretamente

### Opção 2: Solução Manual no Supabase Dashboard

1. **Acesse Supabase Dashboard** → SQL Editor
2. **Execute este SQL**:

```sql
-- Criar perfil
INSERT INTO public.profiles (user_id, full_name, role)
VALUES ('dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f', 'Rost', 'vendedor')
ON CONFLICT (user_id) DO NOTHING;

-- Criar dados iniciais do dashboard
INSERT INTO public.dashboard_data (
  user_id,
  periodo_inicio,
  periodo_fim,
  total_atendimentos,
  taxa_conversao,
  tempo_medio_resposta,
  nota_media_qualidade,
  intencao_compra,
  intencao_duvida_geral,
  intencao_reclamacao,
  intencao_suporte,
  intencao_orcamento,
  insights_funcionou,
  insights_atrapalhou,
  automacao_sugerida,
  proximas_acoes,
  meta_taxa_conversao,
  meta_tempo_resposta,
  meta_nota_qualidade
) VALUES (
  'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f',
  CURRENT_DATE,
  CURRENT_DATE,
  0, 0, 0, 0,
  0, 0, 0, 0, 0,
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  '0% / Meta 30%',
  '0s / Meta < 2min',
  '0 / Meta 4,5'
)
ON CONFLICT DO NOTHING;
```

3. **Teste o login novamente**

---

## 🎯 Prevenção Futura

Para evitar que esse erro aconteça com novos usuários:

### 1. Criar Trigger Automático

Adicione este trigger no Supabase para criar dados iniciais automaticamente quando um novo usuário se registrar:

```sql
-- Função para criar dados iniciais
CREATE OR REPLACE FUNCTION create_user_initial_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'vendedor')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Criar dashboard inicial
  INSERT INTO public.dashboard_data (
    user_id,
    periodo_inicio,
    periodo_fim,
    total_atendimentos,
    taxa_conversao,
    tempo_medio_resposta,
    nota_media_qualidade,
    intencao_compra,
    intencao_duvida_geral,
    intencao_reclamacao,
    intencao_suporte,
    intencao_orcamento,
    insights_funcionou,
    insights_atrapalhou,
    automacao_sugerida,
    proximas_acoes,
    meta_taxa_conversao,
    meta_tempo_resposta,
    meta_nota_qualidade
  ) VALUES (
    NEW.id,
    CURRENT_DATE,
    CURRENT_DATE,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    '0% / Meta 30%',
    '0s / Meta < 2min',
    '0 / Meta 4,5'
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_initial_data();
```

### 2. Melhorar Hook useDashboardData

Atualizar o hook para lidar melhor com usuários novos:

```typescript
// src/hooks/useDashboardData.tsx (linha 61)
export function useDashboardData(selectedDate?: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-data', user?.id, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<DashboardDataWithComparison | null> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        // Buscar dados do dia selecionado
        let currentDayQuery = supabase
          .from('dashboard_data')
          .select('*')
          .eq('user_id', user.id);

        if (selectedDate) {
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          currentDayQuery = currentDayQuery
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());
        }

        const { data: currentData, error: currentError } = await currentDayQuery
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Se não há dados, criar dados iniciais
        if (currentError && currentError.code === 'PGRST116') {
          logger.info('Criando dados iniciais para novo usuário', { userId: user.id });
          const newData = await createInitialDashboardData(user.id);
          return newData ? await addComparisonData(newData, user.id, selectedDate) : null;
        }

        if (currentError) {
          logger.error('Erro ao buscar dados do dashboard', currentError);
          throw currentError;
        }

        // Adicionar dados de comparação
        return await addComparisonData(currentData, user.id, selectedDate);
      } catch (error) {
        logger.error('Erro no useDashboardData', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

### 3. Adicionar Tratamento de Erro no Dashboard

```typescript
// src/pages/Dashboard.tsx
if (dataError) {
  // Se o erro for de dados não encontrados, criar dados iniciais
  if (dataError.message.includes('PGRST116')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Configurando sua conta...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Estamos preparando seu dashboard. Isso levará apenas alguns segundos.
            </p>
            <Button onClick={() => refetch()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Outros erros...
}
```

---

## 🧪 Testes

Após aplicar a solução:

1. ✅ Faça logout
2. ✅ Limpe o cache do navegador (Ctrl+Shift+Del)
3. ✅ Faça login com `rost@metrics.com`
4. ✅ Verifique se o dashboard carrega corretamente
5. ✅ Teste navegação entre páginas

---

## 📊 Status

- ⚠️ **Erro Atual**: 500 Internal Server Error
- ✅ **Causa**: Dados iniciais não criados para o usuário
- ✅ **Solução**: Script SQL criado
- ⏳ **Próximos Passos**: Executar script e testar

---

## 🔍 Debug Adicional

Se o problema persistir após executar o script, verifique:

### 1. No Console do Navegador:
```javascript
// Verificar o usuário logado
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)

// Verificar dashboard_data
const { data, error } = await supabase
  .from('dashboard_data')
  .select('*')
  .eq('user_id', user.id)
console.log('Dashboard Data:', data, error)
```

### 2. No Supabase Dashboard:
```sql
-- Verificar dados do usuário
SELECT * FROM auth.users WHERE id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';
SELECT * FROM public.profiles WHERE user_id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';
SELECT * FROM public.dashboard_data WHERE user_id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'dashboard_data';
```

---

## 📞 Suporte

Se o problema persistir:

1. Envie os logs do console do navegador
2. Envie o resultado das queries SQL de debug
3. Verifique se há erros no Supabase Dashboard → Logs

---

**Criado em**: 2025-01-27  
**Status**: Solução pronta para aplicação  
**Prioridade**: 🔴 Alta

