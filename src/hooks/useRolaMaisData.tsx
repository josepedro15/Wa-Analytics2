import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RolaMaisData {
  id: number;
  html: string;
  data: string;
  atendente: string;
}

export interface RolaMaisBranchOption {
  id: string;
  name: string;
  description: string;
  key: string;
}

// Configuração das filiais do RolaMais baseada na imagem
export const ROLA_MAIS_BRANCH_OPTIONS: RolaMaisBranchOption[] = [
  {
    id: 'rolamais-main',
    name: 'RolaMais',
    description: 'RolaMais Principal',
    key: 'RolaMais'
  }
];

export function useRolaMaisData(selectedBranch?: string, selectedDate?: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['rolamais-data', selectedBranch, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<RolaMaisData[]> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('html_RolaMais')
        .select('*')
        .order('data', { ascending: false });

      // Filtrar por filial se selecionada
      if (selectedBranch) {
        const branchOption = ROLA_MAIS_BRANCH_OPTIONS.find(b => b.id === selectedBranch);
        if (branchOption) {
          query = query.eq('atendente', branchOption.key);
        }
      }

      // Filtrar por data se selecionada
      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('data', startOfDay.toISOString())
          .lte('data', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
  });
}

// Hook para buscar dados de uma filial específica do RolaMais
export function useRolaMaisBranchData(branchId: string, selectedDate?: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['rolamais-branch-data', branchId, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<RolaMaisData | null> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const branchOption = ROLA_MAIS_BRANCH_OPTIONS.find(b => b.id === branchId);
      if (!branchOption) {
        throw new Error('Filial não encontrada');
      }

      console.log('Buscando dados para filial RolaMais:', branchOption.key);

      let query = supabase
        .from('html_RolaMais')
        .select('*')
        .eq('atendente', branchOption.key)
        .order('data', { ascending: false })
        .limit(1);

      // Filtrar por data se selecionada
      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('data', startOfDay.toISOString())
          .lte('data', endOfDay.toISOString());
      }

      const { data, error } = await query.single();

      console.log('Resultado da query RolaMais:', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro na query RolaMais:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user && !!branchId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
    retry: 1, // Tentar apenas 1 vez em caso de erro
  });
}
