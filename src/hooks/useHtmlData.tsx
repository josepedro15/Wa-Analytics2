import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type HtmlData = Tables<'html'>;

export function useHtmlData() {
  return useQuery({
    queryKey: ['html-data'],
    queryFn: async (): Promise<HtmlData[]> => {
      const { data, error } = await supabase
        .from('html')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useHtmlById(id: number) {
  return useQuery({
    queryKey: ['html-data', id],
    queryFn: async (): Promise<HtmlData | null> => {
      const { data, error } = await supabase
        .from('html')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
