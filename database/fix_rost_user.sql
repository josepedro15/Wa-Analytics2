-- Script para diagnosticar e corrigir problemas com o usuário Rost
-- User ID: dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f

-- 1. Verificar se o usuário existe
DO $$
BEGIN
  RAISE NOTICE 'Verificando usuário...';
  
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f'
  ) THEN
    RAISE NOTICE 'Usuário encontrado no auth.users';
  ELSE
    RAISE NOTICE 'ERRO: Usuário NÃO encontrado no auth.users';
  END IF;
END $$;

-- 2. Verificar dados no dashboard_data
SELECT 
  'dashboard_data' as tabela,
  COUNT(*) as total_registros
FROM public.dashboard_data 
WHERE user_id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';

-- 3. Verificar dados no profiles
SELECT 
  'profiles' as tabela,
  COUNT(*) as total_registros
FROM public.profiles 
WHERE user_id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';

-- 4. Verificar instâncias do WhatsApp
SELECT 
  'whatsapp_instances' as tabela,
  COUNT(*) as total_registros
FROM public.whatsapp_instances 
WHERE user_id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';

-- 5. Criar perfil se não existir
INSERT INTO public.profiles (user_id, full_name, role)
VALUES ('dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f', 'Rost', 'vendedor')
ON CONFLICT (user_id) DO NOTHING;

-- 6. Criar dados iniciais do dashboard se não existir
INSERT INTO public.dashboard_data (
  user_id,
  periodo_inicio,
  periodo_fim,
  
  -- Métricas Principais - Zeradas para novo usuário
  total_atendimentos,
  taxa_conversao,
  tempo_medio_resposta,
  nota_media_qualidade,
  
  -- Principais Intenções dos Clientes - Zeradas
  intencao_compra,
  intencao_duvida_geral,
  intencao_reclamacao,
  intencao_suporte,
  intencao_orcamento,
  
  -- Insights de Performance - Vazios
  insights_funcionou,
  insights_atrapalhou,
  
  -- Destaque do Período - Nulos
  melhor_atendimento_cliente,
  melhor_atendimento_observacao,
  melhor_atendimento_nota,
  atendimento_critico_cliente,
  atendimento_critico_observacao,
  atendimento_critico_nota,
  
  -- Automação Sugerida - Vazia
  automacao_sugerida,
  
  -- Próximas Ações - Vazias
  proximas_acoes,
  
  -- Metas e Progresso - Padrão
  meta_taxa_conversao,
  meta_tempo_resposta,
  meta_nota_qualidade
)
SELECT
  'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f',
  CURRENT_DATE,
  CURRENT_DATE,
  
  -- Métricas zeradas
  0,
  0,
  0,
  0,
  
  -- Intenções zeradas
  0,
  0,
  0,
  0,
  0,
  
  -- Arrays vazios
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  
  -- Nulos
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  
  -- Arrays vazios
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  
  -- Metas padrão
  '0% / Meta 30% (até março)',
  '0s / Meta < 2min (até fevereiro)',
  '0 / Meta 4,5 (até abril)'
WHERE NOT EXISTS (
  SELECT 1 FROM public.dashboard_data 
  WHERE user_id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f'
);

-- 7. Verificar se as políticas RLS estão corretas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('dashboard_data', 'profiles', 'whatsapp_instances')
ORDER BY tablename, policyname;

-- 8. Confirmar criação dos dados
SELECT 
  'Dados criados com sucesso!' as status,
  COUNT(*) as registros_dashboard
FROM public.dashboard_data 
WHERE user_id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Script de correção concluído!';
  RAISE NOTICE 'Usuário Rost agora deve conseguir fazer login';
  RAISE NOTICE '========================================';
END $$;

