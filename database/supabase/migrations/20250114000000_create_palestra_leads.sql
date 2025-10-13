-- Criar tabela para armazenar leads da palestra
CREATE TABLE IF NOT EXISTS palestra_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  gatilho TEXT,
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_palestra_leads_email ON palestra_leads(email);
CREATE INDEX idx_palestra_leads_telefone ON palestra_leads(telefone);
CREATE INDEX idx_palestra_leads_created_at ON palestra_leads(created_at);
CREATE INDEX idx_palestra_leads_webhook_sent ON palestra_leads(webhook_sent);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_palestra_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER palestra_leads_updated_at
  BEFORE UPDATE ON palestra_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_palestra_leads_updated_at();

-- RLS (Row Level Security)
ALTER TABLE palestra_leads ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Permitir INSERT público (para captura de leads)
CREATE POLICY "Permitir INSERT público"
  ON palestra_leads
  FOR INSERT
  WITH CHECK (true);

-- Apenas usuários autenticados podem ver leads
CREATE POLICY "Usuários autenticados podem ver leads"
  ON palestra_leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Apenas usuários autenticados podem atualizar (simplificado)
CREATE POLICY "Usuários autenticados podem atualizar"
  ON palestra_leads
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE palestra_leads IS 'Armazena leads capturados na landing page da palestra';
COMMENT ON COLUMN palestra_leads.nome IS 'Nome completo do lead';
COMMENT ON COLUMN palestra_leads.email IS 'Email do lead';
COMMENT ON COLUMN palestra_leads.telefone IS 'Telefone/WhatsApp do lead';
COMMENT ON COLUMN palestra_leads.gatilho IS 'Opção de interesse escolhida pelo lead';
COMMENT ON COLUMN palestra_leads.webhook_sent IS 'Indica se os dados foram enviados ao webhook';
COMMENT ON COLUMN palestra_leads.webhook_sent_at IS 'Data/hora do envio ao webhook';

