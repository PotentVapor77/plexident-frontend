// frontend/src/components/appointments/AppointmentCalendar.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import WeekView from './WeekView';
import MonthView from './MonthView';
import DayView from './DayView';
import AppointmentCreateModal from './AppointmentCreateModal';
import AppointmentDetailModal from './AppointmentDetailModal';
import ScheduleModal from './ScheduleModal';
import type { ICita, VistaCalendario } from '../../types/appointments/IAppointment';
import { useAppointment } from '../../hooks/appointments/useAppointment';
import { useAuth } from '../../hooks/auth/useAuth';
import { useNotification } from '../../context/notifications/NotificationContext';

// =============================================================================
// HELPER: visibilidad de citas por rol
// =============================================================================

/**
 * Devuelve true si el usuario puede ver todas las citas
 * (Administrador o Asistente).
 * Odontólogo solo ve las suyas → false.
 */
const usuarioVeTodasLasCitas = (rol: string): boolean =>
  rol === 'Administrador' || rol === 'Asistente';

// =============================================================================
// COMPONENTE
// =============================================================================

const AppointmentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<VistaCalendario>('week');
  const [selectedOdontologo, setSelectedOdontologo] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<ICita | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');

  const { citas, loading, fetchCitas, fetchCitasBySemana, fetchCitasByOdontologo } =
    useAppointment();
  const { notify } = useNotification();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const userRole: string = user?.rol ?? '';

  /**
   * ¿Puede este usuario filtrar por otro odontólogo?
   * Solo Administrador y Asistente tienen el selector de odontólogo.
   */
  const puedeVerTodas = usuarioVeTodasLasCitas(userRole);

  /**
   * ID del odontólogo a usar en las peticiones:
   * - Si el usuario es Odontólogo → siempre su propio ID (el backend también lo fuerza).
   * - Si es Admin/Asistente → usa el selector (puede ser '' para "todos").
   */
  const odontologoEfectivo = puedeVerTodas ? selectedOdontologo : (user?.id ?? '');

  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<string>('');
  const debounceTimerRef = useRef<number | null>(null);

  // ---- Clave única de la petición actual ----
  const getFetchKey = useCallback(() => {
    if (selectedView === 'day') {
      return `day-${odontologoEfectivo}-${format(currentDate, 'yyyy-MM-dd')}`;
    } else if (selectedView === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return `week-${odontologoEfectivo}-${format(weekStart, 'yyyy-MM-dd')}`;
    } else {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return `month-${odontologoEfectivo}-${format(firstDay, 'yyyy-MM-dd')}-${format(lastDay, 'yyyy-MM-dd')}`;
    }
  }, [currentDate, selectedView, odontologoEfectivo]);

  // ---- Carga de citas ----
  const loadAppointments = useCallback(async () => {
    // Esperar a que la autenticación esté lista y haya usuario
    if (authLoading || !isAuthenticated || !user) return;

    const currentFetchKey = getFetchKey();

    if (isFetchingRef.current) return;
    if (lastFetchParamsRef.current === currentFetchKey) return;

    try {
      isFetchingRef.current = true;
      lastFetchParamsRef.current = currentFetchKey;

      if (selectedView === 'day') {
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        if (puedeVerTodas) {
          // Admin/Asistente: puede ver el día de cualquier odontólogo
          // Si no hay selector elegido, busca todas con fetchCitasByOdontologo vacío
          // o fetchCitas con fecha específica
          if (odontologoEfectivo) {
            await fetchCitasByOdontologo(odontologoEfectivo, dateStr);
          } else {
            await fetchCitas({ fecha: dateStr, activo: true });
          }
        } else {
          // Odontólogo: su propio ID (el backend también filtra, doble seguridad)
          await fetchCitasByOdontologo(odontologoEfectivo, dateStr);
        }

      } else if (selectedView === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const dateStr = format(weekStart, 'yyyy-MM-dd');
        // El backend aplica el filtro de rol; pasamos odontologoEfectivo como hint opcional
        await fetchCitasBySemana(dateStr, odontologoEfectivo || undefined);

      } else {
        // Vista mensual
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        await fetchCitas({
          fecha_inicio: format(firstDay, 'yyyy-MM-dd'),
          fecha_fin: format(lastDay, 'yyyy-MM-dd'),
          odontologo: odontologoEfectivo || undefined,
        });
      }

    } catch (error) {
      console.error('Error en loadAppointments:', error);
      notify({
        type: 'error',
        title: 'Error al cargar citas',
        message: 'No se pudieron cargar las citas. Por favor, intente nuevamente.',
      });
      lastFetchParamsRef.current = '';
    } finally {
      isFetchingRef.current = false;
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    currentDate,
    selectedView,
    odontologoEfectivo,
    puedeVerTodas,
    fetchCitas,
    fetchCitasBySemana,
    fetchCitasByOdontologo,
    getFetchKey,
    notify,
  ]);

  // ---- Debounce para no disparar múltiples peticiones al cambiar fecha/vista ----
  const debouncedLoadAppointments = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      loadAppointments();
    }, 300);
  }, [loadAppointments]);

  useEffect(() => {
    debouncedLoadAppointments();
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [debouncedLoadAppointments]);

  // =========================================================================
  // HANDLERS DE NAVEGACIÓN
  // =========================================================================

  const handlePrevious = () => {
    if (selectedView === 'day') setCurrentDate((prev) => addDays(prev, -1));
    else if (selectedView === 'week') setCurrentDate((prev) => addDays(prev, -7));
    else setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNext = () => {
    if (selectedView === 'day') setCurrentDate((prev) => addDays(prev, 1));
    else if (selectedView === 'week') setCurrentDate((prev) => addDays(prev, 7));
    else setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleEventClick = (cita: ICita) => {
    setSelectedCita(cita);
    setShowDetailModal(true);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowCreateModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCita(null);
  };

  const handleCitaUpdate = () => {
    lastFetchParamsRef.current = '';
    loadAppointments();
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleCreateSuccess = () => {
    lastFetchParamsRef.current = '';
    loadAppointments();
  };

  /**
   * Cuando el Odontólogo cambia el selector (bloqueado para él),
   * solo Admin/Asistente pueden cambiar el odontólogo seleccionado.
   */
  const handleOdontologoChange = (id: string) => {
    if (!puedeVerTodas) return; // Odontólogo no puede cambiar el filtro
    setSelectedOdontologo(id);
    lastFetchParamsRef.current = '';
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">

      {/* Indicador contextual para el Odontólogo */}
      {!puedeVerTodas && (
        <div className="flex items-center gap-2 bg-blue-50 border-b border-blue-100 px-4 py-2 dark:bg-blue-900/20 dark:border-blue-800">
          <svg
            className="h-4 w-4 text-blue-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Mostrando únicamente tus citas programadas
          </p>
        </div>
      )}

      {/* Header */}
      <CalendarHeader
        currentDate={currentDate}
        selectedView={selectedView}
        onViewChange={setSelectedView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onCreateNew={() => setShowCreateModal(true)}
        onScheduleClick={() => setShowScheduleModal(true)}
        selectedOdontologo={puedeVerTodas ? selectedOdontologo : (user?.id ?? '')}
        onOdontologoChange={handleOdontologoChange}
        citas={citas}
        userRole={userRole}
        // Prop para que CalendarHeader sepa si mostrar el selector de odontólogo
        canFilterByOdontologo={puedeVerTodas}
      />

      {/* Vista del calendario */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full bg-white bg-opacity-90 dark:bg-gray-800">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">Cargando citas...</p>
          </div>
        ) : citas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-2">
              No hay citas programadas
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
              {puedeVerTodas
                ? 'No se encontraron citas para esta fecha'
                : 'No tienes citas programadas para esta fecha'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear nueva cita
            </button>
          </div>
        ) : (
          <>
            {selectedView === 'day' && (
              <DayView
                date={currentDate}
                citas={citas}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            )}
            {selectedView === 'week' && (
              <WeekView
                currentDate={currentDate}
                citas={citas}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            )}
            {selectedView === 'month' && (
              <MonthView
                currentDate={currentDate}
                citas={citas}
                onEventClick={handleEventClick}
                onDateClick={(date) => {
                  setCurrentDate(date);
                  setSelectedView('day');
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <AppointmentCreateModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
          initialDate={selectedDate || currentDate}
          initialTime={selectedTime}
          // Al crear, si es Odontólogo, pre-seleccionar su propio ID
          initialOdontologo={puedeVerTodas ? selectedOdontologo : (user?.id ?? '')}
        />
      )}

      {showDetailModal && selectedCita && (
        <AppointmentDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          cita={selectedCita}
          onUpdate={handleCitaUpdate}
        />
      )}

      {showScheduleModal && (
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;