// src/hooks/dashboard/useAutoRefresh.ts

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number;
  onRefresh: () => void | Promise<void>;
  enabled?: boolean;
  immediate?: boolean;
}

export const useAutoRefresh = ({
  interval = 60000,
  onRefresh,
  enabled = true,
  immediate = true
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error en auto-refresh:', error);
    }
  }, [onRefresh]);

  // Configurar intervalo
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Ejecutar inmediatamente si está configurado
    if (immediate) {
      refresh();
    }

    // Configurar intervalo
    intervalRef.current = window.setInterval(refresh, interval);

    // Limpiar al desmontar
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, refresh, enabled, immediate]);

  // Funciones para control manual
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = window.setInterval(refresh, interval);
    }
  }, [interval, refresh, enabled]);

  const triggerRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return {
    stopAutoRefresh,
    startAutoRefresh,
    triggerRefresh,
    isRunning: !!intervalRef.current,
  };
};
