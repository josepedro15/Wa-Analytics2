-- Atualizar nomes dos atendentes na tabela html_SãoMiguel para os novos nomes simplificados

-- Atualizar todos os registros para os novos nomes
UPDATE public.html_SãoMiguel 
SET atendente = 'SMVplano'
WHERE atendente LIKE '%SMVplano%' OR atendente LIKE '%SMVplanos%';

UPDATE public.html_SãoMiguel 
SET atendente = 'RSTatendimento'
WHERE atendente LIKE '%RSTatendimento%' OR atendente LIKE '%Rost%atendimento%';

UPDATE public.html_SãoMiguel 
SET atendente = 'RSTplanos'
WHERE atendente LIKE '%RSTplanos%' OR atendente LIKE '%Rost%planos%';

-- Verificar se as atualizações foram aplicadas
SELECT id, atendente, data FROM public.html_SãoMiguel 
ORDER BY id;
