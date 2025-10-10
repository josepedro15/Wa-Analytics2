-- Adicionar coluna atendente à tabela html_SãoMiguel
ALTER TABLE public.html_SãoMiguel 
ADD COLUMN IF NOT EXISTS atendente TEXT;

-- Criar alguns dados de exemplo para teste
INSERT INTO public.html_SãoMiguel (id, html, data, atendente) VALUES 
(1, '<html><body><h1>Relatório SMVplano</h1><p>Este é um relatório de exemplo para São Miguel Viamão planos.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'SMVplano'),
(2, '<html><body><h1>Relatório RSTatendimento</h1><p>Este é um relatório de exemplo para Rost atendimento.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'RSTatendimento'),
(3, '<html><body><h1>Relatório RSTplanos</h1><p>Este é um relatório de exemplo para Rost planos.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'RSTplanos')
ON CONFLICT (id) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT id, atendente, data FROM public.html_SãoMiguel ORDER BY id;
