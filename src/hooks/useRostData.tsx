import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RostData {
  id: number;
  html: string;
  data: string;
  atendente: string;
}

export interface RostBranchOption {
  id: string;
  name: string;
  description: string;
  key: string;
}

// Configuração das filiais da Funerária Rost
export const ROST_BRANCH_OPTIONS: RostBranchOption[] = [
  {
    id: 'rost-planos',
    name: 'RSTplanos',
    description: 'Funerária Rost - Planos',
    key: 'RSTplanos'
  },
  {
    id: 'rost-atendimento',
    name: 'RSTatendimento',
    description: 'Funerária Rost - Atendimento',
    key: 'RSTatendimento'
  }
];

export function useRostData(selectedBranch?: string, selectedDate?: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['rost-data', selectedBranch, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<RostData[]> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('html_SãoMiguel_rost')
        .select('*')
        .order('data', { ascending: false });

      // Filtrar por filial se selecionada
      if (selectedBranch) {
        const branchOption = ROST_BRANCH_OPTIONS.find(b => b.id === selectedBranch);
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

// Hook para buscar dados de uma filial específica da Funerária Rost
export function useRostBranchData(branchId: string, selectedDate?: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['rost-branch-data', branchId, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<RostData | null> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const branchOption = ROST_BRANCH_OPTIONS.find(b => b.id === branchId);
      if (!branchOption) {
        throw new Error('Filial não encontrada');
      }

      let query = supabase
        .from('html_SãoMiguel_rost')
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
    retry: 1, // Tentar apenas 1 vez em caso de erro
  });
}

