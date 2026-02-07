// src/components/dashboard/DashboardPrincipal.tsx
import React, { useState, useEffect, useRef } from 'react';
import DashboardMetrics from './DashboardMetrics';
import DashboardCharts from './DashboardCharts';
import RecentActivities from './RecentActivities';
import { DateFilterSelector, type DateFilterSelectorRef } from './DateFilterSelector';
import { DashboardTabs } from './DashboardTabs';
import { useDashboard } from '../../hooks/dashboard/useDashboard';
import { DashboardLayout } from './DashboardLayout';
import { Calendar, RefreshCw } from 'lucide-react';
import { formatDate } from '../../lib/dashboardUtils';

export const DashboardPrincipal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [currentFilters, setCurrentFilters] = useState<{
    fecha_inicio?: string;
    fecha_fin?: string;
    periodo?: string;
  }>({});

  // Referencia para controlar el DateFilterSelector
  const dateFilterRef = useRef<DateFilterSelectorRef>(null);

  const {
    loading,
    error,
    metricas,
    graficos,
    tablas,
    listas,
    rol,
    refreshData,
    lastUpdated,
    updateFilters,
    periodosDisponibles,
  } = useDashboard({
    autoRefresh: false,
    refreshInterval: 300000,
  });

  // Debug: Verificar datos recibidos del hook
  useEffect(() => {
    if (!loading && !error) {
      console.log('✅ DashboardPrincipal - Datos recibidos:', {
        rol, // ✅ Verificar el rol
        metricas: metricas ? Object.keys(metricas) : [],
        graficos: graficos ? Object.keys(graficos) : [],
        periodosLength: periodosDisponibles?.length,
      });
      
      // Sincronizar filtros actuales con los del dashboard
      if (metricas?.fecha_inicio && metricas?.fecha_fin) {
        setCurrentFilters({
          fecha_inicio: metricas.fecha_inicio,
          fecha_fin: metricas.fecha_fin,
          periodo: metricas.periodo_activo
        });
      }
    }
  }, [loading, error, metricas, graficos, periodosDisponibles, rol]);

  const handleFilterChange = (filters: { 
    fecha_inicio?: string; 
    fecha_fin?: string; 
    periodo?: string;
  }) => {
    console.log('📅 DashboardPrincipal - handleFilterChange llamado con:', {
      filters,
      periodosDisponiblesLength: periodosDisponibles?.length,
    });
    
    setCurrentFilters(filters);
    
    if (typeof updateFilters === 'function') {
      updateFilters(filters);
    } else {
      console.error('❌ ERROR: updateFilters no es una función o no está definido');
    }
  };

  // ✅ Función combinada que actualiza datos Y resetea el filtro
  const handleRefreshData = async () => {
    try {
      // Si hay referencia al dateFilter, reseteamos primero
      if (dateFilterRef.current) {
        console.log('🔄 DashboardPrincipal - Reseteando filtro al mes actual');
        dateFilterRef.current.resetToCurrentMonth();
      }
      
      // Luego actualizamos los datos
      await refreshData();
    } catch (error) {
      console.error('Error en handleRefreshData:', error);
    }
  };

  const getDashboardTitle = () => {
    switch (rol) {
      case 'Administrador':
        return 'Dashboard - Administrador';
      case 'Odontologo':
        return 'Dashboard - Odontólogo';
      case 'Asistente':
        return 'Dashboard - Asistente';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardSubtitle = () => {
    if (metricas?.periodo_activo && metricas?.fecha_inicio && metricas?.fecha_fin) {
      const periodoDisplay = metricas.periodo_activo === 'personalizado' 
        ? 'Personalizado' 
        : metricas.periodo_activo.charAt(0).toUpperCase() + metricas.periodo_activo.slice(1);
      
      return `${periodoDisplay} (${formatDate(metricas.fecha_inicio)} - ${formatDate(metricas.fecha_fin)})`;
    }
    
    const totalPacientes = metricas?.total_pacientes || 0;
    const pacientesActivos = metricas?.pacientes_activos || 0;
    
    if (totalPacientes > 0) {
      return `${totalPacientes} pacientes totales, ${pacientesActivos} activos`;
    }
    
    return 'Bienvenido al sistema odontológico';
  };

  const tabs = [
    { id: 'general', label: 'Vista General' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const getPeriodos = () => {
    if (periodosDisponibles && periodosDisponibles.length > 0) {
      return periodosDisponibles;
    }
    
    // Datos por defecto
    const hoy = new Date();
    const todayStr = hoy.toISOString().split('T')[0];
    
    return [
      { 
        periodo: 'hoy', 
        label: 'Hoy', 
        fecha_inicio: todayStr, 
        fecha_fin: todayStr 
      },
      { 
        periodo: 'semana_actual', 
        label: 'Semana Actual', 
        fecha_inicio: todayStr, 
        fecha_fin: todayStr 
      },
      { 
        periodo: 'mes_actual', 
        label: 'Mes Actual', 
        fecha_inicio: todayStr, 
        fecha_fin: todayStr 
      },
    ];
  };

  return (
    <DashboardLayout
      title={getDashboardTitle()}
      subtitle={getDashboardSubtitle()}
      loading={loading}
      error={error}
      onRefresh={handleRefreshData} // ✅ Usamos la función combinada
      lastUpdated={lastUpdated}
    >
      {/* Sección de Filtros y Controles */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Botón de refresh */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshData} // ✅ Usamos la función combinada
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors w-full sm:w-auto"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {loading ? 'Actualizando...' : 'Actualizar Datos'}
                </span>
              </button>
            </div>
            
            {/* Información del periodo activo */}
            {metricas?.periodo_activo && (
              <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 border bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50">
                <Calendar className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="font-medium whitespace-nowrap text-blue-800 dark:text-blue-300">
                    {metricas.periodo_activo === 'personalizado' 
                      ? 'Período personalizado' 
                      : `Período: ${metricas.periodo_activo.charAt(0).toUpperCase() + metricas.periodo_activo.slice(1)}`}
                  </span>
                  {metricas?.fecha_inicio && metricas?.fecha_fin && (
                    <span className="whitespace-nowrap text-blue-600 dark:text-blue-400">
                      ({formatDate(metricas.fecha_inicio)} - {formatDate(metricas.fecha_fin)})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Selector de período con referencia */}
          <div className="flex-shrink-0">
            <DateFilterSelector
              ref={dateFilterRef} // ✅ Pasamos la referencia
              periodos={getPeriodos()}
              onFilterChange={handleFilterChange}
              loading={loading}
              currentFilters={currentFilters}
            />
          </div>
        </div>
      </div>

      {/* Tabs - Ocultar si solo hay un tab */}
      {tabs.length > 1 && (
        <DashboardTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mb-6"
        />
      )}

      {/* Contenido del Dashboard */}
      <div className="space-y-6">
        {/* Métricas del Sistema */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Métricas del Sistema
          </h2>
          <DashboardMetrics 
            metricas={metricas} 
            rol={rol} 
            loading={loading} 
          />
        </div>

        {/* Gráficos */}
        {graficos && Object.keys(graficos).length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Análisis y Estadísticas
            </h2>
            <DashboardCharts 
              graficos={graficos} 
              loading={loading}
              rol={rol} // ✅ PASAR EL ROL AL COMPONENTE DASHBOARDCHARTS
            />
          </div>
        )}

        {/* Actividades Recientes */}
        {(tablas || listas) && (
          <div className="mb-6">
            <RecentActivities 
              tablas={tablas}
              listas={listas}
              rol={rol}
              loading={loading}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};