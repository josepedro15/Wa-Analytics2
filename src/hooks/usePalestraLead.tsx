import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PalestraLeadData {
  nome: string;
  email: string;
  telefone: string;
  gatilho?: string;
}

export interface WebhookPayload {
  nome: string;
  telefone: string;
  email: string;
  gatilho: string;
}

export function usePalestraLead() {
  const { toast } = useToast();
  const [leadId, setLeadId] = useState<string | null>(null);

  // Mutation para criar lead inicial
  const createLeadMutation = useMutation({
    mutationFn: async (data: Omit<PalestraLeadData, 'gatilho'>): Promise<string> => {
      const { data: lead, error } = await supabase
        .from('palestra_leads')
        .insert({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      if (!lead) {
        throw new Error('Erro ao criar lead');
      }

      return lead.id;
    },
    onSuccess: (id) => {
      setLeadId(id);
      toast({
        title: "Dados salvos!",
        description: "Suas informações foram registradas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro ao salvar dados",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar lead com gatilho e enviar webhook
  const updateLeadAndSendWebhookMutation = useMutation({
    mutationFn: async ({ 
      leadId, 
      gatilho, 
      leadData 
    }: { 
      leadId: string; 
      gatilho: string; 
      leadData: Omit<PalestraLeadData, 'gatilho'>;
    }): Promise<void> => {
      // 1. Atualizar lead no Supabase
      const { error: updateError } = await supabase
        .from('palestra_leads')
        .update({ 
          gatilho,
          webhook_sent: true,
          webhook_sent_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (updateError) {
        throw updateError;
      }

      // 2. Enviar dados para o webhook
      const webhookPayload: WebhookPayload = {
        nome: leadData.nome,
        telefone: leadData.telefone,
        email: leadData.email,
        gatilho: gatilho
      };

      const webhookResponse = await fetch('https://webhook.aiensed.com/webhook/capturaotto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!webhookResponse.ok) {
        // Mesmo se o webhook falhar, não queremos bloquear o usuário
        console.error('Erro ao enviar webhook:', webhookResponse.status);
        
        // Marcar como não enviado no banco
        await supabase
          .from('palestra_leads')
          .update({ 
            webhook_sent: false,
            webhook_sent_at: null
          })
          .eq('id', leadId);
      }
    },
    onSuccess: () => {
      toast({
        title: "Interesse registrado!",
        description: "Entraremos em contato em breve.",
      });
    },
    onError: (error) => {
      console.error('Erro ao processar gatilho:', error);
      toast({
        title: "Erro ao processar",
        description: "Seus dados foram salvos, mas tivemos um problema ao enviar. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutation alternativa para criar lead e enviar webhook de uma vez
  const createLeadAndSendWebhookMutation = useMutation({
    mutationFn: async (data: PalestraLeadData): Promise<void> => {
      // 1. Criar lead no Supabase
      const { data: lead, error: createError } = await supabase
        .from('palestra_leads')
        .insert({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          gatilho: data.gatilho,
          webhook_sent: true,
          webhook_sent_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }

      // 2. Enviar dados para o webhook
      const webhookPayload: WebhookPayload = {
        nome: data.nome,
        telefone: data.telefone,
        email: data.email,
        gatilho: data.gatilho || ''
      };

      const webhookResponse = await fetch('https://webhook.aiensed.com/webhook/capturaotto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!webhookResponse.ok) {
        console.error('Erro ao enviar webhook:', webhookResponse.status);
        
        // Marcar como não enviado no banco
        if (lead) {
          await supabase
            .from('palestra_leads')
            .update({ 
              webhook_sent: false,
              webhook_sent_at: null
            })
            .eq('id', lead.id);
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Cadastro realizado!",
        description: "Entraremos em contato em breve.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro ao salvar dados",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  return {
    // Dados
    leadId,
    setLeadId,
    
    // Mutations
    createLead: createLeadMutation.mutate,
    updateLeadAndSendWebhook: updateLeadAndSendWebhookMutation.mutate,
    createLeadAndSendWebhook: createLeadAndSendWebhookMutation.mutate,
    
    // Estados
    isCreating: createLeadMutation.isPending,
    isUpdating: updateLeadAndSendWebhookMutation.isPending,
    isProcessing: createLeadAndSendWebhookMutation.isPending,
  };
}

