-- Adicionar coluna atendente à tabela html_SãoMiguel
ALTER TABLE public.html_SãoMiguel 
ADD COLUMN IF NOT EXISTS atendente TEXT;

-- Criar alguns dados de exemplo para teste
INSERT INTO public.html_SãoMiguel (id, html, data, atendente) VALUES 
(1, '<html><body><h1>Relatório SMVplanoSMVplanos</h1><p>Este é um relatório de exemplo para São Miguel Viamão planos.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'SMVplanoSMVplanos - São Miguel Viamão planos'),
(2, '<html><body><h1>Relatório SMVatendimento</h1><p>Este é um relatório de exemplo para São Miguel Viamão atendimento.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'SMVatendimento - São Miguel Viamão atendimento'),
(3, '<html><body><h1>Relatório SMPOAatendimento</h1><p>Este é um relatório de exemplo para São Miguel Porto Alegre atendimento.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'SMPOAatendimento - São Miguel Porto Alegre atendimento'),
(4, '<html><body><h1>Relatório SMVplanoRSTatendimento</h1><p>Este é um relatório de exemplo para Rost atendimento.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'SMVplanoRSTatendimento - Rost atendimento'),
(5, '<html><body><h1>Relatório SMVplanoRSTPlanos</h1><p>Este é um relatório de exemplo para Rost planos.</p><p>Data: ' || NOW() || '</p></body></html>', NOW()::text, 'SMVplanoRSTPlanos - Rost planos')
ON CONFLICT (id) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT id, atendente, data FROM public.html_SãoMiguel ORDER BY id;
