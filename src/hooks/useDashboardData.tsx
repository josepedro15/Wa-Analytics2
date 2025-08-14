import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardData {
  id: string;
  user_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  
  // Métricas Principais
  total_atendimentos: number | null;
  taxa_conversao: number | null;
  tempo_medio_resposta: number | null;
  nota_media_qualidade: number | null;
  
  // Principais Intenções dos Clientes
  intencao_compra: number | null;
  intencao_duvida_geral: number | null;
  intencao_reclamacao: number | null;
  intencao_suporte: number | null;
  intencao_orcamento: number | null;
  
  // Insights de Performance
  insights_funcionou: string[] | null;
  insights_atrapalhou: string[] | null;
  
  // Destaque do Período
  melhor_atendimento_cliente: string | null;
  melhor_atendimento_observacao: string | null;
  melhor_atendimento_nota: number | null;
  atendimento_critico_cliente: string | null;
  atendimento_critico_observacao: string | null;
  atendimento_critico_nota: number | null;
  
  // Automação Sugerida
  automacao_sugerida: string[] | null;
  
  // Próximas Ações
  proximas_acoes: string[] | null;
  
  // Metas e Progresso
  meta_taxa_conversao: string | null;
  meta_tempo_resposta: string | null;
  meta_nota_qualidade: string | null;
  
  created_at: string;
  updated_at: string;
}

export function useDashboardData(selectedDate?: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-data', user?.id, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<DashboardData | null> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('dashboard_data')
        .select('*')
        .eq('user_id', user.id);

      // Aplicar filtro de data se fornecido
      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.gte('created_at', startOfDay.toISOString())
                    .lte('created_at', endOfDay.toISOString());
      }

      const { data: userData, error: userError } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (userData) {
        return userData;
      }

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Se não há dados do usuário, busca dados de exemplo
      const { data: sampleData, error: sampleError } = await supabase
        .from('dashboard_data')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sampleError) {
        if (sampleError.code === 'PGRST116') {
          // No sample data found - return null
          return null;
        }
        throw sampleError;
      }

      // Retorna os dados de exemplo, mas com o user_id do usuário atual
      return sampleData ? { ...sampleData, user_id: user.id } : null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Função para criar dados iniciais do dashboard para um usuário
export async function createInitialDashboardData(userId: string): Promise<DashboardData | null> {
  const { data, error } = await supabase
    .from('dashboard_data')
    .insert({
      user_id: userId,
      periodo_inicio: new Date().toISOString().split('T')[0], // Hoje
      periodo_fim: new Date().toISOString().split('T')[0], // Hoje
      
      // Métricas Principais
      total_atendimentos: 0,
      taxa_conversao: 0,
      tempo_medio_resposta: 0,
      nota_media_qualidade: 0,
      
      // Principais Intenções dos Clientes
      intencao_compra: 0,
      intencao_duvida_geral: 0,
      intencao_reclamacao: 0,
      intencao_suporte: 0,
      intencao_orcamento: 0,
      
      // Insights de Performance
      insights_funcionou: [],
      insights_atrapalhou: [],
      
      // Destaque do Período
      melhor_atendimento_cliente: null,
      melhor_atendimento_observacao: null,
      melhor_atendimento_nota: null,
      atendimento_critico_cliente: null,
      atendimento_critico_observacao: null,
      atendimento_critico_nota: null,
      
      // Automação Sugerida
      automacao_sugerida: [],
      
      // Próximas Ações
      proximas_acoes: [],
      
      // Metas e Progresso
      meta_taxa_conversao: '0% / Meta 30% (até março)',
      meta_tempo_resposta: '0s / Meta < 2min (até fevereiro)',
      meta_nota_qualidade: '0 / Meta 4,5 (até abril)',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar dados iniciais do dashboard:', error);
    return null;
  }

  return data;
}
