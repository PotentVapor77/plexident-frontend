// frontend/src/components/appointments/CalendarHeader.tsx

import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { VistaCalendario, ICita } from '../../types/appointments/IAppointment';
import RecordatorioStatsModal from './RecordatorioStatsModal'; // ✅ AGREGAR
import { useState } from 'react'; // ✅ AGREGAR

interface CalendarHeaderProps {
  currentDate: Date;
  selectedView: VistaCalendario;
  onViewChange: (view: VistaCalendario) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onCreateNew: () => void;
  onScheduleClick: () => void;
  selectedOdontologo: string;
  onOdontologoChange: (odontologoId: string) => void;
  citas?: ICita[];
  userRole?: string;
}

const CalendarHeader = ({
  currentDate,
  selectedView,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onCreateNew,
  onScheduleClick,
  citas = [],
  userRole = '',
}: CalendarHeaderProps) => {
  
  // ✅ AGREGAR ESTADO PARA MODAL DE ESTADÍSTICAS
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Log para depuración
  console.log('🎯 CalendarHeader - Rol recibido:', userRole || '(vacío)');
  
  // Función para verificar si el usuario tiene permisos para ver el botón de horarios
  const canViewScheduleButton = (): boolean => {
    // Roles que NO pueden ver el botón de horarios
    const restrictedRoles = ['odontologo', 'asistente'];
    
    // Si no hay rol definido, mostrar el botón (caso por defecto)
    if (!userRole) {
      console.log('⚠️ Rol vacío, mostrando botón por defecto');
      return true;
    }
    
    // Convertir a minúsculas para comparación insensible a mayúsculas
    const roleLower = userRole.toLowerCase().trim();
    
    // Verificar si el rol está en la lista de restringidos
    const isRestricted = restrictedRoles.some(restrictedRole => 
      roleLower === restrictedRole.toLowerCase()
    );
    
    console.log(`🔍 Verificando rol "${roleLower}" contra restringidos [${restrictedRoles.join(', ')}]:`, 
      isRestricted ? 'RESTRINGIDO ❌' : 'PERMITIDO ✅');
    
    return !isRestricted;
  };
  
  const shouldShowScheduleButton = canViewScheduleButton();
  
  console.log('🔘 Botón Horarios debería mostrarse:', shouldShowScheduleButton);

  const getDateTitle = () => {
    if (selectedView === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } else if (selectedView === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      
      const startFormatted = format(weekStart, "d 'de' MMMM", { locale: es });
      const endFormatted = format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: es });
      
      return `${startFormatted} al ${endFormatted}`;
    } else {
      return format(currentDate, "MMMM yyyy", { locale: es });
    }
  };

  // ✅ Función para filtrar citas por estado y vista
  const getCitasByEstado = (estado: string) => {
    if (!citas || citas.length === 0) return 0;

    try {
      if (selectedView === 'day') {
        // Vista día: contar solo citas del día actual
        return citas.filter(cita => {
          const citaDate = parseISO(cita.fecha);
          return isSameDay(citaDate, currentDate) && cita.estado === estado;
        }).length;
      } else if (selectedView === 'week') {
        // Vista semana: contar citas de la semana actual
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        
        return citas.filter(cita => {
          const citaDate = parseISO(cita.fecha);
          return citaDate >= weekStart && citaDate <= weekEnd && cita.estado === estado;
        }).length;
      } else {
        // Vista mes: contar citas del mes actual
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        
        return citas.filter(cita => {
          const citaDate = parseISO(cita.fecha);
          return citaDate >= monthStart && citaDate <= monthEnd && cita.estado === estado;
        }).length;
      }
    } catch (error) {
      console.error('Error contando citas:', error);
      return 0;
    }
  };

  // ✅ Obtener conteos por estado
  const citasProgramadas = getCitasByEstado('PROGRAMADA');
  const citasConfirmadas = getCitasByEstado('CONFIRMADA');
  const citasCanceladas = getCitasByEstado('CANCELADA');
  const citasNoAsistidas = getCitasByEstado('NO_ASISTIDA');
  const citasAsistidas = getCitasByEstado('ASISTIDA');
  const citasReprogramadas = getCitasByEstado('REPROGRAMADA');
  const citasEnAtencion = getCitasByEstado('EN_ATENCION');

  // ✅ Contar todas las citas (para el tooltip)
  const getTotalCitas = () => {
    if (!citas || citas.length === 0) return 0;

    try {
      if (selectedView === 'day') {
        return citas.filter(cita => {
          const citaDate = parseISO(cita.fecha);
          return isSameDay(citaDate, currentDate);
        }).length;
      } else if (selectedView === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        
        return citas.filter(cita => {
          const citaDate = parseISO(cita.fecha);
          return citaDate >= weekStart && citaDate <= weekEnd;
        }).length;
      } else {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        
        return citas.filter(cita => {
          const citaDate = parseISO(cita.fecha);
          return citaDate >= monthStart && citaDate <= monthEnd;
        }).length;
      }
    } catch (error) {
      console.error('Error contando total de citas:', error);
      return 0;
    }
  };

  const totalCitas = getTotalCitas();

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        {/* Elemento oculto para debug */}
        <div className="hidden">
          Debug: Rol={userRole}, MostrarHorarios={shouldShowScheduleButton.toString()}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          {/* Lado izquierdo: Navegación */}
          <div className="flex items-center space-x-4">
            {/* Botón Hoy */}
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hoy
            </button>

            {/* Navegación */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onPrevious}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onNext}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lado derecho: Acciones y vistas */}
          <div className="flex items-center space-x-4">
            {/* ✅ AGREGAR: Botón de Estadísticas de Recordatorios */}
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
              title="Estadísticas de recordatorios"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Estadísticas
            </button>

            {/* Botón de Horarios - Solo visible si el usuario tiene permisos */}
            {shouldShowScheduleButton ? (
              <button
                onClick={onScheduleClick}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                Horarios
              </button>
            ) : (
              <div className="text-xs text-gray-400 italic">
                (Horarios oculto para {userRole})
              </div>
            )}

            {/* Botón Nueva Cita */}
            <button
              onClick={onCreateNew}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nueva Cita
            </button>

            {/* Selector de Vista */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewChange('day')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedView === 'day'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => onViewChange('week')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedView === 'week'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => onViewChange('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedView === 'month'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Mes
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Fecha y contador en diseño vertical */}
        <div className="flex flex-col space-y-1">
          {/* Título de fecha */}
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {getDateTitle()}
          </h2>

          {/* ✅ Contenedor principal de estadísticas */}
          <div className="flex flex-col space-y-2">
            {/* ✅ Fila 1: Citas programadas (principal) */}
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                {citasProgramadas} {citasProgramadas === 1 ? 'cita programada' : 'citas programadas'}
              </div>

              {/* ✅ Botón para ver más estadísticas */}
              {(citasConfirmadas > 0 || citasCanceladas > 0 || citasNoAsistidas > 0 || 
                citasAsistidas > 0 || citasReprogramadas > 0 || citasEnAtencion > 0) && (
                <div className="group relative">
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                    + Ver más estadísticas
                  </button>
                  
                  {/* ✅ Tooltip con todas las estadísticas */}
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white text-gray-700 text-xs rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-gray-200">
                    <div className="font-semibold mb-3 text-gray-900">Estadísticas de citas:</div>
                    <div className="space-y-2">
                      {/* Programadas */}
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          Programadas
                        </span>
                        <span className="font-medium">{citasProgramadas}</span>
                      </div>
                      
                      {/* Confirmadas */}
                      {citasConfirmadas > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            Confirmadas
                          </span>
                          <span className="font-medium">{citasConfirmadas}</span>
                        </div>
                      )}
                      
                      {/* Canceladas */}
                      {citasCanceladas > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            Canceladas
                          </span>
                          <span className="font-medium">{citasCanceladas}</span>
                        </div>
                      )}
                      
                      {/* No Asistidas */}
                      {citasNoAsistidas > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                            No Asistidas
                          </span>
                          <span className="font-medium">{citasNoAsistidas}</span>
                        </div>
                      )}
                      
                      {/* Asistidas */}
                      {citasAsistidas > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                            Asistidas
                          </span>
                          <span className="font-medium">{citasAsistidas}</span>
                        </div>
                      )}
                      
                      {/* Reprogramadas */}
                      {citasReprogramadas > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                            Reprogramadas
                          </span>
                          <span className="font-medium">{citasReprogramadas}</span>
                        </div>
                      )}
                      
                      {/* En Atención */}
                      {citasEnAtencion > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            En Atención
                          </span>
                          <span className="font-medium">{citasEnAtencion}</span>
                        </div>
                      )}
                      
                      {/* Línea divisoria y total */}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total</span>
                          <span>{totalCitas}</span>
                        </div>
                      </div>
                    </div>
                    {/* Flecha del tooltip */}
                    <div className="absolute left-4 -top-1 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL DE ESTADÍSTICAS DE RECORDATORIOS */}
      {showStatsModal && (
        <RecordatorioStatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </>
  );
};

export default CalendarHeader;