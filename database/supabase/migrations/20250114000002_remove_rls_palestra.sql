-- Remover RLS da tabela palestra_leads
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as políticas
DROP POLICY IF EXISTS "Permitir INSERT público" ON palestra_leads;
DROP POLICY IF EXISTS "Usuários autenticados podem ver leads" ON palestra_leads;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar" ON palestra_leads;
DROP POLICY IF EXISTS "Permitir UPDATE público" ON palestra_leads;

-- 2. DESABILITAR RLS (permite acesso total)
ALTER TABLE palestra_leads DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que RLS está desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'palestra_leads';

-- Deve retornar: rowsecurity = false

