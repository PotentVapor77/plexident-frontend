// src/hooks/dashboard/useDashboard.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../../services/dashboard/dashboardService';
import { getPeriodosPredefinidos } from '../../lib/dashboardUtils';
import type { DashboardResponse, PeriodoFiltro } from '../../types/dashboard/IDashboard';

interface DashboardFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  periodo?: string;
}

interface UseDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilters?: DashboardFilters;
}

export const useDashboard = (options: UseDashboardOptions = {}) => {
  const { 
    autoRefresh = false,
    refreshInterval = 300000, 
    initialFilters = {} 
  } = options;

  // Estados
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [periodosDisponibles, setPeriodosDisponibles] = useState<PeriodoFiltro[]>(getPeriodosPredefinidos());

  // Refs
  const filtersRef = useRef(filters);
  const isMountedRef = useRef(true);
  const initialLoadRef = useRef(false);

  // Actualizar ref cuando cambian los filtros
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Función para cargar dashboard
  const cargarDashboard = useCallback(async (filtros?: DashboardFilters) => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentFilters = filtros || filtersRef.current;
      console.log('🚀 Cargando dashboard con filtros:', currentFilters);
      
      const dashboard = await dashboardService.getDashboardStats(currentFilters);
      
      console.log('✅ Datos del dashboard recibidos en hook:', {
        rol: dashboard.rol,
        graficosKeys: dashboard.graficos ? Object.keys(dashboard.graficos) : [],
        tieneDistribucionEstados: !!dashboard.graficos?.distribucion_estados,
        tieneDiagnosticosFrecuentes: !!dashboard.graficos?.diagnosticos_frecuentes,
      });
      
      if (isMountedRef.current) {
        setDashboardData(dashboard);
        setLastUpdated(new Date());
        setError(null);
      }
      
    } catch (err) {
      console.error('❌ Error en cargarDashboard:', err);
      
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el dashboard';
        setError(errorMessage);
        
        const hoy = new Date();
        const datosRespaldo: DashboardResponse = {
          rol: 'Administrador',
          metricas: {
            total_pacientes: 0,
            pacientes_activos: 0,
            signos_vitales_hoy: 0,
            citas_hoy: 0,
            citas_semana: 0,
            periodo_activo: 'mes',
            fecha_inicio: hoy.toISOString().split('T')[0],
            fecha_fin: hoy.toISOString().split('T')[0]
          },
          graficos: {},
          tablas: {},
          listas: {},
          analiticas: {},
          accesos_rapidos: [],
          timestamp: hoy.toISOString(),
          usuario: {
            username: 'usuario_actual',
            nombre_completo: 'Usuario Actual'
          }
        };
        setDashboardData(datosRespaldo);
        setLastUpdated(hoy);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        initialLoadRef.current = true;
      }
    }
  }, []);

  // Función para cargar periodos disponibles
  const cargarPeriodosDisponibles = useCallback(async () => {
    try {
      const periodos = await dashboardService.getPeriodosDisponibles();
      if (isMountedRef.current) {
        setPeriodosDisponibles(periodos);
      }
    } catch (err) {
      console.error('Error cargando periodos:', err);
    }
  }, []);

  // Función refresh
  const refreshData = useCallback(async () => {
    console.log('🔄 Refrescando datos del dashboard...');
    return cargarDashboard();
  }, [cargarDashboard]);

  // ✅ NUEVO: Efecto de limpieza al desmontar
  useEffect(() => {
    return () => {
      console.log('🧹 Limpiando hook useDashboard al desmontar');
      isMountedRef.current = false;
      setDashboardData(null);
      setError(null);
      dashboardService.clearCache();
    };
  }, []);

  // Efecto inicial de carga
  useEffect(() => {
    isMountedRef.current = true;
    
    console.log('🎯 Hook useDashboard iniciado');
    
    const cargarDatosIniciales = async () => {
      await cargarDashboard();
      await cargarPeriodosDisponibles();
    };
    
    if (!initialLoadRef.current) {
      cargarDatosIniciales();
    }
  }, [cargarDashboard, cargarPeriodosDisponibles]);

  // Efecto para auto-refresh
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }
    
    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        refreshData();
      }
    }, refreshInterval);
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, refreshData]);

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: DashboardFilters) => {
    console.log('🎛️ Actualizando filtros:', newFilters);
    setFilters(prevFilters => {
      if (JSON.stringify(prevFilters) === JSON.stringify(newFilters)) {
        return prevFilters;
      }
      return newFilters;
    });
  }, []);

  // Efecto para recargar cuando cambian los filtros
  useEffect(() => {
    if (initialLoadRef.current) {
      console.log('📊 Filtros cambiaron, recargando dashboard con:', filters);
      cargarDashboard(filters);
    }
  }, [filters, cargarDashboard]);

  return {
    // Estados
    loading,
    error,
    
    // Datos
    dashboardData,
    metricas: dashboardData?.metricas || {},
    graficos: dashboardData?.graficos || {},
    tablas: dashboardData?.tablas || {},
    listas: dashboardData?.listas || {},
    analiticas: dashboardData?.analiticas || {},
    accesosRapidos: dashboardData?.accesos_rapidos || [],
    rol: dashboardData?.rol || 'Administrador',
    
    // Metadata
    lastUpdated,
    filters,
    periodosDisponibles,
    
    // Acciones
    updateFilters,
    refreshData,
    
    // Utilidad para debug
    debugInfo: () => ({
      loading,
      error,
      hasData: !!dashboardData,
      filters,
      lastUpdated,
      graficosKeys: dashboardData?.graficos ? Object.keys(dashboardData.graficos) : []
    })
  };
};
