import { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { type EventInput, type DateSelectArg, type EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import PageMeta from "../../common/PageMeta";
import esLocale from "@fullcalendar/core/locales/es";
import { useCitas } from "../../../hooks/useCitas";
import type { ICita } from "../../../types/ICita";

interface CalendarEvent extends EventInput {
  extendedProps: {
    citaData: ICita;
  };
}

interface PacienteOption {
  id: string;
  nombre: string;
}

const CitaForm: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const {
    citas,
    loading,
    selectedCita,
    citaForm,
    odontologos,
    pacientes,
    handleCreateCita,
    handleUpdateCita,
    handleDeleteCita,
    resetCitaForm,
    loadCitaData,
    updateCitaForm
  } = useCitas();

  // Función para contar citas por estado
  const contarCitasPorEstado = useCallback(() => {
    if (!citas || citas.length === 0) {
      return {
        programada: 0,
        confirmada: 0,
        realizada: 0,
        cancelada: 0,
        total: 0
      };
    }

    const conteo = {
      programada: 0,
      confirmada: 0,
      realizada: 0,
      cancelada: 0,
      total: citas.length
    };

    citas.forEach(cita => {
      switch (cita.estado) {
        case 'programada':
          conteo.programada++;
          break;
        case 'confirmada':
          conteo.confirmada++;
          break;
        case 'realizada':
          conteo.realizada++;
          break;
        case 'cancelada':
          conteo.cancelada++;
          break;
        default:
          break;
      }
    });

    return conteo;
  }, [citas]);

  const conteoCitas = contarCitasPorEstado();

  // Función CORREGIDA para formatear fecha para input
  const formatDateForInput = useCallback((dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Ajustar por la diferencia de zona horaria
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timezoneOffset);
    
    return adjustedDate.toISOString().slice(0, 16);
  }, []);

  // Función CORREGIDA para convertir a ISO para el backend
  const formatDateForBackend = useCallback((dateString: string): string => {
    if (!dateString) return '';
    
    // Convertir de datetime-local a ISO string
    const date = new Date(dateString);
    return date.toISOString();
  }, []);

  // Función para obtener color según estado (colores Google-like)
  const getEventColor = useCallback((estado: string) => {
    switch (estado) {
      case 'cancelada': return '#ea4335';
      case 'confirmada': return '#34a853';
      case 'realizada': return '#f9ab00';
      case 'programada':
      default: return '#4285f4';
    }
  }, []);

  // Función para formatear hora
  const formatTime = useCallback((dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${hours}:${minutes} ${ampm}`;
  }, []);

  // Convertir citas a eventos
  useEffect(() => {
    if (citas && citas.length > 0) {
      const calendarEvents: CalendarEvent[] = citas.map((cita: ICita) => {
        const color = getEventColor(cita.estado);
        
        const pacienteInfo = pacientes.find(p => p.id === cita.paciente) as PacienteOption | undefined;
        const odontologoInfo = odontologos.find(o => o.id === cita.odontologo);
        
        const pacienteNombre = pacienteInfo?.nombre ;
        const odontologoNombre = odontologoInfo?.nombre ;

        return {
          id: cita.id_cita?.toString() || Math.random().toString(),
          title: `${formatTime(cita.fecha_inicio)} /• ${pacienteNombre} • ${odontologoNombre}`,
          start: cita.fecha_inicio,
          end: cita.fecha_fin,
          allDay: false,
          backgroundColor: color,
          borderColor: color,
          textColor: '#ffffff',
          extendedProps: {
            citaData: cita
          }
        };
      });
      
      setEvents(calendarEvents);
    } else {
      setEvents([]);
    }
  }, [citas, pacientes, odontologos, getEventColor, formatTime]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    resetCitaForm();
    
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end || selectInfo.start);
    
    startDate.setHours(9, 0, 0, 0);
    endDate.setHours(10, 0, 0, 0);
    
    updateCitaForm('fecha_inicio', formatDateForInput(startDate.toISOString()));
    updateCitaForm('fecha_fin', formatDateForInput(endDate.toISOString()));
    updateCitaForm('estado', 'programada');
    
    openModal();
  }, [resetCitaForm, updateCitaForm, formatDateForInput, openModal]);

 // ✅ Función corregida: manejar clic en evento
const handleEventClick = useCallback((clickInfo: EventClickArg) => {
  const citaData = clickInfo.event.extendedProps.citaData as ICita;

  // Cargar datos seleccionados y mantener referencia activa
  loadCitaData(citaData);

  // Sincronizar campos de fecha con el input
  updateCitaForm('fecha_inicio', formatDateForInput(citaData.fecha_inicio));
  updateCitaForm('fecha_fin', formatDateForInput(citaData.fecha_fin));

  openModal();
}, [loadCitaData, updateCitaForm, formatDateForInput, openModal]);

  // Función CORREGIDA para agregar o actualizar evento
  // ✅ Función corregida: crear o actualizar cita
const handleAddOrUpdateEvent = useCallback(async () => {
  try {
    // Validación básica
    if (!citaForm.paciente || !citaForm.odontologo || !citaForm.motivo || !citaForm.fecha_inicio || !citaForm.fecha_fin) {
      alert('Complete todos los campos requeridos');
      return;
    }

    // Datos preparados para el backend
    const citaData = {
      paciente: citaForm.paciente,
      odontologo: citaForm.odontologo,
      fecha_inicio: formatDateForBackend(citaForm.fecha_inicio),
      fecha_fin: formatDateForBackend(citaForm.fecha_fin),
      motivo: citaForm.motivo,
      procedimiento: citaForm.procedimiento || '',
      estado: citaForm.estado,
      notas: citaForm.notas || ''
    };

    let success = false;

    // ✅ Aquí está el fix:
    // Si existe una cita seleccionada, actualiza; si no, crea nueva
    if (selectedCita && selectedCita.id_cita) {
      success = await handleUpdateCita(selectedCita.id_cita, citaData);
    } else {
      success = await handleCreateCita(citaData);
    }

    if (success) {
      closeModal();
      resetCitaForm();
    } else {
      alert('Error al guardar la cita. Verifique los datos.');
    }

  } catch (err) {
    console.error('Error al guardar cita:', err);
    alert('Error al guardar la cita. Intente nuevamente.');
  }
}, [citaForm, selectedCita, handleCreateCita, handleUpdateCita, formatDateForBackend, closeModal, resetCitaForm]);

  const handleDeleteEvent = useCallback(async () => {
    if (selectedCita && selectedCita.id_cita && window.confirm('¿Está seguro de que desea eliminar esta cita?')) {
      try {
        const success = await handleDeleteCita(selectedCita.id_cita);
        if (success) {
          closeModal();
          resetCitaForm();
        }
      } catch (err) {
        console.error('Error al eliminar cita:', err);
        alert('Error al eliminar la cita. Por favor, intente nuevamente.');
      }
    }
  }, [selectedCita, handleDeleteCita, closeModal, resetCitaForm]);

  const handleModalClose = useCallback(() => {
    closeModal();
    resetCitaForm();
  }, [closeModal, resetCitaForm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Agenda de Citas - Google Calendar Style"
        description="Calendario de citas estilo Google Calendar"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header estilo Google */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-full mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-normal text-gray-800 dark:text-white">Calendario</h1>
                </div>
                
                {/* Contadores de citas por estado */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {conteoCitas.programada} programada(s)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {conteoCitas.confirmada} confirmada(s)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {conteoCitas.realizada} realizada(s)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {conteoCitas.cancelada} cancelada(s)
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    Total: {conteoCitas.total}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    resetCitaForm();
                    updateCitaForm('estado', 'programada');
                    openModal();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Crear cita</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="max-w-full mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              headerToolbar={{
                left: "today prev,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              events={events}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              dayMaxEvents={3}
              moreLinkClick="popover"
              moreLinkContent={(args) => `+${args.num} más`}
              weekends={true}
              height="auto"
              eventDisplay="block"
              views={{
                dayGridMonth: {
                  dayMaxEvents: 3,
                  dayMaxEventRows: 3,
                  titleFormat: { year: 'numeric', month: 'long' }
                },
                timeGridWeek: {
                  dayMaxEvents: 10,
                  dayMaxEventRows: 10,
                  titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                },
                timeGridDay: {
                  dayMaxEvents: 20,
                  dayMaxEventRows: 20,
                  titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
                }
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
              buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día'
              }}
            />
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          onClose={handleModalClose}
          className="max-w-2xl p-0 overflow-hidden"
        >
          <div className="bg-white dark:bg-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-normal text-gray-800 dark:text-white">
                  {selectedCita ? "Editar cita" : "Nueva cita"}
                </h2>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paciente *
                  </label>
                  <select
                    value={citaForm.paciente}
                    onChange={(e) => updateCitaForm('paciente', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar paciente</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Odontólogo *
                  </label>
                  <select
                    value={citaForm.odontologo}
                    onChange={(e) => updateCitaForm('odontologo', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar odontólogo</option>
                    {odontologos.map((odontologo) => (
                      <option key={odontologo.id} value={odontologo.id}>
                        {odontologo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo de la consulta *
                </label>
                <input
                  type="text"
                  value={citaForm.motivo}
                  onChange={(e) => updateCitaForm('motivo', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Limpieza dental, dolor de muelas..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Procedimiento
                </label>
                <input
                  type="text"
                  value={citaForm.procedimiento || ''}
                  onChange={(e) => updateCitaForm('procedimiento', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Limpieza, extracción, empaste..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha y hora inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={citaForm.fecha_inicio}
                    onChange={(e) => updateCitaForm('fecha_inicio', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha y hora fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={citaForm.fecha_fin}
                    onChange={(e) => updateCitaForm('fecha_fin', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={citaForm.estado}
                  onChange={(e) => updateCitaForm('estado', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="programada">🟦 Programada</option>
                  <option value="confirmada">🟩 Confirmada</option>
                  <option value="realizada">🟨 Realizada</option>
                  <option value="cancelada">🟥 Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={citaForm.notas}
                  onChange={(e) => updateCitaForm('notas', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Notas adicionales sobre la cita..."
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-center">
                {selectedCita && (
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  >
                    Eliminar
                  </button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddOrUpdateEvent}
                    disabled={!citaForm.paciente || !citaForm.odontologo || !citaForm.motivo || !citaForm.fecha_inicio || !citaForm.fecha_fin}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {selectedCita ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <style>{`
        .fc .fc-toolbar {
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 400;
          color: #3c4043;
        }
        
        .fc .fc-button {
          background-color: transparent;
          border: 1px solid #dadce0;
          color: #3c4043;
          font-weight: 500;
          border-radius: 4px;
          padding: 8px 16px;
          transition: all 0.2s;
        }
        
        .fc .fc-button:hover {
          background-color: #f8f9fa;
          border-color: #dadce0;
        }
        
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #1a73e8;
          border-color: #1a73e8;
          color: white;
        }
        
        .fc .fc-day-today {
          background-color: #e8f0fe !important;
        }
        
        .fc .fc-event {
          border: none;
          border-radius: 4px;
          padding: 2px 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .fc .fc-event:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .google-event-content {
          padding: 2px 4px;
        }
        
        .event-time {
          font-size: 0.7rem;
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .event-title {
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .dark .fc .fc-toolbar-title {
          color: #e8eaed;
        }
        
        .dark .fc .fc-button {
          background-color: transparent;
          border-color: #5f6368;
          color: #e8eaed;
        }
        
        .dark .fc .fc-button:hover {
          background-color: #3c4043;
          border-color: #5f6368;
        }
        
        .dark .fc .fc-day-today {
          background-color: #2d2e30 !important;
        }
        
        .dark .fc .fc-col-header-cell {
          background-color: #2d2e30;
          color: #e8eaed;
        }
        
        .dark .fc .fc-daygrid-day {
          background-color: #202124;
          border-color: #3c4043;
        }
        
        .dark .fc .fc-daygrid-day-number {
          color: #e8eaed;
        }
      `}</style>
    </>
  );
};

// Componente para renderizar el contenido del evento
const renderEventContent = (eventInfo: { timeText?: string; event: { title: string } }) => {
  return (
    <div className="google-event-content">
      <div className="event-time" style={{
        fontSize: '0.7rem',
        fontWeight: '600',
        marginBottom: '2px'
      }}>
        {eventInfo.timeText}
      </div>
      <div className="event-title" style={{
        fontSize: '0.75rem',
        fontWeight: '500',
        lineHeight: '1.2',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {eventInfo.event.title}
      </div>
    </div>
  );
};

export default CitaForm;