// frontend/src/components/appointments/CalendarHeader.tsx

import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ClockIcon, ChartBarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { VistaCalendario, ICita } from '../../types/appointments/IAppointment';
import RecordatorioStatsModal from './RecordatorioStatsModal';
import { useState, useEffect } from 'react';
import parametersService from '../../services/parameters/parametersService';
import type { IHorario } from '../../types/parameters/IParameters';

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
  canFilterByOdontologo?: boolean;
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
  
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [horarios, setHorarios] = useState<IHorario[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // Cargar horarios al montar el componente
  useEffect(() => {
    const loadHorarios = async () => {
      try {
        setLoadingHorarios(true);
        const data = await parametersService.getHorarios();
        setHorarios(data);
      } catch (error) {
        console.error('Error cargando horarios:', error);
      } finally {
        setLoadingHorarios(false);
      }
    };

    loadHorarios();
  }, []);

  // Obtener horarios activos
  const getHorariosActivos = () => {
    return horarios.filter(h => h.activo);
  };

  // Formatear el rango de días laborales
  const getDiasLaborales = () => {
    const horariosActivos = getHorariosActivos();
    
    if (horariosActivos.length === 0) {
      return 'No configurado';
    }

    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const diasActivos = horariosActivos.map(h => dias[h.dia_semana]);

    if (diasActivos.length === 7) {
      return 'Todos los días';
    }

    if (diasActivos.length === 1) {
      return diasActivos[0];
    }

    // Si son días consecutivos, mostrar rango
    const diaIndices = horariosActivos.map(h => h.dia_semana).sort((a, b) => a - b);
    const sonConsecutivos = diaIndices.every((dia, idx) => 
      idx === 0 || dia === diaIndices[idx - 1] + 1
    );

    if (sonConsecutivos) {
      return `${dias[diaIndices[0]]} - ${dias[diaIndices[diaIndices.length - 1]]}`;
    }

    // Si no son consecutivos, mostrar todos separados por coma
    return diasActivos.join(', ');
  };

  // Obtener información de horarios (uniforme o variable)
  const getRangoHorario = () => {
    const horariosActivos = getHorariosActivos();
    
    if (horariosActivos.length === 0) {
      return { tipo: 'vacio', texto: '--:-- - --:--' };
    }

    // Verificar si todos tienen el mismo horario
    const primerApertura = horariosActivos[0].apertura;
    const primerCierre = horariosActivos[0].cierre;
    
    const todosMismoHorario = horariosActivos.every(
      h => h.apertura === primerApertura && h.cierre === primerCierre
    );

    // Si todos tienen el mismo horario, mostrar un rango simple
    if (todosMismoHorario) {
      return {
        tipo: 'uniforme',
        texto: `${primerApertura} - ${primerCierre}`,
        horariosDetallados: []
      };
    }

    // Si hay horarios diferentes, preparar lista detallada
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const horariosDetallados = horariosActivos.map(h => ({
      dia: dias[h.dia_semana],
      apertura: h.apertura,
      cierre: h.cierre,
      horario: `${h.apertura} - ${h.cierre}`
    }));

    // Agrupar días con mismo horario
    const grupos: { [key: string]: string[] } = {};
    horariosDetallados.forEach(h => {
      const key = h.horario;
      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(h.dia);
    });

    // Crear texto resumido
    const textoResumido = Object.entries(grupos)
      .map(([horario, dias]) => {
        if (dias.length === 1) {
          return `${dias[0]}: ${horario}`;
        }
        return `${dias.join(', ')}: ${horario}`;
      })
      .join(' | ');

    return {
      tipo: 'variado',
      texto: 'Horarios variables',
      horariosDetallados,
      textoResumido
    };
  };

  // Log para depuración
  console.log('🎯 CalendarHeader - Rol recibido:', userRole || '(vacío)');
  
  // Verificar si el usuario tiene permisos para ver el botón de horarios
  const canViewScheduleButton = (): boolean => {
    const restrictedRoles = ['odontologo', 'asistente'];
    
    if (!userRole) {
      console.log('⚠️ Rol vacío, mostrando botón por defecto');
      return true;
    }
    
    const roleLower = userRole.toLowerCase().trim();
    
    const isRestricted = restrictedRoles.some(restrictedRole => 
      roleLower === restrictedRole.toLowerCase()
    );
    
    console.log(`🔍 Verificando rol "${roleLower}" contra restringidos [${restrictedRoles.join(', ')}]:`, 
      isRestricted ? 'RESTRINGIDO ❌' : 'PERMITIDO ✅');
    
    return !isRestricted;
  };
  
  const shouldShowScheduleButton = canViewScheduleButton();

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

  // Filtrar citas por estado y vista
  const getCitasByEstado = (estado: string) => {
    if (!citas || citas.length === 0) return 0;

    try {
      if (selectedView === 'day') {
        return citas.filter(cita => {
          const citaDate = parseISO(cita.fecha);
          return isSameDay(citaDate, currentDate) && cita.estado === estado;
        }).length;
      } else if (selectedView === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        
        return citas.filter(cita => {
          const citaDate = parseISO(cita.fecha);
          return citaDate >= weekStart && citaDate <= weekEnd && cita.estado === estado;
        }).length;
      } else {
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

  // Obtener conteos por estado
  const citasProgramadas = getCitasByEstado('PROGRAMADA');
  const citasConfirmadas = getCitasByEstado('CONFIRMADA');
  const citasCanceladas = getCitasByEstado('CANCELADA');
  const citasNoAsistidas = getCitasByEstado('NO_ASISTIDA');
  const citasAsistidas = getCitasByEstado('ASISTIDA');
  const citasReprogramadas = getCitasByEstado('REPROGRAMADA');
  const citasEnAtencion = getCitasByEstado('EN_ATENCION');

  // Contar todas las citas (para el tooltip)
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
            {/* Botón de Estadísticas de Recordatorios */}
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
              title="Estadísticas de recordatorios"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Estadísticas
            </button>

            {/* Botón de Horarios - Solo visible si el usuario tiene permisos */}
            {shouldShowScheduleButton && (
              <button
                onClick={onScheduleClick}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ClockIcon className="w-4 h-4 mr-2" />
                Horarios
              </button>
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

        {/* Fecha y contador */}
        <div className="flex flex-col space-y-2">
          {/* Título de fecha */}
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {getDateTitle()}
          </h2>

          {/* Indicador de horarios laborales */}
          {!loadingHorarios && getHorariosActivos().length > 0 && (() => {
            const rangoHorario = getRangoHorario();
            
            return (
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{getDiasLaborales()}</span>
                </div>
                
                {/* Horarios */}
                {rangoHorario.tipo === 'uniforme' ? (
                  // Horario único para todos los días
                  <div className="flex items-center px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg border border-sky-200">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">{rangoHorario.texto}</span>
                  </div>
                ) : rangoHorario.tipo === 'variado' ? (
                  // Horarios variables con tooltip
                  <div className="group relative">
                    <div className="flex items-center px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg border border-sky-200 cursor-help">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span className="font-medium">{rangoHorario.texto}</span>
                      <span className="ml-1.5 text-sky-500 text-xs">ⓘ</span>
                    </div>
                    
                    {/* Tooltip con horarios detallados */}
                    <div className="absolute left-0 top-full mt-2 w-80 bg-white text-gray-700 text-xs rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-gray-200">
                      <div className="font-semibold mb-3 text-gray-900 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Horarios por día
                      </div>
                      <div className="space-y-2">
                        {rangoHorario.horariosDetallados?.map((h, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{h.dia}</span>
                            <span className="text-gray-600">{h.horario}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Resumen agrupado */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600">
                          {rangoHorario.textoResumido}
                        </div>
                      </div>
                      
                      {/* Flecha del tooltip */}
                      <div className="absolute left-4 -top-1 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                    </div>
                  </div>
                ) : (
                  // Sin horarios configurados
                  <div className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">{rangoHorario.texto}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Estadísticas de citas */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                {citasProgramadas} {citasProgramadas === 1 ? 'cita programada' : 'citas programadas'}
              </div>

              {(citasConfirmadas > 0 || citasCanceladas > 0 || citasNoAsistidas > 0 || 
                citasAsistidas > 0 || citasReprogramadas > 0 || citasEnAtencion > 0) && (
                <div className="group relative">
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                    + Ver más estadísticas
                  </button>
                  
                  {/* Tooltip con todas las estadísticas */}
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

      {/* Modal de Estadísticas de Recordatorios */}
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
