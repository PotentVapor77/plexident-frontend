// frontend/src/components/appointments/WeekView.tsx
import { useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ICita } from '../../types/appointments/IAppointment';

interface WeekViewProps {
  currentDate: Date;
  citas: ICita[];
  onEventClick: (cita: ICita) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
}

const WeekView = ({ currentDate, citas = [], onEventClick, onTimeSlotClick }: WeekViewProps) => {
  // Obtener días de la semana (Lunes - Domingo)
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Generar slots de tiempo (8:00 - 19:00)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 19; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Color por ESTADO de cita
  const getStateColor = (estado: string) => {
    const colors = {
      PROGRAMADA: 'border-l-blue-500 bg-blue-50',
      CONFIRMADA: 'border-l-green-500 bg-green-50',
      ASISTIDA: 'border-l-gray-500 bg-gray-50',
      NO_ASISTIDA: 'border-l-red-500 bg-red-50',
      CANCELADA: 'border-l-orange-500 bg-orange-50',
      REPROGRAMADA: 'border-l-purple-500 bg-purple-50',
      EN_ATENCION: 'border-l-yellow-500 bg-yellow-50',
    };
    return colors[estado as keyof typeof colors] || 'border-l-gray-400 bg-gray-50';
  };

  // Obtener citas para un día específico
  const getCitasForDay = (date: Date) => {
    if (!citas || !Array.isArray(citas)) return [];
    return citas.filter((cita) => {
      try {
        const citaDate = parseISO(cita.fecha);
        return isSameDay(citaDate, date);
      } catch {
        return false;
      }
    });
  };

  // Obtener citas en un slot de tiempo específico
  const getCitasInTimeSlot = (date: Date, time: string) => {
    const dayCitas = getCitasForDay(date);
    return dayCitas.filter((cita) => {
      try {
        const citaHour = cita.hora_inicio.split(':')[0] + ':00';
        return citaHour === time;
      } catch {
        return false;
      }
    });
  };

  // Formatear hora para mostrar
  const formatSimpleTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return time;
    }
  };

  // Extraer apellido del nombre completo
  const getApellido = (nombreCompleto: string) => {
    const partes = nombreCompleto.split(' ');
    if (partes.length > 2) {
      return partes.slice(-2).join(' ');
    }
    return partes[partes.length - 1];
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* SIN header propio: CalendarHeader ya muestra la info de la semana */}

      {/* Grid del calendario */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max p-4">
          {/* Header con días de la semana */}
          <div className="sticky top-0 z-10 grid grid-cols-8 gap-2 mb-2 bg-white pb-2">
            {/* Columna vacía para horas */}
            <div className="w-20" />

            {/* Días de la semana */}
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="text-center">
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div
                  className={`
                    text-2xl font-bold mt-1
                    ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}
                  `}
                >
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Filas de slots de tiempo */}
          <div className="grid grid-cols-8 gap-2">
            {timeSlots.map((time) => (
              <div key={time} className="contents">
                {/* Columna de hora */}
                <div className="w-20 pt-2 text-right pr-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {time.substring(0, 5)}
                  </span>
                </div>

                {/* Columnas de días */}
                {weekDays.map((day) => {
                  const citasEnSlot = getCitasInTimeSlot(day, time);
                  const dayCitas = getCitasForDay(day);

                  return (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className={`
                        h-[100px] border rounded-lg p-2
                        transition-all duration-200
                        ${isToday(day) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                        hover:shadow-md
                        flex flex-col
                        overflow-hidden
                      `}
                    >
                      {/* Contador de citas del día (solo en primer slot de la columna) */}
                      {time === timeSlots[0] && dayCitas.length > 0 && (
                        <div className="absolute top-1 right-1">
                          <span
                            className={`
                              px-1.5 py-0.5 text-[10px] font-medium rounded-full
                              ${isToday(day) ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}
                            `}
                          >
                            {dayCitas.length}
                          </span>
                        </div>
                      )}

                      {/* Lista de citas */}
                      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 min-h-0">
                        {citasEnSlot.map((cita) => (
                          <div
                            key={cita.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(cita);
                            }}
                            className={`
                              ${getStateColor(cita.estado)}
                              border-l-4 rounded px-2 py-1
                              cursor-pointer flex-shrink-0
                              hover:shadow-sm transition-shadow
                              w-full
                            `}
                          >
                            {/* Hora */}
                            <p className="text-xs font-bold text-gray-900 break-words">
                              {formatSimpleTime(cita.hora_inicio)}
                            </p>

                            {/* Apellido */}
                            <p className="text-xs text-gray-800 font-medium break-words overflow-hidden">
                              {getApellido(cita.paciente_detalle.nombre_completo)}
                            </p>

                            {/* Tipo de consulta */}
                            <p className="text-[10px] text-gray-600 uppercase break-words overflow-hidden">
                              {cita.tipo_consulta_display}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Botón crear cita */}
                      {citasEnSlot.length === 0 && (
                        <button
                          onClick={() => onTimeSlotClick(day, time)}
                          className="
                            flex-1 flex items-center justify-center
                            text-gray-300 hover:text-blue-400
                            cursor-pointer transition-colors
                          "
                        >
                          <span className="text-2xl">+</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
