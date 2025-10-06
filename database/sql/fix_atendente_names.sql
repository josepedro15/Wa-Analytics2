-- Corrigir nomes dos atendentes na tabela html_SãoMiguel
-- Este SQL corrige o erro de digitação "SMVatendimwnto" para "SMVatendimento"

-- Atualizar o registro com erro de digitação
UPDATE public.html_SãoMiguel 
SET atendente = 'SMVatendimento - São Miguel Viamão atendimento'
WHERE atendente = 'SMVatendimwnto - São Miguel Viamão atendimento';

-- Verificar se a correção foi aplicada
SELECT id, atendente, data FROM public.html_SãoMiguel 
WHERE atendente LIKE '%SMVatendimento%'
ORDER BY id;

-- Verificar todos os registros para confirmar
SELECT id, atendente, data FROM public.html_SãoMiguel 
ORDER BY id;
