// frontend/src/components/appointments/MonthView.tsx
import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import type { ICita } from '../../types/appointments/IAppointment';

interface MonthViewProps {
  currentDate: Date;
  citas: ICita[];
  onEventClick: (cita: ICita) => void;
  onDateClick: (date: Date) => void;
}

const MonthView = ({ currentDate, citas = [], onEventClick, onDateClick }: MonthViewProps) => {
  // Generar días del mes con días de meses adyacentes
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let currentDay = startDate;

    while (currentDay <= endDate) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }

    return days;
  }, [currentDate]);

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
    if (!citas || !Array.isArray(citas)) {
      return [];
    }
    return citas.filter((cita) => {
      try {
        const citaDate = parseISO(cita.fecha);
        return isSameDay(citaDate, date);
      } catch (error) {
        console.error('Error procesando fecha de cita:', cita.fecha, error);
        return false;
      }
    });
  };

  // Días de la semana en español
  const weekDays = useMemo(() => {
    return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  }, []);

  // Formatear hora para mostrar (sin AM/PM, formato simple)
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
    // Si tiene más de 2 palabras, los últimos son apellidos
    if (partes.length > 2) {
      return partes.slice(-2).join(' '); // Últimos dos nombres (apellidos)
    }
    return partes[partes.length - 1]; // Último nombre
  };

  return (
    <div className="h-full flex flex-col bg-white">
     
      {/* Calendario */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600 uppercase py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
              const dayCitas = getCitasForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    h-[170px] border rounded-lg p-2
                    transition-all duration-200
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isCurrentDay ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200'}
                    hover:shadow-md
                    flex flex-col
                    overflow-hidden
                  `}
                >
                  {/* Header del día */}
                  <div 
                    onClick={() => onDateClick(day)}
                    className="flex items-center justify-between mb-2 flex-shrink-0 cursor-pointer group"
                  >
                    <span
                      className={`
                        text-sm font-bold transition-colors
                        ${isCurrentDay ? 'text-blue-600' : ''}
                        ${isCurrentMonth ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-400'}
                      `}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Contador de citas */}
                    {dayCitas.length > 0 && (
                      <span className={`
                        px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0
                        ${isCurrentDay ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}
                      `}>
                        {dayCitas.length}
                      </span>
                    )}
                  </div>

                  {/* Lista de citas - SOLO SCROLL VERTICAL */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 min-h-0">
                    {dayCitas.map((cita) => (
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

                  {/* Mensaje cuando no hay citas */}
                  {dayCitas.length === 0 && isCurrentMonth && (
                    <div 
                      onClick={() => onDateClick(day)}
                      className="flex-1 flex items-center justify-center text-gray-300 hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      <span className="text-2xl">+</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthView;
