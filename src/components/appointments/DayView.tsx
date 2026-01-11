// frontend/src/components/appointments/DayView.tsx
import { isSameDay, parseISO } from 'date-fns';
import type { ICita } from '../../types/appointments/IAppointment';

interface DayViewProps {
  date: Date;
  citas: ICita[];
  onEventClick: (cita: ICita) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
}

const DayView = ({ date, citas, onEventClick, onTimeSlotClick }: DayViewProps) => {
  const citasDelDia = citas.filter((cita) => {
    try {
      const citaDate = parseISO(cita.fecha);
      return isSameDay(citaDate, date);
    } catch (error) {
      console.error('Error procesando fecha de cita:', cita.fecha, error);
      return false;
    }
  });

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    const time = `${hour.toString().padStart(2, '0')}:00`;

    const citasEnHora = citasDelDia.filter(cita => {
      try {
        const [citaStartHourStr, citaStartMinuteStr] = cita.hora_inicio.split(':');
        const [citaEndHourStr, citaEndMinuteStr] = cita.hora_fin.split(':');
        
        const citaStartHour = parseInt(citaStartHourStr, 10);
        const citaStartMinute = parseInt(citaStartMinuteStr, 10);
        const citaEndHour = parseInt(citaEndHourStr, 10);
        const citaEndMinute = parseInt(citaEndMinuteStr, 10);
        
        const citaStartTotalMinutes = citaStartHour * 60 + citaStartMinute;
        const citaEndTotalMinutes = citaEndHour * 60 + citaEndMinute;
        const hourStartMinutes = hour * 60;
        const hourEndMinutes = (hour + 1) * 60;
        
        const startsInThisHour = citaStartTotalMinutes >= hourStartMinutes && 
                                citaStartTotalMinutes < hourEndMinutes;
        
        const endsInThisHour = citaEndTotalMinutes > hourStartMinutes && 
                              citaEndTotalMinutes <= hourEndMinutes;
        
        const spansThisHour = citaStartTotalMinutes < hourStartMinutes && 
                             citaEndTotalMinutes > hourEndMinutes;
        
        return startsInThisHour || endsInThisHour || spansThisHour;
      } catch (error) {
        console.error('Error procesando horas de cita:', cita.hora_inicio, cita.hora_fin, error);
        return false;
      }
    });

    return { 
      time, 
      label: `${hour}:00`, 
      hour,
      citas: citasEnHora 
    };
  });

  const getStateColor = (estado: string) => {
    const colors = {
      PROGRAMADA: 'border-l-4 border-blue-500 bg-blue-50',
      CONFIRMADA: 'border-l-4 border-green-500 bg-green-50',
      ASISTIDA: 'border-l-4 border-gray-500 bg-gray-50',
      NO_ASISTIDA: 'border-l-4 border-red-500 bg-red-50',
      CANCELADA: 'border-l-4 border-orange-500 bg-orange-50',
      REPROGRAMADA: 'border-l-4 border-purple-500 bg-purple-50',
      EN_ATENCION: 'border-l-4 border-yellow-500 bg-yellow-50',
    };
    return colors[estado as keyof typeof colors] || 'border-l-4 border-gray-400 bg-gray-50';
  };

  const formatDisplayTime = (time: string) => {
    try {
      const normalizedTime = time.split(':').slice(0, 2).join(':');
      const [hours, minutes] = normalizedTime.split(':');
      const hourNum = parseInt(hours);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
    } catch {
      return time;
    }
  };

  const sortCitasByExactTime = (citasArray: ICita[]) => {
    return [...citasArray].sort((a, b) => {
      const [aHour, aMinute] = a.hora_inicio.split(':').map(Number);
      const [bHour, bMinute] = b.hora_inicio.split(':').map(Number);
      
      if (aHour !== bHour) return aHour - bHour;
      return aMinute - bMinute;
    });
  };

  const getCitaPresenceType = (cita: ICita, targetHour: number): 'starts' | 'ends' | 'spans' | 'none' => {
    try {
      const [startHourStr, startMinuteStr] = cita.hora_inicio.split(':');
      const [endHourStr, endMinuteStr] = cita.hora_fin.split(':');
      
      const startHour = parseInt(startHourStr, 10);
      const startMinute = parseInt(startMinuteStr, 10);
      const endHour = parseInt(endHourStr, 10);
      const endMinute = parseInt(endMinuteStr, 10);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      const hourStartMinutes = targetHour * 60;
      const hourEndMinutes = (targetHour + 1) * 60;
      
      if (startTotalMinutes >= hourStartMinutes && startTotalMinutes < hourEndMinutes) {
        return 'starts';
      } else if (endTotalMinutes > hourStartMinutes && endTotalMinutes <= hourEndMinutes) {
        return 'ends';
      } else if (startTotalMinutes < hourStartMinutes && endTotalMinutes > hourEndMinutes) {
        return 'spans';
      }
      
      return 'none';
    } catch {
      return 'none';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {hours.map(({ time, label, hour, citas: citasEnHora }) => {
            const citasQueInician = citasEnHora.filter(cita => 
              getCitaPresenceType(cita, hour) === 'starts'
            );
            const citasOrdenadas = sortCitasByExactTime(citasQueInician);
            
            const citasEnContinuacion = citasEnHora.filter(c => {
              const type = getCitaPresenceType(c, hour);
              return type === 'spans' || type === 'ends';
            });

            const tieneAlgunaCita = citasOrdenadas.length > 0 || citasEnContinuacion.length > 0;
            
            return (
              <div key={time} className="flex mb-4">
                {/* Hora */}
                <div className="w-20 flex-shrink-0 pr-4 text-right">
                  <span className="text-sm font-medium text-gray-500">{label}</span>
                </div>

                {/* Línea vertical */}
                <div className="relative flex-shrink-0 w-px bg-gray-200">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-300" />
                </div>

                {/* Contenido */}
                <div className="flex-1 pl-4 pb-2">
                  {tieneAlgunaCita ? (
                    <div className="space-y-2">
                      {/* 1️⃣ CITAS QUE INICIAN */}
                      {citasOrdenadas.map((cita) => (
                        <div
                          key={cita.id}
                          onClick={() => onEventClick(cita)}
                          className={`
                            ${getStateColor(cita.estado)}
                            rounded-lg p-3 cursor-pointer
                            hover:shadow-md transition-all duration-200
                            group
                          `}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {cita.tipo_consulta_display}
                              </p>
                              <p className="text-sm font-bold text-gray-900 mt-1">
                                {cita.paciente_detalle.nombre_completo}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-medium
                                ${cita.estado === 'PROGRAMADA' ? 'bg-blue-100 text-blue-800' : ''}
                                ${cita.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' : ''}
                                ${cita.estado === 'ASISTIDA' ? 'bg-gray-100 text-gray-800' : ''}
                                ${cita.estado === 'NO_ASISTIDA' ? 'bg-red-100 text-red-800' : ''}
                                ${cita.estado === 'CANCELADA' ? 'bg-orange-100 text-orange-800' : ''}
                                ${cita.estado === 'REPROGRAMADA' ? 'bg-purple-100 text-purple-800' : ''}
                                ${cita.estado === 'EN_ATENCION' ? 'bg-yellow-100 text-yellow-800' : ''}
                              `}>
                                {cita.estado_display}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {formatDisplayTime(cita.hora_inicio)} - {formatDisplayTime(cita.hora_fin)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs text-gray-600">
                            <p>👨‍⚕️ Dr(a). {cita.odontologo_detalle.nombre_completo}</p>
                            {cita.motivo_consulta && (
                              <p className="truncate" title={cita.motivo_consulta}>
                                📝 {cita.motivo_consulta}
                              </p>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click para ver detalles →
                          </p>
                        </div>
                      ))}

                      {/* 2️⃣ INDICADOR DE OCUPACIÓN */}
                      {citasEnContinuacion.map((cita) => {
                        const presenceType = getCitaPresenceType(cita, hour);
                        const isEnding = presenceType === 'ends';
                        
                        return (
                          <div
                            key={`indicator-${cita.id}`}
                            onClick={() => onEventClick(cita)}
                            className={`
                              ${getStateColor(cita.estado)}
                              rounded-md p-2 cursor-pointer
                              hover:shadow-sm transition-all duration-150
                              opacity-70 hover:opacity-100
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-base">
                                  {isEnding ? '🔴' : '⏱️'}
                                </span>
                                <div>
                                  <span className="text-gray-700 font-medium">
                                    {isEnding 
                                      ? `Hasta ${formatDisplayTime(cita.hora_fin)}` 
                                      : 'Ocupado'
                                    }
                                  </span>
                                  <span className="text-gray-500 ml-1">
                                    · {cita.paciente_detalle.nombre_completo}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">
                                Click →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // ✅ Hora vacía - botón para crear cita
                    <button
                      onClick={() => onTimeSlotClick(date, `${hour.toString().padStart(2, '0')}:00`)}
                      className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg
                               hover:border-blue-400 hover:bg-blue-50 transition-all duration-200
                               flex items-center justify-center text-gray-400 hover:text-blue-600"
                    >
                      <span className="text-sm">+ Crear cita a las {hour}:00</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
