-- Atualizar nomes dos atendentes na tabela html_SãoMiguel
-- Este script atualiza os nomes antigos para os novos nomes simplificados

-- Primeiro, vamos ver os dados atuais
SELECT '=== DADOS ATUAIS ===' as info;
SELECT id, atendente, data FROM public.html_SãoMiguel ORDER BY id;

-- Atualizar para os novos nomes simplificados
UPDATE public.html_SãoMiguel 
SET atendente = 'SMVplano'
WHERE atendente LIKE '%SMVplano%' OR atendente LIKE '%SMVplanos%';

UPDATE public.html_SãoMiguel 
SET atendente = 'RSTatendimento'
WHERE atendente LIKE '%RSTatendimento%' OR atendente LIKE '%Rost%atendimento%';

UPDATE public.html_SãoMiguel 
SET atendente = 'RSTplanos'
WHERE atendente LIKE '%RSTplanos%' OR atendente LIKE '%Rost%planos%';

-- Remover registros duplicados se existirem (manter apenas o mais recente)
DELETE FROM public.html_SãoMiguel 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM public.html_SãoMiguel 
    GROUP BY atendente
);

-- Verificar os dados após a atualização
SELECT '=== DADOS APÓS ATUALIZAÇÃO ===' as info;
SELECT id, atendente, data FROM public.html_SãoMiguel ORDER BY id;

-- Inserir dados de exemplo com os novos nomes se não existirem
INSERT INTO public.html_SãoMiguel (id, html, data, atendente) VALUES 
(1, '<html><body><h1>Relatório SMVplano</h1><p>Este é um relatório de exemplo para São Miguel Viamão planos.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'SMVplano'),
(2, '<html><body><h1>Relatório RSTatendimento</h1><p>Este é um relatório de exemplo para Rost atendimento.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'RSTatendimento'),
(3, '<html><body><h1>Relatório RSTplanos</h1><p>Este é um relatório de exemplo para Rost planos.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'RSTplanos')
ON CONFLICT (id) DO NOTHING;

-- Verificar dados finais
SELECT '=== DADOS FINAIS ===' as info;
SELECT id, atendente, data FROM public.html_SãoMiguel ORDER BY id;
