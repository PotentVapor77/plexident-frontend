/**
 * ============================================================================
 * HOOK: useNetworkStatus CON THROTTLE - ✅ OPTIMIZADO
 * ============================================================================
 * Detecta cuando el usuario pierde/recupera conexión a internet
 * y reintenta queries fallidas con throttle para evitar sobrecarga
 */

import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '../utils/logger';

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queryClient = useQueryClient();
  
  const refetchTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleOnline = () => {
      logger.info('✅ Conexión restaurada');
      setIsOnline(true);

      // Cancelar timeout anterior si existe
      if (refetchTimeoutRef.current !== undefined) {
        clearTimeout(refetchTimeoutRef.current);
      }

      // ✅ OPTIMIZADO: Esperar 1 segundo antes de sincronizar (throttle)
      refetchTimeoutRef.current = window.setTimeout(() => {
        logger.info('Sincronizando datos después de reconexión...');
        
        // ✅ MEJORADO: Reintentar queries con error O datos stale
        queryClient.refetchQueries({
          predicate: (query) => {
            // Refetch si:
            // 1. La query tiene error
            // 2. O los datos están stale (viejos)
            return (
              query.state.status === 'error' || 
              query.state.isInvalidated ||
              query.isStale()
            );
          },
          type: 'active', // Solo queries activas (que se están usando)
        });

        logger.info('✅ Sincronización completada');
      }, 1000);
    };

    const handleOffline = () => {
      logger.warn('❌ Sin conexión a internet');
      setIsOnline(false);

      // Cancelar sincronización pendiente
      if (refetchTimeoutRef.current !== undefined) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };

    // Registrar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (refetchTimeoutRef.current !== undefined) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, [queryClient]);

  return isOnline;
}
