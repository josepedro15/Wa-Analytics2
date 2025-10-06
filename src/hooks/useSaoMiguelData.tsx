import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SaoMiguelData {
  id: number;
  html: string;
  data: string;
  atendente: string;
}

export interface BranchOption {
  id: string;
  name: string;
  description: string;
  key: string;
}

export const BRANCH_OPTIONS: BranchOption[] = [
  {
    id: 'smv-planos',
    name: 'SMVplanoSMVplanos',
    description: 'São Miguel Viamão planos',
    key: 'SMVplanoSMVplanos - São Miguel Viamão planos'
  },
  {
    id: 'smv-atendimento',
    name: 'SMVatendimwnto',
    description: 'São Miguel Viamão atendimento',
    key: 'SMVatendimwnto - São Miguel Viamão atendimento'
  },
  {
    id: 'smpoa-atendimento',
    name: 'SMPOAatendimento',
    description: 'São Miguel Porto Alegre atendimento',
    key: 'SMPOAatendimento - São Miguel Porto Alegre atendimento'
  },
  {
    id: 'rost-atendimento',
    name: 'SMVplanoRSTatendimento',
    description: 'Rost atendimento',
    key: 'SMVplanoRSTatendimento - Rost atendimento'
  },
  {
    id: 'rost-planos',
    name: 'SMVplanoRSTPlanos',
    description: 'Rost planos',
    key: 'SMVplanoRSTPlanos - Rost planos'
  }
];

export function useSaoMiguelData(selectedBranch?: string, selectedDate?: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sao-miguel-data', selectedBranch, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<SaoMiguelData[]> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('html')
        .select('*')
        .order('data', { ascending: false });

      // Filtrar por filial se selecionada
      if (selectedBranch) {
        const branchOption = BRANCH_OPTIONS.find(b => b.id === selectedBranch);
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

// Hook para buscar dados de uma filial específica
export function useBranchData(branchId: string, selectedDate?: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['branch-data', branchId, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<SaoMiguelData | null> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const branchOption = BRANCH_OPTIONS.find(b => b.id === branchId);
      if (!branchOption) {
        throw new Error('Filial não encontrada');
      }

      let query = supabase
        .from('html')
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

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    },
    enabled: !!user && !!branchId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
  });
}
