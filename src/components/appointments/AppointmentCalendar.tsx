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

  const { citas, loading, fetchCitas, fetchCitasBySemana, fetchCitasByOdontologo } = useAppointment();
  const { notify } = useNotification(); // Añadido

  // Obtener el usuario actual desde el contexto de autenticación
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Obtener el rol del usuario
  const userRole = user?.rol || user?.rol || '';

  // Log para depuración
  console.log('👤 Auth state:', { 
    user, 
    userRole, 
    isAuthenticated, 
    authLoading,
    userObject: user ? JSON.stringify(user) : 'No user'
  });

  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<string>('');
  const debounceTimerRef = useRef<number | null>(null);

  const getFetchKey = useCallback(() => {
    if (selectedView === 'day' && selectedOdontologo) {
      return `day-${selectedOdontologo}-${format(currentDate, 'yyyy-MM-dd')}`;
    } else if (selectedView === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return `week-${selectedOdontologo || 'all'}-${format(weekStart, 'yyyy-MM-dd')}`;
    } else {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return `month-${selectedOdontologo || 'all'}-${format(firstDay, 'yyyy-MM-dd')}-${format(lastDay, 'yyyy-MM-dd')}`;
    }
  }, [currentDate, selectedView, selectedOdontologo]);

  const loadAppointments = useCallback(async () => {
    const currentFetchKey = getFetchKey();

    if (isFetchingRef.current) {
      console.log('⏳ Ya hay una solicitud en curso, esperando...');
      return;
    }

    if (lastFetchParamsRef.current === currentFetchKey) {
      console.log('✅ Evitando llamada duplicada con mismos parámetros:', currentFetchKey);
      return;
    }

    try {
      isFetchingRef.current = true;
      lastFetchParamsRef.current = currentFetchKey;

      console.log('🔄 Iniciando carga de citas...', { fetchKey: currentFetchKey });

      if (selectedView === 'day' && selectedOdontologo) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        await fetchCitasByOdontologo(selectedOdontologo, dateStr);
      } else if (selectedView === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const dateStr = format(weekStart, 'yyyy-MM-dd');
        await fetchCitasBySemana(dateStr, selectedOdontologo || undefined);
      } else {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const params = {
          fecha_inicio: format(firstDay, 'yyyy-MM-dd'),
          fecha_fin: format(lastDay, 'yyyy-MM-dd'),
          odontologo: selectedOdontologo || undefined,
        };
        await fetchCitas(params);
      }

      console.log('✅ Carga completada exitosamente', { fetchKey: currentFetchKey, citasObtenidas: citas.length });
    } catch (error) {
      console.error('❌ Error en loadAppointments:', error);
      notify({
        type: 'error',
        title: 'Error al cargar citas',
        message: 'No se pudieron cargar las citas. Por favor, intente nuevamente.'
      });
      lastFetchParamsRef.current = '';
    } finally {
      isFetchingRef.current = false;
    }
  }, [currentDate, selectedView, selectedOdontologo, fetchCitas, fetchCitasBySemana, fetchCitasByOdontologo, getFetchKey, citas.length, notify]);

  const debouncedLoadAppointments = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      loadAppointments();
    }, 500);
  }, [loadAppointments]);

  useEffect(() => {
    console.log('📅 Cambio detectado en parámetros:', {
      vista: selectedView,
      fecha: format(currentDate, 'yyyy-MM-dd'),
      odontologo: selectedOdontologo || 'No seleccionado',
    });

    debouncedLoadAppointments();

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentDate, selectedView, selectedOdontologo, debouncedLoadAppointments]);

  const handlePrevious = () => {
    if (selectedView === 'day') {
      setCurrentDate((prev) => addDays(prev, -1));
    } else if (selectedView === 'week') {
      setCurrentDate((prev) => addDays(prev, -7));
    } else {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (selectedView === 'day') {
      setCurrentDate((prev) => addDays(prev, 1));
    } else if (selectedView === 'week') {
      setCurrentDate((prev) => addDays(prev, 7));
    } else {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

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
    console.log('📌 Cita actualizada, recargando calendario...');
    lastFetchParamsRef.current = '';
    loadAppointments();
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleCreateSuccess = () => {
    console.log('✅ Cita creada, recargando calendario...');
    lastFetchParamsRef.current = '';
    loadAppointments();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
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
        selectedOdontologo={selectedOdontologo}
        onOdontologoChange={setSelectedOdontologo}
        citas={citas}
        userRole={userRole} // Pasa el rol al CalendarHeader
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
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-2">No hay citas programadas</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
              Para esta fecha no se encontraron citas
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
          initialOdontologo={selectedOdontologo}
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