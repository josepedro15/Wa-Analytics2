import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RedemacMorelliData {
  id: number;
  html: string;
  data: string;
  atendente: string;
}

export interface RedemacMorelliBranchOption {
  id: string;
  name: string;
  description: string;
  key: string;
}

// Configuração das áreas da RedemacMorelli
export const REDEMAC_MORELLI_BRANCH_OPTIONS: RedemacMorelliBranchOption[] = [
  {
    id: 'redemac-vendas',
    name: 'RMvendas',
    description: 'RedemacMorelli - Vendas',
    key: 'RMvendas'
  },
  {
    id: 'redemac-atendimento',
    name: 'RMatendimento',
    description: 'RedemacMorelli - Atendimento',
    key: 'RMatendimento'
  }
];

export function useRedemacMorelliData(selectedBranch?: string, selectedDate?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['redemac-morelli-data', selectedBranch, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<RedemacMorelliData[]> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let query = (supabase
        .from('html_morelli' as any)
        .select('*')
        .order('data', { ascending: false })) as any;

      // Filtrar por área se selecionada
      if (selectedBranch) {
        const branchOption = REDEMAC_MORELLI_BRANCH_OPTIONS.find(b => b.id === selectedBranch);
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

// Hook para buscar dados de uma área específica da RedemacMorelli
export function useRedemacMorelliBranchData(branchId: string, selectedDate?: Date | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['redemac-morelli-branch-data', branchId, selectedDate?.toISOString().split('T')[0]],
    queryFn: async (): Promise<RedemacMorelliData | null> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const branchOption = REDEMAC_MORELLI_BRANCH_OPTIONS.find(b => b.id === branchId);
      if (!branchOption) {
        throw new Error('Área não encontrada');
      }

      let query = (supabase
        .from('html_morelli' as any)
        .select('*')
        .eq('atendente', branchOption.key)
        .order('data', { ascending: false })
        .limit(1)) as any;

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
