-- Script completo para configurar o usuário Rost
-- User ID: dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f

-- 1. Verificar se o usuário existe
SELECT 
  'Verificando usuário Rost...' as status,
  id, 
  email,
  created_at
FROM auth.users 
WHERE id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';

-- 2. Criar perfil se não existir
INSERT INTO public.profiles (user_id, full_name, role)
VALUES ('dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f', 'Funerária Rost', 'vendedor')
ON CONFLICT (user_id) 
DO UPDATE SET 
  full_name = 'Funerária Rost',
  updated_at = now();

-- 3. Verificar se a tabela html_SãoMiguel_rost existe
SELECT 
  'Verificando tabela html_SãoMiguel_rost...' as status,
  COUNT(*) as total_registros
FROM html_SãoMiguel_rost;

-- 4. Se a tabela não existir, criar
CREATE TABLE IF NOT EXISTS public.html_SãoMiguel_rost (
  id SERIAL PRIMARY KEY,
  html TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atendente TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Habilitar RLS na tabela se não estiver habilitado
ALTER TABLE public.html_SãoMiguel_rost ENABLE ROW LEVEL SECURITY;

-- 6. Criar política de acesso para todos (pois é uma tabela compartilhada)
DROP POLICY IF EXISTS "Allow public read access" ON public.html_SãoMiguel_rost;
CREATE POLICY "Allow public read access" 
ON public.html_SãoMiguel_rost 
FOR SELECT 
USING (true);

-- 7. Inserir dados de exemplo se não existir nenhum registro
INSERT INTO public.html_SãoMiguel_rost (html, data, atendente)
SELECT 
  '<div class="p-8 text-center"><h2 class="text-2xl font-bold mb-4">Dashboard Funerária Rost</h2><p class="text-gray-600">Aguardando dados...</p></div>',
  CURRENT_TIMESTAMP,
  'RSTplanos'
WHERE NOT EXISTS (
  SELECT 1 FROM public.html_SãoMiguel_rost WHERE atendente = 'RSTplanos'
);

INSERT INTO public.html_SãoMiguel_rost (html, data, atendente)
SELECT 
  '<div class="p-8 text-center"><h2 class="text-2xl font-bold mb-4">Dashboard Funerária Rost - Atendimento</h2><p class="text-gray-600">Aguardando dados...</p></div>',
  CURRENT_TIMESTAMP,
  'RSTatendimento'
WHERE NOT EXISTS (
  SELECT 1 FROM public.html_SãoMiguel_rost WHERE atendente = 'RSTatendimento'
);

-- 8. Verificar dados inseridos
SELECT 
  'Dados na tabela html_SãoMiguel_rost:' as status,
  atendente,
  data,
  LENGTH(html) as tamanho_html
FROM public.html_SãoMiguel_rost
ORDER BY data DESC;

-- 9. Verificar perfil criado
SELECT 
  'Perfil do usuário Rost:' as status,
  user_id,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE user_id = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Configuração do usuário Rost concluída!';
  RAISE NOTICE 'O usuário pode agora acessar /rost';
  RAISE NOTICE '========================================';
END $$;

