/**
 * ============================================================================
 * REACT QUERY CLIENT
 * ============================================================================
 * Configuración centralizada de React Query para:
 * - Caché automático de datos
 * - Reintentos en caso de error
 * - Refetch inteligente
 * - Estados de loading/error unificados
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran frescos (5 minutos)
      staleTime: 5 * 60 * 1000,

      // Tiempo que los datos inactivos permanecen en caché (10 minutos)
      gcTime: 10 * 60 * 1000,

      // Reintentar 2 veces en caso de error
      retry: 2,
      
      // Delay exponencial entre reintentos (1s, 2s, 4s)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // No refetch automático al enfocar ventana
      refetchOnWindowFocus: false,
      
      // Refetch al reconectar a internet
      refetchOnReconnect: true,
      
      // Refetch al montar componente
      refetchOnMount: true,

    },
    mutations: {
      // Reintentar mutaciones solo 1 vez
      retry: 1,
      
      // Delay de 1 segundo entre reintentos
      retryDelay: 1000,

    },
  },
});
