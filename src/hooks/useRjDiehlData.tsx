import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RjDiehlData {
    id: number;
    html: string;
    data: string;
    atendente: string;
}

export interface RjDiehlBranchOption {
    id: string;
    name: string;
    description: string;
    key: string;
}

// Configuração das filiais do RJ DIEHL
export const RJ_DIEHL_BRANCH_OPTIONS: RjDiehlBranchOption[] = [
    {
        id: 'rj-diehl-main',
        name: 'RJ DIEHL',
        description: 'RJ DIEHL Principal',
        key: 'RjDiehl'
    }
];

export function useRjDiehlData(selectedBranch?: string, selectedDate?: Date) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['rj-diehl-data', selectedBranch, selectedDate?.toISOString().split('T')[0]],
        queryFn: async (): Promise<RjDiehlData[]> => {
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            let query = supabase
                .from('html_RjDiehl' as any)
                .select('*')
                .order('data', { ascending: false });

            // Filtrar por filial se selecionada
            if (selectedBranch) {
                const branchOption = RJ_DIEHL_BRANCH_OPTIONS.find(b => b.id === selectedBranch);
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
                console.error('Erro na query RJ Diehl (lista):', error);
                // Se a tabela não existir, retornar array vazio para não quebrar a UI
                if (error.code === '42P01') {
                    return [];
                }
                throw error;
            }

            return (data as any) || [];
        },
        enabled: !!user,
        staleTime: 2 * 60 * 1000, // 2 minutos
        refetchOnWindowFocus: false,
    });
}

// Hook para buscar dados de uma filial específica do RJ DIEHL
export function useRjDiehlBranchData(branchId: string, selectedDate?: Date) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['rj-diehl-branch-data', branchId, selectedDate?.toISOString().split('T')[0]],
        queryFn: async (): Promise<RjDiehlData | null> => {
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const branchOption = RJ_DIEHL_BRANCH_OPTIONS.find(b => b.id === branchId);
            if (!branchOption) {
                throw new Error('Filial não encontrada');
            }

            console.log('Buscando dados para filial RJ DIEHL:', branchOption.key);

            let query = supabase
                .from('html_RjDiehl' as any)
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

            console.log('Resultado da query RJ DIEHL:', { data, error });

            if (error) {
                if (error.code === 'PGRST116') { // no rows returned
                    return null;
                }
                console.error('Erro na query RJ DIEHL:', error);
                throw error;
            }

            return data as any;
        },
        enabled: !!user && !!branchId,
        staleTime: 2 * 60 * 1000, // 2 minutos
        refetchOnWindowFocus: false,
        retry: 1, // Tentar apenas 1 vez em caso de erro
    });
}
