-- Fix RLS Policies para palestra_leads
-- Execute este script no Supabase SQL Editor para corrigir as políticas

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Permitir INSERT público" ON palestra_leads;
DROP POLICY IF EXISTS "Usuários autenticados podem ver leads" ON palestra_leads;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar" ON palestra_leads;
DROP POLICY IF EXISTS "Permitir UPDATE público" ON palestra_leads;

-- 2. Criar políticas corretas

-- Permitir INSERT para usuários anônimos e autenticados
CREATE POLICY "Permitir INSERT público"
  ON palestra_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permitir SELECT apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver leads"
  ON palestra_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir UPDATE para usuários anônimos e autenticados (necessário para atualizar com gatilho)
CREATE POLICY "Permitir UPDATE público"
  ON palestra_leads
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Verificar políticas criadas
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
WHERE tablename = 'palestra_leads'
ORDER BY policyname;

