// src/components/dashboard/DateFilterSelector.tsx
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Calendar, ChevronDown, CalendarDays, Clock, CalendarRange, Sun, Moon, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PeriodoFiltro } from '../../types/dashboard/IDashboard';

interface DateFilterSelectorProps {
  periodos: PeriodoFiltro[];
  onFilterChange: (filters: { fecha_inicio?: string; fecha_fin?: string; periodo?: string }) => void;
  loading?: boolean;
  className?: string;
  currentFilters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    periodo?: string;
  };
}

export interface DateFilterSelectorRef {
  resetToCurrentMonth: () => void;
}

// ✅ Función para obtener fecha local en formato YYYY-MM-DD
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ Hook para auto-refresh (OPTIMIZADO)
const useAutoRefreshOnMonthChange = (
  selectedPeriodo: PeriodoFiltro | null,
  onPeriodChange: (periodo: PeriodoFiltro) => void,
  periodos: PeriodoFiltro[]
) => {
  const lastCheckRef = useRef<{ month: number; year: number; day: number }>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    day: new Date().getDate()
  });

  useEffect(() => {
    const checkDateChange = () => {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const day = now.getDate();

      const lastCheck = lastCheckRef.current;

      // Verificar si cambió el día, mes o año
      const hasChanged = 
        day !== lastCheck.day || 
        month !== lastCheck.month || 
        year !== lastCheck.year;

      if (hasChanged) {
        console.log('📅 Cambio de fecha detectado:', {
          anterior: `${lastCheck.day}/${lastCheck.month + 1}/${lastCheck.year}`,
          actual: `${day}/${month + 1}/${year}`,
          periodoSeleccionado: selectedPeriodo?.label
        });

        lastCheckRef.current = { month, year, day };

        // Solo actualizar si es un período basado en fecha actual
        if (selectedPeriodo) {
          const periodosBasadosEnFecha = [
            'hoy', 
            'semana_actual', 
            'mes_actual', 
            'trimestre_actual', 
            'anio_actual'
          ];
          
          if (periodosBasadosEnFecha.includes(selectedPeriodo.periodo)) {
            console.log('🔄 Actualizando período automáticamente por cambio de fecha');
            
            const periodoActualizado = periodos.find(p => p.periodo === selectedPeriodo.periodo);
            if (periodoActualizado) {
              // Verificar si realmente cambió antes de actualizar
              if (periodoActualizado.fecha_inicio !== selectedPeriodo.fecha_inicio ||
                  periodoActualizado.fecha_fin !== selectedPeriodo.fecha_fin) {
                onPeriodChange(periodoActualizado);
              }
            }
          }
        }
      }
    };

    // Verificar cada minuto
    const intervalId = setInterval(checkDateChange, 60000);

    // Verificar cuando la página gana foco
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkDateChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Verificar al montar
    checkDateChange();

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedPeriodo, onPeriodChange, periodos]);
};

// Usamos forwardRef para poder controlar el componente desde fuera
export const DateFilterSelector = forwardRef<DateFilterSelectorRef, DateFilterSelectorProps>((
  {
    periodos,
    onFilterChange,
    loading = false,
    className,
    currentFilters,
  },
  ref
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoFiltro | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const isInitializedRef = useRef(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const today = getLocalDateString();

  // ✅ Función para resetear al mes actual
  const resetToCurrentMonth = useCallback(() => {
    console.log('🔄 DateFilterSelector - resetToCurrentMonth llamado');
    
    // Buscar el periodo "mes_actual" en los periodos disponibles
    const mesActual = periodos.find(p => p.periodo === 'mes_actual');
    
    if (mesActual) {
      console.log('🎯 Reseteando a mes actual:', mesActual.label);
      setSelectedPeriodo(mesActual);
      setShowCustomDate(false);
      setFechaInicio('');
      setFechaFin('');
      onFilterChange({
        fecha_inicio: mesActual.fecha_inicio,
        fecha_fin: mesActual.fecha_fin,
        periodo: mesActual.periodo
      });
      setIsOpen(false);
    } else {
      console.warn('⚠️ No se encontró el periodo "mes_actual"');
    }
  }, [periodos, onFilterChange]);

  // ✅ Exponemos la función de reset al componente padre
  useImperativeHandle(ref, () => ({
    resetToCurrentMonth
  }));

  // ✅ Callback para cambios de período (MEMOIZADO)
  const handlePeriodChange = useCallback((periodo: PeriodoFiltro) => {
    console.log('🔄 Actualizando período:', periodo.label);
    setSelectedPeriodo(periodo);
    onFilterChange({
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin: periodo.fecha_fin,
      periodo: periodo.periodo
    });
  }, [onFilterChange]);

  // Hook para auto-refresh
  useAutoRefreshOnMonthChange(selectedPeriodo, handlePeriodChange, periodos);

  // ✅ Inicialización solo una vez
  useEffect(() => {
    if (periodos && periodos.length > 0 && !isInitializedRef.current) {
      console.log('🎯 Inicializando selector de fecha');
      
      // Si hay filtros actuales, aplicarlos
      if (currentFilters?.periodo && currentFilters.periodo !== 'personalizado') {
        const periodo = periodos.find(p => p.periodo === currentFilters.periodo);
        if (periodo) {
          setSelectedPeriodo(periodo);
          isInitializedRef.current = true;
          return;
        }
      }
      
      // Buscar mes_actual por defecto
      const mesActual = periodos.find(p => p.periodo === 'mes_actual');
      if (mesActual) {
        setSelectedPeriodo(mesActual);
        isInitializedRef.current = true;
      }
    }
  }, [periodos, currentFilters]);

  // ✅ Actualizar período existente cuando cambian los periodos disponibles
  useEffect(() => {
    if (!selectedPeriodo || !periodos.length) return;

    const periodoActualizado = periodos.find(p => p.periodo === selectedPeriodo.periodo);
    
    if (periodoActualizado) {
      // Solo actualizar si las fechas cambiaron
      if (periodoActualizado.fecha_inicio !== selectedPeriodo.fecha_inicio ||
          periodoActualizado.fecha_fin !== selectedPeriodo.fecha_fin) {
        console.log('📅 Período necesita actualización silenciosa');
        setSelectedPeriodo(periodoActualizado);
      }
    }
  }, [periodos, selectedPeriodo]);

  // ✅ Sincronizar con filtros externos
  useEffect(() => {
    if (!currentFilters) return;

    const currentPeriodo = currentFilters.periodo;
    const currentInicio = currentFilters.fecha_inicio;
    const currentFin = currentFilters.fecha_fin;

    // Solo actualizar si hay un cambio real desde fuera
    if (currentPeriodo && currentPeriodo !== 'personalizado') {
      const periodo = periodos.find(p => p.periodo === currentPeriodo);
      if (periodo && periodo.periodo !== selectedPeriodo?.periodo) {
        setSelectedPeriodo(periodo);
        setShowCustomDate(false);
      }
    } else if (currentInicio && currentFin) {
      const isDifferent = 
        currentInicio !== fechaInicio || 
        currentFin !== fechaFin;
      
      if (isDifferent) {
        setFechaInicio(currentInicio);
        setFechaFin(currentFin);
        setShowCustomDate(true);
        setSelectedPeriodo(null);
      }
    }
  }, [currentFilters, periodos, selectedPeriodo, fechaInicio, fechaFin]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomDate(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleDropdown = () => {
    if (loading || periodos.length === 0) return;
    setIsOpen(!isOpen);
    if (isOpen) {
      setShowCustomDate(false);
    }
  };

  const handlePeriodoSelect = (periodo: PeriodoFiltro) => {
    console.log('📅 Período seleccionado manualmente:', periodo.label);
    setSelectedPeriodo(periodo);
    setShowCustomDate(false);
    onFilterChange({
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin: periodo.fecha_fin,
      periodo: periodo.periodo
    });
    setIsOpen(false);
  };

  const handleCustomDateApply = () => {
    if (fechaInicio && fechaFin) {
      console.log('📅 Fechas personalizadas aplicadas:', { fechaInicio, fechaFin });
      setSelectedPeriodo(null);
      onFilterChange({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        periodo: 'personalizado'
      });
      setShowCustomDate(false);
      setIsOpen(false);
    }
  };

  // Formato de fecha mejorado
  const formatDateDisplay = (date: string): string => {
    try {
      const [year, month, day] = date.split('-').map(Number);
      if (!year || !month || !day) return date;
      
      const d = new Date(year, month - 1, day);
      if (isNaN(d.getTime())) return date;
      
      const currentYear = new Date().getFullYear();
      const includeYear = d.getFullYear() !== currentYear;
      
      return d.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short',
        ...(includeYear && { year: 'numeric' })
      }).replace(/ de /g, ' ');
    } catch (error) {
      console.error('Error formateando fecha:', date, error);
      return date;
    }
  };

  const getPeriodoIcon = (periodo: string): React.ReactNode => {
    switch (periodo) {
      case 'hoy': return <Sun className="h-4 w-4" />;
      case 'semana_actual': return <CalendarDays className="h-4 w-4" />;
      case 'mes_actual': return <Calendar className="h-4 w-4" />;
      case 'trimestre_actual': return <CalendarRange className="h-4 w-4" />;
      case 'anio_actual': return <Moon className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getButtonText = (): string => {
    if (loading) return 'Cargando...';
    if (selectedPeriodo) return selectedPeriodo.label;
    if (showCustomDate || (fechaInicio && fechaFin)) {
      return `${formatDateDisplay(fechaInicio)} - ${formatDateDisplay(fechaFin)}`;
    }
    return 'Seleccionar período';
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Botón principal con botón de reset */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-between gap-2 rounded-xl",
            "bg-white dark:bg-gray-800",
            "border border-gray-300 dark:border-gray-600",
            "px-4 py-2.5",
            "text-sm font-medium text-gray-700 dark:text-gray-300",
            "hover:bg-gray-50 dark:hover:bg-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "transition-all duration-200",
            "min-w-[180px]",
            loading || periodos.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          )}
          onClick={handleToggleDropdown}
          disabled={loading || periodos.length === 0}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>{getButtonText()}</span>
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'
          )} />
        </button>

        {/* ✅✅✅ BOTÓN RESETEAR - Solo visible si NO es mes_actual ✅✅✅ */}
        {selectedPeriodo && selectedPeriodo.periodo !== 'mes_actual' && !loading && (
          <button
            type="button"
            onClick={resetToCurrentMonth}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-blue-200 dark:border-blue-800"
            title="Resetear al mes actual"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Resetear</span>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div className="absolute right-0 z-50 mt-2 w-[420px] origin-top-right rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="border-b border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Seleccionar período
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Actualización automática al cambiar de día
                </p>
              </div>
              {selectedPeriodo && (
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium px-3 py-1 rounded-full">
                  Activo
                </div>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-4">
            {/* Periodos predefinidos */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Periodos predefinidos
                </h4>
                <div className="text-xs text-gray-400">
                  Hoy: {formatDateDisplay(today)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {periodos.map((periodo) => {
                  const isSelected = selectedPeriodo?.periodo === periodo.periodo;
                  
                  return (
                    <button
                      key={periodo.periodo}
                      type="button"
                      className={cn(
                        "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                        "hover:bg-gray-50 dark:hover:bg-gray-700",
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700"
                      )}
                      onClick={() => handlePeriodoSelect(periodo)}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        isSelected
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      )}>
                        {getPeriodoIcon(periodo.periodo)}
                      </div>
                      <div className="text-left flex-1">
                        <div className={cn(
                          "text-sm font-medium",
                          isSelected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        )}>
                          {periodo.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatDateDisplay(periodo.fecha_inicio)} - {formatDateDisplay(periodo.fecha_fin)}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fechas personalizadas */}
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Fechas personalizadas
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Selecciona un rango específico
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={() => setShowCustomDate(!showCustomDate)}
                >
                  {showCustomDate ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {showCustomDate && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Fecha inicio
                      </label>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        max={fechaFin || today}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Fecha fin
                      </label>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        min={fechaInicio}
                        max={today}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleCustomDateApply}
                      disabled={!fechaInicio || !fechaFin}
                    >
                      Aplicar fechas
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        setFechaInicio('');
                        setFechaFin('');
                        setShowCustomDate(false);
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {(selectedPeriodo || (fechaInicio && fechaFin)) && (
            <div className="border-t border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                    PERIODO ACTIVO
                  </div>
                  <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    {selectedPeriodo ? selectedPeriodo.label : 'Personalizado'}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                    {formatDateDisplay(selectedPeriodo?.fecha_inicio || fechaInicio)} - {formatDateDisplay(selectedPeriodo?.fecha_fin || fechaFin)}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={() => setIsOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

DateFilterSelector.displayName = 'DateFilterSelector';