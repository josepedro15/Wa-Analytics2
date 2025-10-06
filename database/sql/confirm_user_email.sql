-- SQL para confirmar email de usuário no Supabase
-- IMPORTANTE: Execute este SQL no Editor SQL do Supabase Dashboard

-- 1. Confirmar email de um usuário específico por ID
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE id = '1c93324c-65d3-456e-992e-c84e1f7d6ab1';

-- 2. Confirmar email de um usuário específico por email
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'usuario@exemplo.com';

-- 3. Confirmar email de todos os usuários não confirmados
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 4. Verificar status de confirmação de email
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmado'
    ELSE 'Não Confirmado'
  END as status_email
FROM auth.users 
ORDER BY created_at DESC;

-- 5. Confirmar email e definir como ativo (se necessário)
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  banned_until = NULL,
  updated_at = NOW()
WHERE id = '1c93324c-65d3-456e-992e-c84e1f7d6ab1';

-- 6. Script completo para o usuário São Miguel específico
-- Este é o script recomendado para o usuário do Dashboard São Miguel
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE id = '1c93324c-65d3-456e-992e-c84e1f7d6ab1';

-- Verificar se foi confirmado
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email Confirmado'
    ELSE '❌ Email Não Confirmado'
  END as status
FROM auth.users 
WHERE id = '1c93324c-65d3-456e-992e-c84e1f7d6ab1';
